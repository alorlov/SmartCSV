'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
//$$ = require('atom-space-pen-views').$$
//{$} = require 'atom-space-pen-views'
import { $, $$ } from 'atom-space-pen-views';

class SuggestionListView extends HTMLElement {
  initialize (list) {
    this.list = list
    this.subscriptions = new CompositeDisposable()

    this.appendChild(this.list)
  }

  show () {
    this.style.display = 'block'
  }

  hide () {
    this.style.display = 'none'
  }

  isVisible () {
    return this.style.display == 'block'
  }

  // setTop (top) { this.style.top = top }
  // setLeft (left) { this.style.left = left }
}

module.exports = document.registerElement('elitecsv-autocomplte', {prototype: SuggestionListView.prototype, extends: 'div'})
