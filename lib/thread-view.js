'use babel'

import { CompositeDisposable } from 'event-kit';
import ThreadModel from './thread-model'

class ThreadView extends HTMLElement {
  initialize (threadModel) {
    this.threadModel = threadModel;
    this.classList.add('entry', 'thread');

    var usersEl = document.createElement('div');
    usersEl.classList.add('users');
    var users = this.threadModel.getUsers()

    for (user of users) {
      let userEl = document.createElement('div');
      userEl.classList.add('user');
      userEl.textContent = `${user.name}`;
      usersEl.appendChild(userEl)
    }

    this.appendChild(usersEl)

    return this
  }

  activate() {
    //return this.item.classList.add('btn-success');
  }

  deactivate() {
    //return this.item.classList.remove('btn-success');
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
