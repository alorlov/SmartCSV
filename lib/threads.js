'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';
import ThreadModel from './thread-model'
import ThreadView from './thread-view'

export default class Threads {
  constructor(mediator) {
    this.element = document.createElement('div')
    this.element.classList.add('threads')
    let button = document.createElement('button')
    button.classList.add('new-thread', 'icon', 'icon-playback-play')
    this.element.appendChild(button)

    this.threads = {}
    this.mediator = mediator
    this.mediator.addModule(this)
    this.commands = null
    this.activeThread = null
    this.subscriptions = new CompositeDisposable()
    // this.cellsMap = cellsMap
    // this.matrixName = matrixName
    // this.threadName = threadName

    // onAddMatrix => addMatrixToThread
    this.handleEvents()
  }

  getView () {
    return this.element
  }

  handleEvents() {
    this.element.addEventListener('click', e => {
      // This prevents accidental collapsing when a .entries element is the event target
      // if (e.target.classList.contains('entries')) {
      //   return
      // }

      if (e.target.classList.contains('new-thread')) {
        this.createThreadWithRunFrom(e.ctrlKey)
      } else if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        return this.entryClicked(e)
      }
    })
    atom.commands.add('tablr-editor',
     {
       'elitecsv:thread-run-from': () => this.addRun(true),
       'elitecsv:thread-run-selected': () => this.addRun(false)
     })
  }

  handleThread () {

  }

  entryClicked(e) {
    let entry = e.target
    let thread = e.target.closest('.thread').model
    switch (entry.dataset.type) {
      case 'add': this.addRunToThread(thread.getName(), e.ctrlKey); break
      case 'play': this.toggleRun(); break
      case 'new-thread': this.addRun(e.ctrlKey); break
      case 'report': this.openReport(e.ctrlKey); break
      case 'active': this.toggleActive(); break
    }

    console.log(e)
    console.log(e.currentTarget)
    console.log(e.target)
    console.log(thread)
    //entry.toggle()

    return false
  }

  toggleActive (thread) {
    var activeThread = this.getActiveThread()

    if (activeThread) {
      activeThread.setNotActive()
    }
  }

  openReport () {
    this.mediator.openReport()
  }

  createRequest (from) {
    return this.mediator.createRunRequest(from)
  }

  createThreadWithRunFrom (from) {
    this.addRequestToThread(this.createRequest(from), new Date().getTime())
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

    request.threadName = name
    thread.addMatrix(request)
  }

  getActiveThread () {
    return this.activeThread
  }

  getThread (name) {
    return this.threads[name]
  }

  addThread(name) {
    let model = new ThreadModel(name)
      model.setCommands(this.commands)
    let view = new ThreadView()
    let threadDiv = view.initialize(model, this)
    this.element.append(threadDiv)
    this.threads[name] = model

    return model
  }

  // toggleRunFrom() {
  //   return this.addRequestToThread(this.mediator.createRunRequest(true), thread.getName)
  // }

  setActiveThread (thread) {
    this.activeThread = thread
  }
  // handlePlay
  // handlePause
  // handleSelectUser
  // handleRemoveUser
  handleAdd (thread) {
    this.setActiveThread = thread
  }

  setCommands (type = 'file', path = false) {
    if (type == 'file') {
      let CommandsFile = require('./commands-file')
      this.commands = new CommandsFile(path)
    } else {
      let CommandsDB = require('./commands-db')
      this.commands = new CommandsDB()
    }
  }

  removeThread () {}

  hasThread (threadName) {

  }
}
