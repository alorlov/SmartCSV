'use babel'

class Syntax {
  constructor (table) {
    static table = table
    static list = []
  }

  add (cell)
  hasCell (cell)
  static hasPattern ()
  exportCsv ()
  update ()
  static updateList (cell)

  static addTableModel(table) {
    this.table = table
  }
}

module.exports = Syntax
