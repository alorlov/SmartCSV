'use babel'

import Syntax from './syntax'

class VarsSyntax extends Syntax {
  constructor (table) {
    super (table)
    this.varBlocks = []
  }

  add (syntax) {
    this.varBlocks.push(syntax)
  }

  getInstanceName () {
    return 'vars'
  }

  interpret ({row, column, value}, c) {

    if (c.matrix.hasScenarioValue(row) && c.matrix.hasVarValue(row)) {
      this.addColumn(column, value)
      return true
    }
  }

  render () {
    for (item of this.varBlocks) {
      item.render()
    }
  }

  update (cell) {
    this.emitter.emit('did-update')
  }

  onDidUpdate (callback) {
    return this.emitter.on('did-update', callback)
  }
}

module.export = VarsSyntax
