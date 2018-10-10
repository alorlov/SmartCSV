'use babel'

import {CompositeDisposable, Emitter} from 'event-kit'

module.exports = class PanelModel {
  constructor (state = {}) {
    this.name = state.name

    this.destroyed = false
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

  }

  destroy () {
    this.destroyed = true
    this.subscriptions.dispose()
    this.emitter.emit('did-destroy')
  }

  onDidDestroy (callback) {
    this.emitter.on('did-destroy', callback)
  }

  onDidRemoveUser (callback) {
    this.emitter.on('did-remove-user', callback)
  }

  getName () {
    return this.name
  }

  removeUser () {
    this.emitter.emit('did-remove-user', user)
  }
}
