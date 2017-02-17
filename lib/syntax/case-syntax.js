'use babel'

import Syntax from './syntax'

class CaseSyntax extends Syntax {
  constructor () {
    super()
    this.childs = []
    this.range = new Range
  }

  static interpret ({row, column, columnName, value}, c) {
    if (c.matrix.isCurrentColumnCase() && value != '' && value != '-') {
      return new CaseSyntax()
    }
  }



  addSyntax (syntax) {
    this.childs.forEach ((i, child) => {
      if (child.position.isGreaterThan(syntax.position)) {
        this.childs.splice(i, 0, syntax)
      }
    })
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
