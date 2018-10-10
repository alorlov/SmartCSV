'use babel'

import {CompositeDisposable, Emitter} from 'event-kit'
import Sandbox from './sandbox'

class Core {
  constructor () {
    this.moduleData = {}
    this.sandbox = new Sandbox(this)
  }

  register (moduleId, creator, options) {
    this.moduleData[moduleId] = {
      creator: creator,
      instance: null,
      options: options || {}
    }
  }

  start (moduleId) {
    console.log("Starting " + moduleId)
    this.moduleData[moduleId].instance = new this.moduleData[moduleId].creator(this.sandbox, this.moduleData[moduleId].options)
    // this.moduleData[moduleId].instance.create()
  }

  stop (moduleId) {
    var data = this.moduleData[moduleId]
    if (data.instance) {
      data.instance.destroy()
      data.instance = null
    }
  }

  startAll () {
    for (var moduleId in this.moduleData) {
      if (this.moduleData.hasOwnProperty(moduleId)) {
        this.start(moduleId)
      }
    }
  }

  stopAll () {
    for (var moduleId in this.moduleData) {
      if (this.moduleData.hasOwnProperty(moduleId)) {
        this.stop(moduleId)
      }
    }
  }

  destroy () {
    this.emitter.dispose()
    this.subscriptions.dispose()
    this.destroyed = true
  }
}

module.exports = Core
