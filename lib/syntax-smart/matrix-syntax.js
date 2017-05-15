'use babel'

import Syntax from './syntax'
import CaseSyntax from './case-syntax'

class MatrixSyntax extends Syntax {
  constructor (cell) {
    super()
    this.columns = []
    this.cases = [new CaseSyntax()]
  }

  getInstanceName () {
    return 'matrix'
  }

  interpret ({row, column, value}, context) {
    if (row == 0) {
      this.addColumn(column, value)
    }
    if (this.isCurrentColumnCase(column)) {}
  }

  render (table) {
    row = {case: '', vars: ''}
    table.splice(0, 0, row)
    return this.cell.value
  }

  isCurrentColumnCase = (index) => this.columns[index] == 'case'
  isCurrentColumnScenario = (index) => this.columns[index] == 'scenario'
  isCurrentColumnVars = (index) => this.columns[index] == 'vars'

  getCurrentCase ({row}) {
    for (casee of this.cases) {
      if (casee.isCurrent(row)) return casee
    }
  }

  addColumn (index, value) {
    this.columns[index] = value
  }
}

module.exports = MatrixSyntax
