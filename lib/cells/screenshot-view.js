'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
//$$ = require('atom-space-pen-views').$$
//{$} = require 'atom-space-pen-views'
import { $, $$ } from 'atom-space-pen-views';

class ScreenshotView extends HTMLElement {
  initialize (model) {
    this.cell = model
    this.classList.add('entry', 'list-item', 'type-screenshot')
    // this.style.display = 'block'
    this.item = document.createElement('span')
    this.item.textContent = this.cell.id
    this.item.title = this.cell.comment
    this.appendChild(this.item)
  }
}

module.exports = document.registerElement('elitecsv-screenshot-link', {prototype: ScreenshotView.prototype, extends: 'div'})
