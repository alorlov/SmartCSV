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
    this.appendChild(this.usersEl)
    // for (user of users) {
    //   var userEl = this.addUser(user)
    // }

    this.report = document.createElement('div')
    this.report.classList.add('report')
    this.appendChild(this.report)

    this.appendChild(this.createControls())

    this.subscriptions.add(this.model.onDidNewItems(items => this.addReportItems(items)))
    this.subscriptions.add(this.model.onDidNewUser(user => this.addUser(user)))
    this.subscriptions.add(this.model.onDidRemoveUser(user => this.removeUser(user)))
    this.subscriptions.add(this.model.onDidRemoveAllUsers(() => this.removeAllUsers()))
    this.subscriptions.add(this.model.onDidChangeActive(state => this.changeActive(state)))

    return this
  }

  addUser(user) {
    var userEl = document.createElement('div');
    userEl.classList.add('user', 'inline-block');
    userEl.dataset.type = 'user-select'
    userEl.textContent = `${user.name}`;
    userEl.dataset.name = user.name
    this.usersEl.appendChild(userEl)

    var remove = document.createElement('button');
    remove.classList.add('user-remove', 'icon', 'icon-remove-close', 'btn');
    remove.dataset.type = 'user-remove'
    remove.dataset.name = user.name
    userEl.appendChild(remove)

    return userEl
  }

  removeUser (user) {
    var el = this.usersEl.querySelector(`div[data-name="${user.name}"]`)
    el.remove()
  }

  removeAllUsers () {
    this.usersEl.innerHTML = ''
  }

  createControls() {
    var el = document.createElement('div');
    el.classList.add('controls');

    var active = document.createElement('button');
    active.classList.add('active', 'icon', 'icon-pin', 'btn');
    active.dataset.type = 'active'
    el.appendChild(active)

    var play = document.createElement('button');
    play.classList.add('play', 'icon', 'icon-playback-play', 'btn');
    play.dataset.type = 'play'
    el.appendChild(play)

    var add = document.createElement('button');
    add.classList.add('add', 'icon', 'icon-repo-create', 'btn');
    add.dataset.type = 'add'
    el.appendChild(add)

    var stop = document.createElement('button');
    stop.classList.add('user-remove-all', 'icon', 'icon-remove-close', 'btn');
    stop.dataset.type = 'user-remove-all'
    el.appendChild(stop)

    return el
  }

  changeActive (state) {
    if (state) {
      this.classList.add('active')
    } else {
      this.classList.remove('active')
    }
  }

  addReportItems (items) {
    for (item of items) {
      var el = document.createElement('div')
      el.textContent = item.name
      el.dataset.type = 'report-item'
      el.dataset.id = item.getItemID()
      el.dataset.oid = item.id

      if(item.result == '0' || item.result == 'false') {
        el.classList.add('failed', 'list-item', 'text-error')
      }


      /* Stub for dublicated items */
      let existRows = this.report.querySelectorAll(`div[data-oid="${item.id}"]`)
      if(existRows.length > 0) {
        existRows[0].innerHTML = ''
        existRows[0].appendChild(el)
      } else {
        this.report.appendChild(el)
      }
      // this.report.appendChild(el)
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
