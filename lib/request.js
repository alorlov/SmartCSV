'use babel'

const {Emitter, CompositeDisposable} = require('atom')

export default class Request {

  constructor (params) {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()

    this.params = params
  }

  getParams () {
    return this.params
  }

  setOption (name, value) {
    this.params[name] = value
  }
}
