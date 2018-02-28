'use babel'

import { Emitter, CompositeDisposable } from 'event-kit';
import ReportModelItem from './report-model-item'

class ReportModel {
  constructor () {
    this.emitter = new Emitter()
    this.items = {}
  }

  addItemsTo (name, items) {
    for (item of items) {
      this.items[item.id] = new ReportModelItem({
        name: name,
        data: item
      })
    }
    this.emitter.emit('did-new-items', items)
  }

  getItems () {
    return this.items
  }

  getItem (id) {
    return this.items[id]
  }

  onDidNewItems (callback) {
    return this.emitter.on('did-new-items', callback)
  }
}

module.exports = ReportModel
