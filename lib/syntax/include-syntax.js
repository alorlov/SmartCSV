class IncludeSyntax extends Syntax {
  constructor (table) {
    super (table)
    
  }

  static updateList (cell) {
    for (item of this.list) {
      if (item.hasCell(cell)) {
        item.update(cell)
      }
    }

    if (this::hasPattern(cell)) {
      this.list = new IncludeSyntax(cell)
    }
  }
}

module.export = IncludeSyntax
