'use babel'

const {Emitter, CompositeDisposable} = require('atom')

class Commands {
  constructor (mediator) {
    this.mediator = mediator
  }

  send () {}
}

module.exports = Commands
