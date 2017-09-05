'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import { $, View } from 'atom-space-pen-views'

export default class AutocompleteView extends View {
  constructor(...args) {
    super(...args)
  }

  static initClass() {
    this.prototype.panel = null
  }

  static content() {
    return this.div({class: 'elitecsv-autocomplte-panel'}, () => {
      return this.div({outlet: 'panel'})
    }
    )
  }

  initialize (list) {
    this.list = list
    this.subscriptions = new CompositeDisposable()

    this.panel.css( `
      left: 100px;
      top: 100px;
    `)
    this.panel.append(this.list)
  }

  show() {
    return this.attach()
  }

  attach() {
    return this.panel
  }

  detach() {
    this.panel.destroy()
    return this.panel = null
  }
}
AutocompleteView.initClass()
// module.exports = document.registerElement('elitecsv-autocomplte', {prototype: AutocompleteView.prototype, extends: 'div'})
