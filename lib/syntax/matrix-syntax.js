'use babel'

import Syntax from './syntax'

class MatrixSyntax extends Syntax {
  constructor (cell) {
    super()
    this.cell = cell
    this.usefulClasses = {}
    this.usefulClasseNames = ['CaseSyntax', 'VarsSyntax']
  }

  static tryNew () {
    return "life"
  }

  render (table) {
    row = {case: '', vars: ''}
    table.splice(0, 0, row)
    return this.cell.value
  }
}

module.exports = MatrixSyntax
