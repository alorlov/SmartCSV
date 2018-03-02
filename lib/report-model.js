'use babel'

import { Emitter, CompositeDisposable } from 'event-kit';
import ReportModelItem from './report-item-model'

class ReportModel {
  constructor ({name}) {
    this.name = name
    this.emitter = new Emitter()
    this.items = []
  }

  addItemsTo (name, items) {
    const newItems = []
    for (item of items) {
      var model = new ReportModelItem({
        name: name,
        data: item,
        itemID: this.items.length
      })
      this.items.push(model)
      newItems.push(model)
    }
    this.items.concat(newItems)
    this.emitter.emit('did-new-items', newItems)
  }

  getName () {
    return this.name
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
