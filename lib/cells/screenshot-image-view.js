'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
//$$ = require('atom-space-pen-views').$$
//{$} = require 'atom-space-pen-views'
import { $, $$ } from 'atom-space-pen-views';

class ScreenshotImageView extends HTMLElement {
  initialize (model) {
    this.cell = model
    this.classList.add('entry', 'list-item', 'type-screenshot-image')
    this.item = document.createElement('img')
    this.item.style.position = 'fixed'
    this.item.style.width = '83%'
    this.item.style.zIndex = 1000
    this.item.src = model.src
    this.appendChild(this.item)

    $(this).on('click', this, e => {
      $(this).remove()
    })
  }
}

module.exports = document.registerElement('elitecsv-screenshot-image', {prototype: ScreenshotImageView.prototype, extends: 'div'})
