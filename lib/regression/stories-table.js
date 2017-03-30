'use babel'

import Table from '../table'
import Store from '../store'

export default class StoriesTable extends Table {
  constructor(editor) {
    super(editor)
    this.stories = []
  }

  addColumn ({index}) {

  }

  addRow ({row, index}) {
    if (index == undefined) {
      add = this.store.addStory()
      add.then(story => {
        this.stories.push(story)
      })
    } else {
      add = this.store.addStoryAfter(this.stories[index-1])
    }
    add.then(story => {
      this.stories.splice(index, 1, story)
    })
  }

  removeRow ({index}) {
    this.store.removeStory(this.stories[index])
    this.stories.splice(index, 1)
  }

  setValue ({row, column, columnName, value}) {
    console.log({row, column, columnName, value})
    this.store.setStoryField(this.stories[row], columnName, value)
  }
  
  createTextEditor () {
    // textEditor.onConfirm(() => this.createThread())
  }

  buildModel () {
    this.store = new Store

    return this.store.getStories()
    .then(stories => {
      this.editor.lockModifiedStatus()

      this.editor.addColumn('name', {width: 150, align: 'left'})
      this.editor.addColumn('subject', {width: 150, align: 'left'})
      this.editor.addColumn('last run', {width: 150, align: 'left'})

      for (story of stories) {
        this.stories.push(story)
      }

      this.editor.addRows(this.stories)

      this.editor.clearUndoStack()
      this.editor.initializeAfterSetup()
      this.editor.unlockModifiedStatus()
    })
  }


}
