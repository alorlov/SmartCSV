'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

class ThreadModel {
  constructor() {
    this.users = [{name: 'Vasia'}]
    this.exportType = 'file'
    this.emitter = new Emitter()
    this.commands = null
  }

  play () {}
  pause () {}
	addUser () {}
	removeUser () {}
	selectUser () {}

  getUsers () {
    return this.users
  }

  setCommands (commands) {
    this.commands = commands
  }

	addMatrix (request) {
    let object = request
    this.commands.send(object)
	}
}

module.exports = ThreadModel
