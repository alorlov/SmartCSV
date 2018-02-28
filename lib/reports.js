'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import ReportModel from './report-model'

class Reports {
  constructor(mediator) {
    this.mediator = mediator
    this.reports = {}

    // this.mediator.subscribe('commands-new-report', ({name, items}) => addItems(name, items))
  }

  createReport (name) {
    var model = new ReportModel()
    this.reports[name] = model
    return model
  }

  getReport (name) {
    if (!this.reports[name]) { throw new Error(`ReportModel did not initialized for key "'${name}'"`) }
    return this.reports[name]
  }

  // addItemsTo (name, items) {
  //   this.getReport(name).addItemsTo(name, items)
  // }
}

module.exports = Reports
