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
