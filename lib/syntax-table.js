'use babel'

import Table from './table'
import MatrixSyntax from './syntax/matrix-syntax'

import TextSyntax from './syntax/text-syntax'
import VarsSyntax from './syntax/vars-syntax'

export default class SintaxTable extends Table {
  constructor(editor) {
    super(editor)
    this.syntaxMap = {
      "matrix" : new MatrixSyntax(),
      "vars" : new VarsSyntax(),
      "text" : new TextSyntax(),
    }

  }

  interpret (cell) {
    this.syntaxMap.forEach(syntax,i => {
      syntax.interpret(cell, this.syntaxMap)
    })
  }

  addColumn ({index}) {

  }

  addRow ({row, index}) {

  }

  removeRow ({index}) {

  }

  setValue (cell) {
    const {row, column, columnName, value} = cell
    console.log(row)
    this.textSyntax.interpret(cell)
  }

  createTextEditor () {
    // textEditor.onConfirm(() => this.createThread())
  }
}
