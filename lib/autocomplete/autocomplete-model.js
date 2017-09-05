'use babel'

import {Emitter, CompositeDisposable} from 'atom'

export default class AutocompleteModel {
  constructor() {
    this.emitter = new Emitter()

    this.items = []
    this.dir = ''
    this.prop = {}
  }

  getItems () { return this.items[this.dir] }
  setItems (items) { this.items = items }

  getDir () { return this.dir }
  setDir (text) { this.dir = text }

  getProp (name) { return this.prop[name] }
  setProp (name, value) { this.prop[name] = value }

  prepareQuery (query) {
    return query
  }

  confirmSelection (item) {
    this.emitter.emit('did-confirm-selection', item)
  }

  onDidConfirmSelection (callback) {
    return this.emitter.on('did-confirm-selection', callback)
  }

  cancelSelection (item) {
    this.emitter.emit('did-cancel-selection', item)
  }

  onDidCancelSelection (callback) {
    return this.emitter.on('did-cancel-selection', callback)
  }
}
