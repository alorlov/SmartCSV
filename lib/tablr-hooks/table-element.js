'use babel'

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
      //self.editor.moveDown()
      return ret;
    }

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
