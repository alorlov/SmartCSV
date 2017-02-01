'use babel'

import Table from '../table'
import Store from '../store'

export default class StoriesTable extends Table {
  constructor(editor) {
    super(editor)

  }

  addColumn ({index}) {

  }

  addRow ({row, index}) {
    console.log('add story with id=x ', row, index)
    this.store.addStory(index)
    //this.editor.setCursorAtScreenPosition([index, 0])
    // set cursor at name col
    // startCellEdit
    //
    //this.regressionStore.addStory()
  }

  setValue (e) {
    console.log(e)
  }
  createTextEditor () {
    // textEditor.onConfirm(() => this.createThread())
  }

  buildModel () {
    this.store = new Store

    return this.store.getStories()
    .then(rows => {
      this.editor.lockModifiedStatus()

      this.editor.addColumn('name', {width: 150, align: 'left'})
      this.editor.addColumn('subject', {width: 150, align: 'left'})

      this.editor.addRows(rows)

      this.editor.clearUndoStack()
      this.editor.initializeAfterSetup()
      this.editor.unlockModifiedStatus()
    })
  }
}
