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

      var existItem = this.getItemByID(item.id)
      if (existItem) {
        let index = this.items.indexOf(existItem)
        this.items.splice(index, 1, model)
        model.update()
      } {
        // this.items.splice(this.getMaxIdLessThen(model.id), 0, model)
        this.items.push(model)
      }
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

  getItem (index) {
    return this.items[index]
  }

  getItemByID (id) {
    for (var i = this.items.length - 1; i >= 0; i--) {
      if (this.items[i].id == id) {
        return this.items[i]
      }
    }
    return null
  }

  getMaxIdLessThen (id) {
    for (var i = this.items.length; i >= 0; i++) {
      if (this.items[i].id < id) {
        return i
      }
    }
  }

  onDidNewItems (callback) {
    return this.emitter.on('did-new-items', callback)
  }
}

module.exports = ReportModel
