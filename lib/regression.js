'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import Database from './database'

export default class Regression {
  constructor(editor) {
    this.subscriptions = new CompositeDisposable
    this.editor = editor
    this.database = new Database
    this.getLargeTable()

    this.subscriptions.add( this.editor.onDidAddRow( ({index}) => this.addStory(index) ))
    this.subscriptions.add( this.editor.onDidChangeCellValue( (index) => this.setValue(index) ))
    this.subscriptions.add( this.editor.onDidAddColumn( ({column, index}) => {
      //this.addRun(index)
    }))
    return editor
  }

  setValue(row) {
    console.log(row)
    //this.database.query(`INSERT matrix
    //  SET row = ${row+1}`)
  }

  addStory(row) {
    this.database.query(`INSERT story
      SET row = ${row}`, () => {})
  }

  addRun(column) {
    query = `INSERT run
      SET column = ${column}`

    this.database.query(query)
  }

  addm() {
    query = 'Show tables'
    this.database.query(query, (err, rows, fields) => {
      if (err) throw err;

      console.log('Query result is: ', rows);
    });
  }

  getLargeTable () {
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
