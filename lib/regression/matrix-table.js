'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import path from 'path'

import Table from '../table'
import Colors from './colors'
import Syntax from '../syntax/syntax'


const stopPropagationAndDefault = f => function (e) {
  e.stopPropagation()
  e.preventDefault()
  return f && f.call(this, e)
}

export default class MatrixTable extends Table {
  constructor(editor, addons) {
    super(editor)

    this.setAddons(addons)
    this.syntax = new Syntax(this.editor)

    this.subscribeToControls()

    this.setCellRender()

    return
  }

  setAddons(addons) {
    this.libraryAutocompleteModel = addons.libraryAutocompleteModel
    this.autocomplete = addons.autocomplete
  }

  subscribeToControls () {

    this.subscriptions.add(this.tableElement.subscribeTo(this.tableElement.body, {
      'dblclick': e => {
        const {metaKey, ctrlKey, shiftKey, pageX, pageY} = e
        const position = this.tableElement.cellPositionAtScreenPosition(pageX, pageY)
        const value = this.editor.getValueAtPosition(position)
        if (e.ctrlKey && value.substr(0, 1) == '@') {
          let splitDown = !e.shiftKey ? 'down' : ''
          let uri = path.normalize(atom.workspace.getActivePaneItem().getPath())
          let callPath = this.getCallPath(uri, value)
          console.log(value, callPath)
          this.openFile(callPath, splitDown)
          stopPropagationAndDefault()
          return
        }
        this.tableElement.startCellEdit()
      }
    }))
  }

  afterSubscribeToCellTextEditor () {
    super.afterSubscribeToCellTextEditor()

    var createEditor = true

    this.cellEditor = this.tableElement.editor
    this.textEditorSubscriptions.add(this.cellEditor.onDidChange(e => {
      let text = this.cellEditor.getBuffer().getText()
      if (createEditor) {
        text = this.editor.getValueAtPosition(this.editor.getCursorPosition())
        createEditor = false
      } else if (text.substr(-1) == '@') {
        //
      } else {
        return
      }
      if (text != undefined && this.syntax.isCall(text)) {
        const call = this.syntax.getCallName(text)
        this.libraryAutocompleteModel.setPrefix(call.prefix)
        this.libraryAutocompleteModel.setDir(this.getDir())
        this.openLibraryAutocomplete(call.name)
        this.subscribeToAutocomplete()
      }
    }))
  }

  getDir () {
    const scenariosDir = path.normalize(atom.config.get('elitecsv.projectPath') + '/TestScenarios/')
    const uri = atom.workspace.getActivePaneItem().getPath()
    const projectFilename = uri.replace(scenariosDir, '')
    const dir = path.dirname(projectFilename)
    return dir
  }

  insertRequiredVars (item, letter) {
    const requiredVars = item.getRequiredVars()
    const {column, row} = this.editor.getCursorPosition()
    const columns = this.syntax.getColumnsByName([this.editor.getTable().getFirstRow()])
    var varRow = row
    for (var varName of requiredVars) {
      this.editor.addRowAt(varRow)
      this.editor.setValueAtPosition([varRow, columns.scenario], varName + ' ' + letter)
      this.editor.setValueAtPosition([varRow, columns.vars], '!')
      varRow++
    }
  }

  openLibraryAutocomplete(query) {
    this.autocomplete.update({preserveLastSearch: true})
    this.autocomplete.setQuery(query)
    this.autocomplete.show()
  }

  subscribeToAutocomplete () {
    this.autocompleteSubscriptions = new CompositeDisposable
    this.autocompleteSubscriptions.add(this.libraryAutocompleteModel.onDidConfirmSelection(item => {
      const letter = this.libraryAutocompleteModel.getLetter()
      const prefix = this.libraryAutocompleteModel.getPrefix()
      const suffix = letter != '' ? ' ' + letter : ''
      this.cellEditor.getBuffer().setText(prefix + item.getName() + suffix)
      this.tableElement.confirmCellEdit()
      if (letter != '') {
        this.insertRequiredVars(item, letter)
      }
      this.stopAutocompleteEdit()
    }))
    this.autocompleteSubscriptions.add(this.libraryAutocompleteModel.onDidCancelSelection(() => {
      this.stopAutocompleteEdit()
    }))
  }

  stopAutocompleteEdit() {
    this.autocompleteSubscriptions && this.autocompleteSubscriptions.dispose()
    delete this.autocompleteSubscriptions
  }

  changeCursorPosition(e) {
    //console.log(e)
  }

  setValue(e) {
    //console.log ('updated2')
    //this.editor.displayTable.updateScreenRows()
    //this.editor.emitter.emit('did-change-modified', true)
    //this.editor.this.emitModifiedStatusChange()
    this.editor.getTable().emitter.emit('did-change', true)
  }

  openFile(uri, splitDown = false, data = {}) {
    let split = splitDown ? 'down' : ''
    atom.workspace.open(
      uri,
      {pending: true, split: split, activatePane: false, searchAllPanes: true, data : data}
    )
    atom.views.getView(atom.workspace).focus()
  }

  getCallPath(filename, callValue) {
    let dir = path.dirname(filename)
    if (callValue.indexOf(' ')) {
      let spaced = callValue.split(' ')
      callValue = spaced[0]
    }
    let parts = callValue.split('-')
    if (parts.length > 2) {
      return path.normalize(dir + '/' + parts[2] + '.csv')
    }
  }

  setCellRender() {
    this.colors = new Colors(this.editor)
    table = this.editor.getTable()

    let columns = this.editor.getScreenColumns()
    let self = this
    for (column in columns) {
      columns[column].cellRender = function(cell, position) {
        //console.log(cell.value, self.colors.make(cell.value, position[0], position[1]))
        return self.colors.make(cell.value, position[0], position[1])
      }
    }
  }
}
