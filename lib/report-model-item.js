'use babel'

import { Emitter, CompositeDisposable } from 'event-kit';

export default class ReportModelItem {
  constructor ({name, data}) {
    this.emitter = new Emitter()
    // this.threadName = threadName
    this.scenarioName = name
    Object.assign(this, data)
    // this.data = data
  }

  getName () {
    return this.scenarioName
  }

  getRow () {
    return this.data.row
  }

  getColumn () {
    return this.data.col
  }
}
