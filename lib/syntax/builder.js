'use babel'

import IncludeSyntax from './syntax/include-syntax'
import ParallelSyntax from './syntax/parallel-syntax'

class Builder {
  constructor (table) {
    this.table = table
    this.list = []
    this.syntaxOrder = {
      include: IncludeSyntax,
      parallel: ParallelSyntax,
    }
    this.syntaxOrder.forEach((name, syntax) => {
      syntax::addTableModel(this.table)
    })
  }

  update (cell) {
    this.syntaxOrder.forEach((name, syntax) => {
      syntax::updateList(cell)
    }
  }

  exportCsv () {
    let mapTable, csvTable = []
    this.syntaxOrder.forEach((name, syntax) => {
      mapTable = syntax.exportMap(mapTable)
    }

    for (var row in mapTable) {
      for (var cell in row) {
        csvTable = cell.exportCsv(csvTable)
      }
    }
    return csvTable
  }
}

module.exports = Builder
