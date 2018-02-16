'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

class ThreadModel {
  constructor() {
    this.users = [{name: 'Vasia'}]
    this.exportType = 'file'
    this.emitter = new Emitter()

  }

  play () {}
  pause () {}
	addUser () {}
	removeUser () {}
	selectUser () {}

  getUsers () {
    return this.users
  }

	// addMatrix (request) {
  //   this.emitter.emit('did-send-command', request)
	// }
}

module.exports = ThreadModel
