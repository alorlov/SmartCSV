'use babel'

import {CompositeDisposable, Emitter} from 'event-kit'

module.exports = class ThreadsPanelModel {
  constructor () {
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

  
}
