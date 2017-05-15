'use babel'

import Syntax from './syntax'

class ParallelSyntax extends Syntax {
  constructor (table) {
    super()
    this.table = table
    this.repeat = 2
    this.range = new Range
  }

  hasCell (cell) {
    return this.range.containsPoint(cell.point)
  }

  render (map) {

  }
}

module.exports = ParallelSyntax
