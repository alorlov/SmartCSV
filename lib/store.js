'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import Database from './database'
import Story from './regression/story'

export default class Store {
  constructor (editor) {
    this.subscriptions = new CompositeDisposable
    this.database = new Database

    this.stories = []
  }

  /*********
    STORIES
  *********/

  getStories () {
    return this.database.query(`Select * From story Order By after`)
    .then(rows => {
      const stories = []
      for (row of rows) {
        const story = new Story(row)
        stories.push(story)
      }
      return stories
    })
  }

  getStoriesForRelease (release) {
    return this.database.query(`
      Select *
      From story_release AS sr
      LEFT JOIN stories AS s ON sr.story_id = s.id
      WHERE sr.release = '${release}'
      Order By s.name`)
    .then(rows => {
      const stories = []
      for (row of rows) {
        const story = new Story(row)
        stories.push(story)
      }
      return stories
    })
  }

  getStory (id) {
    return this.database.query(`Select * From story WHERE story_id = ${id}`)
  }

  loadStories2 () {
    return new Promise(resolve => {
      var query = this.database.query(`Select * From story Order By after`, (message, rows, fields) => {
        for (row of rows) {
          let story = new Story(row)
          this.stories.push(story)
          this.storiesIndex[row.after] = story
        }
        return resolve(this.stories)
      })
    })
  }

  getStoryAt (index) {
    return this.storiesIndex[index]
  }

  addStory () {
    return this.database.query(`Select after From story Order By story_id Desc Limit 1`)
    .then(after => {
      return this.addStoryAfter(after)
    })
  }

  addStoryAfter (story) {
    this.database.query(`INSERT story SET after = ${story.after}`)
    return this.database.query(`SELECT LAST_INSERT_ID() as id`)
    .then(rows => {
      return new Story({id: rows[0].id, after: story.after})
    })
  }

  removeStory (story) {
    this.database.query(`DELETE FROM story WHERE story_id = ${story.id}`)
    .then(result => {
      console.log(story,result)
      this.database.query(`UPDATE story SET after = ${story.after} Where after = ${story.id}`)
    })
  }

  setStoryField (story, field, value) {
    this.database.query(`UPDATE story SET ${field} = '${value}' Where story_id = ${story.id}`)
    story[field] = value
  }

  /*******
    RUNS
    *****/

  getLastRunIDForStoryRelease (story_id, release) {
    return this.database.query(`Select * From story_run Where story_id = ${story_id}`)
    .then(rows => {
      console.log('lastRunID', rows)
    })
  }

  getStoryReport (story_id, run_id) {
    return this.database.query(`Select report From story_run Where story_id = ${story_id} && run_id = ${run_id}`)
    .then(rows => {
      console.log(rows[0].report)
      return JSON.parse(rows[0].report)
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
