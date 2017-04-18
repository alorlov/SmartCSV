'use babel'

import Table from '../table'
import Colors from './colors'

import path from 'path'

const stopPropagationAndDefault = f => function (e) {
  e.stopPropagation()
  e.preventDefault()
  return f && f.call(this, e)
}

export default class MatrixTable extends Table {
  constructor(editor) {
    super(editor)

    this.subscriptions.add(this.tableElement.subscribeTo(this.tableElement.body, {
      'click': e => {
        const {metaKey, ctrlKey, shiftKey, pageX, pageY} = e
        const position = this.tableElement.cellPositionAtScreenPosition(pageX, pageY)
        const value = this.editor.getValueAtPosition(position)
        if (e.ctrlKey && value.substr(0, 1) == '@') {
          let splitDown = !e.shiftKey ? 'down' : ''
          let uri = path.normalize(atom.workspace.getActivePaneItem().getPath())
          let callPath = this.getCallPath(uri, value)
          console.log(value, callPath)
          this.openFile(callPath, splitDown)
        }
        stopPropagationAndDefault()
      }
    }))

    this.setCellRender()

    return
  }

  changeCursorPosition(e) {
    console.log(e)
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
