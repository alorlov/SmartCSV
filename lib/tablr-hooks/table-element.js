'use babel'

//const MyTableCellElement = require('./table-cell-element')
import Autocomplete from '../autocomplete/view'
import { CompositeDisposable, Emitter } from 'event-kit'

export default class TableElement {
  constructor (editor) {
    this.editor = editor
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

    // Autocomplete
    const autocomplete = new Autocomplete
    this.textEditorSubscriptions.add(autocomplete.onDidConfirmSelection(e => {
      console.log(e)
    }))

  }

}
