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
      this.subscriptions.add( this.editor.onDidAddColumn( e => this.addColumn(e)))
      this.subscriptions.add( this.editor.onDidChangeCellValue( e => this.setValue(e) ))
    })

  }



  addRow () {}
  addColumn () {}
  setValue () {}
}
