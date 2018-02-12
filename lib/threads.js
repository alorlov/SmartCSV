'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';
import ThreadModel from './thread-model'
import ThreadView from './thread-view'

export default class Threads {
  constructor(mediator) {
    this.parentDiv = null
    this.threads = {}
    this.mediator = mediator
    this.mediator.addModule(this)
    this.commands = null
    this.subscriptions = new CompositeDisposable()
    // this.cellsMap = cellsMap
    // this.matrixName = matrixName
    // this.threadName = threadName

    // onAddMatrix => addMatrixToThread
  }

  getView () {
    if (this.parentDiv == null) {
      this.parentDiv = document.createElement('div')
      this.parentDiv.classList.add('threads')
    }
    return this.parentDiv
  }
  // handlePlay
  // handlePause
  // handleSelectUser
  // handleRemoveUser

  setCommands (type = 'file', path = false) {
    if (type == 'file') {
      let CommandsFile = require('./commands-file')
      this.commands = new CommandsFile(path)
    } else {
      let CommandsDB = require('./commands-db')
      this.commands = new CommandsDB()
    }
  }

  getThread (name) {
    this.threads[name]
  }

  addThread() {
    let model = new ThreadModel()
      model.setCommands(this.commands)
    let view = new ThreadView()
    let threadDiv = view.initialize(model, this)
    this.parentDiv.append(threadDiv)

    return model
  }

  removeThread () {}

  hasThread (threadName) {

  }

  addMatrixToThread (request) {
    let thread = this.getThread(request.threadName)

    if (thread == null) {
      thread = this.addThread(request.threadName)
    }

    thread.addMatrix(request)
  }
}
