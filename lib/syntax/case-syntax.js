'use babel'

import Syntax from './syntax'

class CaseSyntax extends Syntax {
  constructor (table, cell) {
    this.childs = []
    this.table = table
    this.range = new Range
  }

  static checkInit (table, cell) {
    if (cell.columnName == 'case' && cell.value != '' && cell.value != '-') {

      return new CaseSyntax (table, cell)
    }
  }

  addSyntax (syntax) {
    this.childs.forEach (i, child) {
      if (child.position.isGreaterThan(syntax.position)) {
        this.childs.splice(i, 0, syntax)
      }
    }
  }

  hasCell (cell) {
    return this.range.containsPoint(cell.point)
  }

  render (map) {
    let childs = th
    return this.cell.value
  }
}

module.exports = CaseSyntax
