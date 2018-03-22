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

    this.play()

    this.subscriptions.add(this.model.onDidNewItems(items => this.addReportItems(items)))
    this.subscriptions.add(this.model.onDidNewUser(user => this.addUser(user)))
    this.subscriptions.add(this.model.onDidRemoveUser(user => this.removeUser(user)))
    this.subscriptions.add(this.model.onDidRemoveAllUsers(() => this.removeAllUsers()))
    this.subscriptions.add(this.model.onDidChangeActive(state => this.changeActive(state)))
    this.subscriptions.add(this.model.onDidDestroy(() => this.destroy()))
    this.subscriptions.add(this.model.onDidPause(() => this.pause()))
    this.subscriptions.add(this.model.onDidPlay(() => this.play()))
    this.subscriptions.add(this.model.onDidStop(() => this.stop()))
    this.subscriptions.add(this.model.onDidStopPassed(() => this.stopPassed()))

    return this
  }

  destroy () {
    // this.subscriptions && this.subscriptions.dispose()
    this.parentNode && this.parentNode.removeChild(this)
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

    this.controlActive = active = document.createElement('button');
    active.classList.add('active', 'icon', 'icon-pin', 'btn');
    active.dataset.type = 'active'
    el.appendChild(active)

    this.controlAdd = add = document.createElement('button');
    add.classList.add('add', 'icon', 'icon-repo-create', 'btn');
    add.dataset.type = 'add'
    el.appendChild(add)

    this.controlPlay =  play = document.createElement('button');
    play.classList.add('icon', 'icon-playback-play', 'btn');
    play.dataset.type = 'play'
    el.appendChild(play)

    this.controlStop =  stop = document.createElement('button');
    stop.classList.add('icon', 'icon-primitive-square', 'btn');
    stop.dataset.type = 'stop'
    el.appendChild(stop)

    this.controlClose = close = document.createElement('button');
    close.classList.add('user-remove-all', 'icon', 'icon-remove-close', 'btn');
    close.dataset.type = 'user-remove-all'
    el.appendChild(close)

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
      el.dataset.id = item.id//item.getItemID()
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
    this.report.scrollBy(0, 1000*32)
  }

  removeControlClasses() {
    this.controlPlay.classList.remove('play', 'pause')
    this.controlStop.classList.remove('stop')
  }

  pause () {
    this.removeControlClasses()
    this.controlPlay.classList.add('pause')
  }

  play () {
    this.removeControlClasses()
    this.controlPlay.classList.add('play')
  }

  stop () {
    this.removeControlClasses()
    this.controlStop.classList.add('stop')
  }

  stopPassed () {
    this.removeControlClasses()
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
