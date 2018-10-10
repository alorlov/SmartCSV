'use babel'

import {CompositeDisposable, Emitter} from 'event-kit'

module.exports =
class Sandbox {
  constructor (core) {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
  }

  onDidNotify (callback) {
    this.emitter.on('did-notify', callback)
  }

  notify (type, data) {
    console.log('notify', type)
    this.emitter.emit('did-notify', {type, data})
  }

  destroy () {
    this.emitter.dispose()
    this.subscriptions.dispose()
    this.destroyed = true
  }
}
