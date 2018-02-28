'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

export default class Button {
  constructor(obj) {
    let {type, title, tooltip, selected} = obj
    this.emitter = new Emitter()
    this.type = type
    this.title = title
    this.tooltip = tooltip
    this.selected = false

    selected ? this.activate() : this.deactivate()
  }

  onDidChange(callback) {
    this.emitter.on('did-change', callback)
  }

  toggle() {
    if (!this.selected) {
      this.activate()
    } else {
      this.deactivate()
    }
  }

  activate () {
    this.selected = true
    this.emitter.emit('did-change', this.selected)
  }

  deactivate () {
    this.selected = false
    this.emitter.emit('did-change', this.selected)
  }

  getValue () {
    return this.selected
  }
};
