'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';
import ThreadModel from './thread-model'
import ThreadView from './thread-view'
import Request from './request'

export default class Threads {
  constructor(mediator) {
    this.mediator = mediator
    this.element = document.createElement('div')
    this.element.classList.add('threads')
    let button = document.createElement('button')
    button.classList.add('new-thread', 'icon', 'icon-playback-play', 'inline-block', 'btn')
    this.element.appendChild(button)

    this.threads = {}
    this.activeThread = null
    this.subscriptions = new CompositeDisposable()

    // this.cellsMap = cellsMap
    // this.matrixName = matrixName
    // this.threadName = threadName

    // onAddMatrix => addMatrixToThread

    // this.subscribeToCommands()
    this.handleEvents()
  }

  getView () {
    return this.element
  }

  subscribeToCommands () {
    // this.mediator.subscribe('did-new-command', object)
  }

  handleEvents() {
    this.element.addEventListener('click', e => {
      // This prevents accidental collapsing when a .entries element is the event target
      // if (e.target.classList.contains('entries')) {
      //   return
      // }

      if (e.target.classList.contains('new-thread')) {
        this.createThreadWithRunFrom(e.ctrlKey)
      } else {
        return this.entryClicked(e)
      }
    })
    atom.commands.add('tablr-editor',
     {
       'elitecsv:thread-run-from': () => this.addRun(true),
       'elitecsv:thread-run-selected': () => this.addRun(false),
       'elitecsv:thread-new-run-from': () => this.createThreadWithRunFrom(true),
       'elitecsv:thread-new-run-selected': () => this.createThreadWithRunFrom(false)
     })
  }

  handleThread () {

  }

  entryClicked(e) {
    let entry = e.target
    let thread = e.target.closest('.thread').model
    switch (entry.dataset.type) {
      case 'add': this.addRunToThread(thread.getName(), e.ctrlKey); break
      case 'play': thread.toggleRun(); break
      case 'stop': thread.stop(); break
      case 'user-select': thread.selectUser(entry.dataset.name); break
      case 'active': this.setActiveThread(thread); break
      case 'user-remove': thread.removeUser(entry.dataset.name); break
      case 'user-remove-all': thread.removeAllUsers(); break
      case 'new-thread': this.addRun(e.ctrlKey); break
      case 'report-item':
        this.setActiveThread(thread)
        this.mediator.handleClickThreadReportItem(thread.getName(), entry.dataset.id)
        break
      case 'active': this.toggleActive(); break
    }

    // console.log(e)
    // console.log(e.currentTarget)
    // console.log(e.target)
    // console.log(thread)
    //entry.toggle()

    return false
  }

  toggleRun () {

  }

  toggleActive (thread) {
    var activeThread = this.getActiveThread()

    if (activeThread) {
      activeThread.setNotActive()
    }
  }

  removeThread (name) {
    const thread = this.getThread(name)
    thread.destroy()
    if (this.activeThread == thread) {
      this.activeThread = null
    }
    delete this.threads[name]
  }

  openReport () {
    this.mediator.openReport()
  }

  createRequest (from) {
    return this.mediator.createRunRequest(from)
  }

  createThreadWithRunFrom (from) {
    const name = new Date().getTime()
    this.addRequestToThread(this.createRequest(from), name)
    const thread = this.getThread(name)
    thread.play()
  }

  addRun (from) {
    var thread = this.getActiveThread()
    if (thread) {
      name = thread.getName()
    } else {
      name = new Date().getTime()
    }
    this.addRunToThread(name, from)
  }

  addRunToThread (name, from) {
    this.addRequestToThread(this.createRequest(from), name)
  }

  addRequestToThread (request, name) {
    let thread = this.getThread(name)

    if (thread == null) {
      thread = this.addThread(name)
    }

    request.setOption('threadName', name)
    this.addMatrix(request)
  }

  addMatrix (request) {
    this.mediator.notify('threads-new-request', request)
  }

  getActiveThread () {
    return this.activeThread
  }

  getThread (name) {
    return this.threads[name]
  }

  addThread(name) {
    let model = new ThreadModel(name)

    let reportModel = this.mediator.createReport(name)
    this.subscriptions.add(reportModel.onDidNewItems(items => {
      model.addReportItems(items)
    }))

    let view = new ThreadView()
    let threadDiv = view.initialize(model, this)
    this.element.append(threadDiv)

    this.setActiveThread(model)
    this.threads[name] = model

    this.subscriptions.add(model.onDidRemoveUser(user => {
      this.mediator.notify('threads-new-request', new Request({
        command: 'thread-manipulation',
        name: 'user-stop',
        value: user.name,
        threadName: model.getName()
      }))
    }))
    this.subscriptions.add(model.onDidRemoveAllUsers(() => {
      this.mediator.notify('threads-new-request', new Request({
        command: 'thread-manipulation',
        name: 'user-stop-all',
        threadName: model.getName()
      }))
    }))
    this.subscriptions.add(model.onDidGetOnTop(user => {
      this.mediator.notify('threads-new-request', new Request({
        command: 'thread-manipulation',
        name: 'user-on-top',
        value: user.name,
        threadName: model.getName()
      }))
    }))
    this.subscriptions.add(model.onDidPause(user => {
      this.mediator.notify('threads-new-request', new Request({
        command: 'thread-manipulation',
        name: 'run-pause',
        threadName: model.getName()
      }))
    }))
    this.subscriptions.add(model.onDidPlay(user => {
      this.mediator.notify('threads-new-request', new Request({
        command: 'thread-manipulation',
        name: 'run-play',
        threadName: model.getName()
      }))
    }))
    this.subscriptions.add(model.onDidStop(user => {
      this.mediator.notify('threads-new-request', new Request({
        command: 'thread-manipulation',
        name: 'run-stop',
        threadName: model.getName()
      }))
    }))

    return model
  }

  // toggleRunFrom() {
  //   return this.addRequestToThread(this.mediator.createRunRequest(true), thread.getName)
  // }

  setActiveThread (thread) {
    if (this.activeThread) {
      this.activeThread.setActive(false)
    }
    thread.setActive(true)
    this.activeThread = thread
  }
  // handlePlay
  // handlePause
  // handleSelectUser
  // handleRemoveUser
  // handleAdd (thread) {
  //   this.setActiveThread = thread
  // }

  /*
    COMMANDS
  */

  // setCommands (type = 'file', path = false) {
  //   if (type == 'file') {
  //     let CommandsFile = require('./commands-file')
  //     this.commands = new CommandsFile(path)
  //   } else {
  //     let CommandsDB = require('./commands-db')
  //     this.commands = new CommandsDB()
  //   }
  // }


}
