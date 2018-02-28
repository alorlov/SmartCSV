'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

class ThreadModel {
  constructor(name) {
    this.users = [{name: 'Vasia'}]
    this.name = name
    this.exportType = 'file'
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

  }

  addReportItems (items) {
    this.emitter.emit('did-new-items', items)
  }

  play () {}
  pause () {}
	addUser () {}
	removeUser () {}
	selectUser () {}

  getUsers () {
    return this.users
  }

  getName (name) {
    return this.name
  }

  onDidNewItems (callback) {
    this.emitter.on('did-new-items', callback)
  }
	// addMatrix (request) {
  //   this.emitter.emit('did-send-command', request)
	// }
}

module.exports = ThreadModel
