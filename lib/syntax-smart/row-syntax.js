'use babel'

import Syntax from './syntax'

class RowsSyntax extends Syntax {
  constructor (cell) {
    super()
  }

  getInstanceName () {
    return 'rows'
  }

  interpret ({row, column, value}, context) {
    this.currentRow = row
  }

  hasScenarioValue (row) {
    this.rows[row]
  }


  addColumn (index, value) {
    this.columns[index] = value
  }
}

module.exports = RowsSyntax
