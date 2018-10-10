'use babel'

import {CompositeDisposable} from 'event-kit'

class PanelView extends HTMLElement {
  initialize (panelModel, panelTreeController) {
    this.panelModel = panelModel
    this.panelTreeController = panelTreeController

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(this.panelModel.onDidDestroy(() => this.subscriptions.dispose()))

    this.classList.add('threads-panel')

    this.subscriptions.add(this.panelModel.onDidRemoveUser((user) => this.removeUser(user)))

    var start = document.createElement('div')
    start.classList.add('start')
    start.textContent = 'start'
    this.appendChild(start)
  }

  handleEvents () {
    // this.subscriptions.add(this.panelModel.onDidRemoveUser((user) => this.removeUser(user)))
    this.onclick = (e) => {
      var entry = e.currentTarget

      if (entry.classList.contains('start')) {
        this.panelTreeController.handleStart(this.panelModel)
      }

      // switch (entry.classList.contains('start')) {
      //   case 'remove-user': this.panelTreeController.handleRemoveUser(entry.user)
      //   case 'start': this.panelTreeController.handleStart(this.panelModel)
      // }

    }
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

}

module.exports = document.registerElement('threads-panel', {prototype: PanelView.prototype, extends: 'div'})
