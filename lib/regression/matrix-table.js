'use babel'

import Table from '../table'

export default class MatrixTable extends Table {
  constructor(editor) {
    super(editor)
    return
    table = editor.getTable()

    this.subscriptions.add(editor.onDidChangeModified(() => {
      console.log ('updated')
      editor.displayTable.updateScreenRows()
    }))
    let columns = editor.getScreenColumns()
    for (column in columns) {
      columns[column].cellRender = function(cell, position) {
        if(cell.value === undefined) {
          cell.value = ''
        }
        if(!cell.value) {
          return ''
        }
        let isCase = table.getValueAtPosition ([position[0], 0])
        let isVar = table.getValueAtPosition ([position[0], 2])
        if (isVar === undefined) isVar = ''
        if (isCase === undefined) isCase = ''

        if (isCase != '' && isCase != '-') {
          console.log (1,isCase, isVar, position)
          return `<div style='color: yellow'>${cell.value}</div>`
        } else if (isVar != '') {
          console.log (2,isCase, isVar, position)
          return `<div style='color: green'>${cell.value}</div>`
        } else {
          console.log (3,isCase, isVar, position)
          return `${cell.value}`
        }
      }
    }
  }

  changeCursorPosition(e) {
  }


}
