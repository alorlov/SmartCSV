'use babel'

import Table from '../table'
import RegressionStore from '../store'

export default class ThreadsTable extends Table {
  constructor(editor) {
    super(editor)
    this.regressionStore = new RegressionStore
  }

  addColumn ({column, index}) {
    //this.tableElement = atom.views.getView(this.editor)
    let col = this.tableElement.headerCells[index]
    console.log('col', column, index, col)
    console.log(this.tableElement.headerCells)
    this.tableElement.startColumnEdit({
      target: {parentNode: {parentNode: col}},
      pageX: 0,
      pageY: 0
    })
    this.subscribeToColumnTextEditor()
  }

  createTextEditor () {
    // textEditor.onConfirm(() => this.createThread())
  }

  buildModel () {
    const table = this.editor

    table.lockModifiedStatus()
    table.addColumn('name', {width: 150, align: 'right'})
    table.addColumn('value', {width: 150, align: 'center', grammarScope: 'source.js'})
    for (let i = 0; i <= 10; i++) {
      table.addColumn(undefined, {width: 150, align: 'left'})
    }

    const rows = new Array(15).fill().map((v, i) => {
      return [`row${i}`].concat(new Array(101).fill().map((vv, j) =>
        j % 2 === 0
          ? (i % 2 === 0 ? 'yes' : 'no')
          : Math.random() * 100
      ))
    })

    table.addRows(rows)

    table.clearUndoStack()
    table.initializeAfterSetup()
    table.unlockModifiedStatus()

    return table
  }
}
