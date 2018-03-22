'use babel'

const fs = require('fs')
const xml2js = require('xml2js')
const csv = require('csv')

import Database from './database'
import Story from './regression/story'
import Store from './store'

export default class JiraTable {
  constructor (mediator) {
    this.mediator = mediator
    this.table = null
  }

  applyTable (path) {
    return new Promise((resolve, reject) => {
      this.testXML(path)
      .then((rawObject) => {
        console.log(rawObject)
        this.table = this.parseJiraTable(rawObject.rss.channel["0"].item)
        resolve()

        // let releasesPath = '/home/alexander.orlov/elite/TestScenarios/ReleasesResults/'
        // const csv = require('csv')
        // this.readCsv(releasesPath + '1.26.csv')
        // .then(data => {
        // })
      })
    })
  }

  parseJiraTable (items) {
    const map = new Map()
    for (item of items) {
      var myItem = {
        summary: item.summary[0],
        label: item.label != null? item.label[0] : null
      }
      map.set(item.key["0"]._, myItem)
    }
    return map
  }

  updateStoriesStore () {
    const store = new Store()
    store.getStories()
    .then((stories) => {
      for (dbStory of stories) {
        var jiraItem = this.table.get(dbStory.name.replace('/', '-'))

        if (!jiraItem) continue

        if(dbStory.title == '') {
          console.log(jiraItem.summary)
          store.setStoryField(dbStory, 'title', jiraItem.summary)
        }
        // if (dbStory.tags == '' && jiraItem.label != null) {
        //   console.log(jiraItem.label)
        //   store.setStoryField(dbStory, 'tags', jiraItem.label)
        // }
      }
    })
  }

  testXML (uri) {
    return new Promise((resolve, reject) => {
      let parser = new xml2js.Parser()

      fs.readFile(uri, (err, data) => {
        if (err) throw new Error(err)
        parser.parseString(data, (err2, rawObject) => {
          if (err2) throw new Error(err2)
          resolve(rawObject)
        })
      })
    })
  }

  readCsv (path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) throw new Error(err)
        const parser = csv.parse(data, (err, data) => {
          resolve(data)
        })
      })
    })
  }

  saveAs(data, path) {
    return new Promise((resolve, reject) => {
      csv.stringify(data, {}, (err, data) => {
        if (err) { return reject(err) }

        const fs = require('fs')
        fs.writeFile(path, data, (err,data) => {
          resolve()
        })
      })
    })
  }
}
