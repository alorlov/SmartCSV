'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

class ThreadModel {
  constructor(name) {
    this.users = []
    this.name = name
    this.exportType = 'file'
    this.emitter = new Emitter()
  }

  destroy () {
    // if (this.destroyed) { return }
    this.users = []
    this.emitter.emit('did-destroy', this)
    this.emitter.dispose()
    // this.destroyed = true
  }

  addReportItems (items) {
    this.emitter.emit('did-new-items', items)
  }

  play () {}
  pause () {}

	addUser (user) {
    this.users.push(user)
    this.emitter.emit('did-new-user', user)
  }

  getUser(name) {
    return this.users.find(el => {
      return el.name == name
    })
  }

	removeUser (name) {
    const user = this.getUser(name)
    this.users.splice(this.users.indexOf(user), 1)
    this.emitter.emit('did-remove-user', user)
  }

	removeAllUsers () {
    this.users = []
    this.emitter.emit('did-remove-all-users')
  }

	selectUser (name) {
    const user = this.getUser(name)
    this.emitter.emit('did-get-on-top', user)
  }

  getUsers () {
    return this.users
  }

  getName () {
    return this.name
  }

  setActive(state) {
    this.active = state
    this.emitter.emit('did-change-active', state)
  }

  onDidDestroy (callback) {
    this.emitter.on('did-destroy', callback)
  }

  onDidChangeActive (callback) {
    this.emitter.on('did-change-active', callback)
  }

  onDidNewItems (callback) {
    this.emitter.on('did-new-items', callback)
  }

  onDidNewUser (callback) {
    this.emitter.on('did-new-user', callback)
  }

  onDidRemoveUser (callback) {
    this.emitter.on('did-remove-user', callback)
  }

  onDidRemoveAllUsers (callback) {
    this.emitter.on('did-remove-all-users', callback)
  }

  onDidGetOnTop (callback) {
    this.emitter.on('did-get-on-top', callback)
  }


	// addMatrix (request) {
  //   this.emitter.emit('did-send-command', request)
	// }
}

module.exports = ThreadModel
