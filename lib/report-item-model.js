'use babel'

import { Emitter, CompositeDisposable } from 'event-kit';

export default class ReportModelItem {
  constructor ({name, data, itemID}) {
    this.emitter = new Emitter()
    this.scenarioName = name
    this.itemID = itemID
    Object.assign(this, data)
    this.data = data
    this.updated = 0
  }

  getScenarioName () {
    return this.scenarioName
  }

  getItemID () {
    return this.itemID
  }

  getRow () {
    return this.data.row
  }

  getColumn () {
    return this.data.col
  }

  update () {
    this.updated++
  }

  checkUpdated (prevValue) {
    return prevValue == this.updated
  }
}
