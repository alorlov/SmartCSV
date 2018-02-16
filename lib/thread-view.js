'use babel'

import { CompositeDisposable } from 'event-kit';
import ThreadModel from './thread-model'

class ThreadView extends HTMLElement {
  initialize (model) {
    this.model = model
    this.classList.add('entry', 'thread')


    var usersEl = document.createElement('div')
    usersEl.classList.add('users')
    var users = this.model.getUsers()

    for (user of users) {
      var userEl = this.createUser(user)
      usersEl.appendChild(userEl)
    }

    var report = document.createElement('div')
    report.classList.add('report')

    this.appendChild(usersEl)
    this.appendChild(report)
    this.appendChild(this.createControls())

    return this
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
    var el = document.createElement('div'); el.classList.add('controls');
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

  toggle() {
    if (this.item.classList.contains('btn-success')) {
      return this.deactivate();
    } else {
      return this.activate();
    }
  }
}

export default document.registerElement('elitecsv-thread', {prototype: ThreadView.prototype, extends: 'div'});
