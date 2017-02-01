'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import Database from './database'
import Story from './regression/story'

export default class Store {
  constructor (editor) {
    this.subscriptions = new CompositeDisposable
    this.database = new Database

    this.stories = this.loadStories()
  }

  loadStories () {
    return new Promise(resolve => {
      var stories = []
      var query = this.database.query(`Select * From story Order By after`, (message, rows, fields) => {
        for (row of rows) {
          stories.push(new Story(row))
        }
        return resolve(stories)
      })
    })
  }

  getStories () {
    return this.stories
  }

  addStoryAfter (storyID) {
    let oldStoryID = this.getStoryAfter(storyID)
    let newStoryID = this.addStory(storyID)
    this.setOrderAfter(newStoryID)
  }

  addStory (afterStoryID) {
    console.log(afterStoryID)
    this.database.query(`INSERT story SET after = ${afterStoryID}`, (affectedRows) => {
      return affectedRows
    })
  }

  addRun (column) {
    query = `INSERT run
      SET column = ${column}`

    this.database.query(query)
  }

  addm () {
    query = 'Show tables'
    this.database.query(query, (err, rows, fields) => {
      if (err) throw err;

      console.log('Query result is: ', rows);
    });
  }


}
