'use babel'

import {Emitter, CompositeDisposable} from 'atom'
import Autocomplete from './autocomplete'

export default class LibraryAutocompleteModel extends Autocomplete{
  constructor(model) {
    super(model)
    this.emitter = new Emitter()

    this.items = []
    this.prefix = ''
    this.letter = ''
    this.dir = ''
    this.prop = {}
  }

  getItems () { return this.items[this.dir] }
  setItems (items) { this.items = items }

  getPrefix () { return this.prefix }
  setPrefix (text) { this.prefix = text }

  getLetter () { return this.letter }
  setLetter (text) { this.letter = text }

  getDir () { return this.dir }
  setDir (text) { this.dir = text }

  getProp (name) { return this.prop[name] }
  setProp (name, value) { this.prop[name] = value }

  prepareQuery (query) {
    const letterPos = query.lastIndexOf(' ')
    let letter = ''
    let insertOptionalVars = false
    if (letterPos != -1) {
      letter = query.substr(letterPos + 1)
      if (letter.indexOf('*') != -1) {
        insertOptionalVars = true
        letter = letter.replace('*', '')
      }
      query = query.substr(0, letterPos)
    }

    this.setLetter(letter)
    this.setProp('insertOptionalVars', insertOptionalVars)

    return query.trim()
  }

  confirmSelection (item) {
    this.emitter.emit('did-confirm-selection', item)
  }

  onDidConfirmSelection (callback) {
    return this.emitter.on('did-confirm-selection', callback)
  }

  cancelSelection (item) {
    this.emitter.emit('did-cancel-selection', item)
  }

  onDidCancelSelection (callback) {
    return this.emitter.on('did-cancel-selection', callback)
  }

  insertVars (item, letter, optional) {
    const requiredVars = item.getRequiredVars()
    const {column, row} = editor.getCursorPosition()
    const columns = syntax.getColumnsByName([editor.getTable().getFirstRow()])
    var varRow = row
    for (var varName of requiredVars) {
      editor.addRowAt(varRow)
      editor.setValueAtPosition([varRow, columns.scenario], varName + ' ' + letter)
      editor.setValueAtPosition([varRow, columns.vars], '"')
      varRow++
    }

    if (!optional) {
      return
    }

    const optionalVars = item.getOptionalVars()
    for (var varName of optionalVars) {
      editor.addRowAt(varRow)
      editor.setValueAtPosition([varRow, columns.scenario], varName + ' ' + letter)
      editor.setValueAtPosition([varRow, columns.vars], '!')
      varRow++
    }
  }

  insertCall () {

  }

  subscribe (editor, syntax, cellEditor) {
    this.disposables.add(this.subscribeToCellTextEditor(cellEditor))
    this.disposables.add(this.onDidConfirmSelection(item => {
      const letter = this.getLetter()
      const prefix = this.getPrefix()
      const suffix = letter != '' ? ' ' + letter : ''
      this.cellEditor.getBuffer().setText(prefix + item.getName() + suffix)
      //this.tableElement.confirmCellEdit()
      if (letter != '') {
        let optionalVars = this.getProp('insertOptionalVars')
        this.insertVars(item, letter, optionalVars, editor, syntax)
      }
      this.destroy()
    }))
    this.disposables.add(this.onDidCancelSelection(() => {
      this.destroy()
    }))
  }
}
