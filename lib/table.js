'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import TableElement from './tablr-hooks/table-element'

export default class Table {
  constructor(editor) {
    this.subscriptions = new CompositeDisposable
    this.editor = editor
    this.tableElement = new TableElement(this.editor)

    this.buildModel()
    .then(() => {
      this.subscriptions.add( this.editor.onDidAddRow( e => this.addRow(e)))
      this.subscriptions.add( this.editor.onDidRemoveRow( e => {this.removeRow(e)}))
      this.subscriptions.add( this.editor.onDidAddColumn( e => this.addColumn(e)))
      this.subscriptions.add( this.editor.onDidChangeCellValue( e => this.setValues(e) ))
    })

  }

  addRow () {}
  removeRow () {}
  addColumn () {}
  setValue () {}

  buildModel () {
    return new Promise(resolve => resolve())
  }

  getColByName (name) {
    return this.editor.getRow(0).indexOf(name)
  }

  getColName (index) {
    return this.editor.getValueAtPosition([0, index])
  }

  setValues (e) {
    console.log(e)
    const columns = this.editor.getColumns()
    if (e.screenPosition != null) {
    } else if (e.screenPositions != null) {
      e.positions.forEach((v,i) => {
        console.log(i,v)
        this.setValue({
          row: v.row,
          column: v.column,
          columnName: columns[v.column],
          value: e.newValues[i]
        })
      })
    } else if (e.screenRange != null) {
      for (var i = e.range.start.row, i2 = 0; i < e.range.end.row; i++, i2++) {
        for (var j = e.range.start.column, j2 = 0; j < e.range.end.column; j++, j2++) {
          this.setValue({
            row: i,
            column: j,
            columnName: columns[j],
            value: e.newValues[i2][j2]
          })
        }
      }
    }
  }
}
