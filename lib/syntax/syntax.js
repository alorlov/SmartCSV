'use babel'

const {Emitter, CompositeDisposable} = require('atom')

class Syntax {

  addUseful (syntax) {
    for (syntaxName of this.usefulClasseNames) {
      if (syntax instanceof syntaxName) {
        this.usefulClasses[syntaxName] = syntax
        syntax.onDidDestroy(() => this.usefulClasses.remove(syntaxName))
      }
    }
  }
  /*
  hasCell (cell)
  static hasPattern ()
  render ()
  update ()
  static updateList (cell)

  static addTableModel(table) {
    Syntax.table = table
  }*/
}

module.exports = Syntax
