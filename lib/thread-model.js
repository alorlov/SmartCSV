'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

class ThreadModel {
  constructor({name, scenario}) {
    this.users = []
    this.name = name
    this.scenario = scenario
    this.exportType = 'file'
    this.emitter = new Emitter()
    this.requests = []

    this.active = null
    this.paused = false
    this.stopped = false
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

  isStopped () {
    return this.stopped
  }

  pause () {
    this.paused = true
    this.emitter.emit('did-pause')
  }

  play () {
    this.paused = false
    this.stopped = false
    this.emitter.emit('did-play')
  }

  toggleRun () {
    if (this.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  stop () {
    this.stopped = true
    this.emitter.emit('did-stop')
  }

  stopPassed () {
    this.stopped = true
    this.emitter.emit('did-stop-passed')
  }

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

  onDidPause (callback) {
    this.emitter.on('did-pause', callback)
  }

  onDidPlay (callback) {
    this.emitter.on('did-play', callback)
  }

  onDidStop (callback) {
    this.emitter.on('did-stop', callback)
  }

  onDidStopPassed (callback) {
    this.emitter.on('did-stop-passed', callback)
  }


	// addMatrix (request) {
  //   this.emitter.emit('did-send-command', request)
	// }
}

module.exports = ThreadModel
