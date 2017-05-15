'use babel'

const {Emitter, CompositeDisposable} = require('atom')

class Syntax {

  constructor () {
    this.successor = {}
    this.context = {}
  }

  getInstanceName () { return 'Unspecified'}

  setSuccessor (successor) {
    this.addToContext(successor.getInstanceName(), successor)
    successor.addContext(this.context)
    return this.successor = successor
  }

  addToContext (name, item) {
    this.context[name] = item
  }

  addContext (context) {
    this.context = context
  }

  interpret (context) {}
  render (context) {}

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
