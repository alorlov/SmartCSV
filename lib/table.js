'use babel'

// const MyTableCellElement = require('./tablr-hooks/table-cell-element')
import { CompositeDisposable, Emitter } from 'event-kit'
// import TableElement from './tablr-hooks/table-element'

export default class Table {
  constructor(editor) {
    this.subscriptions = new CompositeDisposable
    this.editor = editor

    this.tableElement = this.tableElement()
    //this.tableElement = new TableElement(this.editor)

    this.buildModel()
    .then(() => {
      this.subscriptions.add( this.editor.onDidAddRow( e => this.addRow(e)))
      this.subscriptions.add( this.editor.onDidRemoveRow( e => {this.removeRow(e)}))
      this.subscriptions.add( this.editor.onDidAddColumn( e => this.addColumn(e)))
      this.subscriptions.add( this.editor.onDidChangeCellValue( e => this.setValues(e) ))
      this.subscriptions.add( this.editor.onDidChangeCursorPosition( e => this.changeCursorPosition(e)))

    })

  }

  addRow () {}
  removeRow () {}
  addColumn () {}
  setValue () {}
  changeCursorPosition () {}

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
        this.setValue({
          row: v.row,
          column: v.column,
          columnName: columns[v.column],
          value: e.newValues[i]
        })
      })
    } else if (e.screenRange != null) {
      for (var i = e.range.start.row, i2 = 0; i < e.range.end.row; i++, i2++) {
        let valuesRow = e.newValues.indexOf(i2) != -1 ? e.newValues[i2] : []
        for (var j = e.range.start.column, j2 = 0; j < e.range.end.column; j++, j2++) {
          let newValue = valuesRow.indexOf(j2) != -1 ? valuesRow[j2] : ''
          this.setValue({
            row: i,
            column: j,
            columnName: columns[j],
            value: newValue
          })
        }
      }
    }
  }

  tableElement () {
    this.table = atom.views.getView(this.editor)
    var self = this

    var startCellEdit = this.table.startCellEdit
    this.table.startCellEdit = function() {
      var ret = startCellEdit.apply(this, arguments)
      return ret;
    }

    var subscribeToCellTextEditor = this.table.subscribeToCellTextEditor
    this.table.subscribeToCellTextEditor = function() {
      self.afterSubscribeToCellTextEditor()
      var ret = subscribeToCellTextEditor.apply(this, arguments)
      return ret;
    }

    var stopEdit = this.table.stopEdit
    this.table.stopEdit = function() {
      var ret = stopEdit.apply(this, arguments)
      self.textEditorSubscriptions && self.textEditorSubscriptions.dispose()
      return ret;
    }

    var confirmCellEdit = self.table.confirmCellEdit
    this.table.confirmCellEdit = function() {
      var ret = confirmCellEdit.apply(this, arguments)
      //self.editor.displayTable.updateScreenRows()
      return ret;
    }

    // this.table.initCellsPool(MyTableCellElement, this.table.tableCells)
    // this.table.cellsClass = MyTableCellElement
    // console.log(this.table.cellsClass)
    // var createdCallback = this.table.createdCallback
    // this.table.createdCallback = function() {
    //   console.log(1)
    //   self.createdCallback()
    //   console.log(2)
    //   var ret = createdCallback.apply(this, arguments)
    //   return ret;
    // }

    return this.table
  }

  afterSubscribeToCellTextEditor () {
    this.textEditorSubscriptions = new CompositeDisposable()
    this.textEditorSubscriptions.add(atom.commands.add('tablr-editor atom-text-editor[mini]', {
      'core:confirm': (e => {
        this.table.moveDownInSelection()
        return false
      })
    }))
  }
}
