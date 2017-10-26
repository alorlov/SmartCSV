'use babel'

import {CompositeDisposable} from 'event-kit'

class ThreadsPanelView extends HTMLElement {
  initialize (threadsPanel) {
    this.threadsPanel = threadsPanel

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(this.threadsPanel.onDidDestroy(() => this.subscriptions.dispose()))

    this.classList.add('threads-panel')

  }

  addUser (name) {

  }

  removeUser () {

  }

  selectUser (name) {

  }

  deselectUser (name) {}

  changeAction (name) {

  }

  addControls () {

  }
}

module.exports = document.registerElement('threads-panel', {prototype: ThreadsPanelView.prototype, extends: 'div'})
