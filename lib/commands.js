'use babel'

const {Emitter, CompositeDisposable} = require('atom')

class Commands {
  constructor () {
    this.emitter = new Emitter()
  }

  send () {}
}

module.exports = Commands
