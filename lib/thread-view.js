'use babel'

import { CompositeDisposable } from 'event-kit';
import ThreadModel from './thread-model'

class ThreadView extends HTMLElement {
  initialize (model) {
    this.subscriptions = new CompositeDisposable()
    this.model = model
    this.classList.add('entry', 'thread')

    this.usersEl = document.createElement('div')
    this.usersEl.classList.add('users')
    var users = this.model.getUsers()

    for (user of users) {
      var userEl = this.createUser(user)
      this.usersEl.appendChild(userEl)
    }

    this.report = document.createElement('div')
    this.report.classList.add('report')

    this.appendChild(this.usersEl)
    this.appendChild(this.report)
    this.appendChild(this.createControls())

    this.subscribeToReport()
    return this
  }

  subscribeToReport() {
    this.subscriptions.add(this.model.onDidNewItems(items => this.addReportItems(items)))
  }

  createUser(user) {
    var userEl = document.createElement('div');
    userEl.classList.add('user');
    var remove = document.createElement('button'); remove.classList.add('play', 'icon', 'icon-remove-close');
    userEl.textContent = `${user.name}`;
    userEl.appendChild(remove)
    return userEl
  }

  createControls() {
    var el = document.createElement('div');
    el.classList.add('controls');

    var active = document.createElement('input');
    active.classList.add('active');
    active.type = 'radio'
    active.dataset.type = 'active'

    var play = document.createElement('button');
    play.classList.add('play', 'icon', 'icon-playback-play');
    play.dataset.type = 'play'

    var add = document.createElement('button');
    add.classList.add('add', 'icon', 'icon-repo-create');
    add.dataset.type = 'add'

    el.appendChild(active)
    el.appendChild(play)
    el.appendChild(add)
    return el
  }

  addReportItems (items) {
    for (item of items) {
      var el = document.createElement('div')
      el.textContent = item.name
      el.dataset.type = 'report-item'
      el.dataset.id = item.id
      this.report.appendChild(el)
    }
    this.report.scrollBy(0, 100)
  }

  toggle() {
    if (this.item.classList.contains('btn-success')) {
      return this.deactivate();
    } else {
      return this.activate();
    }
  }
}

export default document.registerElement('elitecsv-thread', {prototype: ThreadView.prototype, extends: 'div'});
