'use babel'

import {Emitter, CompositeDisposable} from 'atom'

export default class LibraryAutocompleteModel {
  constructor() {
    this.emitter = new Emitter()

    this.items = []
    this.prefix = ''
    this.letter = ''
    this.prop = {}
  }

  getItems () { return this.items }
  setItems (items) { this.items = items }

  getPrefix () { return this.prefix }
  setPrefix (text) { this.prefix = text }

  getLetter () { return this.letter }
  setLetter (text) { this.letter = text }

  getProp (name) { return this.prop[name] }
  setProp (name, value) { this.prop[name] = value }

  prepareQuery (query) {
    const letterPos = query.lastIndexOf(' ')
    let letter = ''
    if (letterPos != -1) {
      letter = query.substr(letterPos + 1)
      query = query.substr(0, letterPos)
    }
    this.setLetter(letter)
    return query.trim()
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
