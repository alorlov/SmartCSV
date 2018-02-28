'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';
import ReportModel from './report-model'
import ReportModalView from './report-modal-view'

export default class ReportModal {
  constructor(mediator) {
    this.mediator = mediator
    this.subscriptions = new CompositeDisposable()

    this.subscribeTo()
  }

  getView () {
    this.handleEvents()
    this.element = new ReportModalView(model)
  }

  subscribeTo () {
    this.subscriptions.add(this.mediator.subscribe('did-read-report', object => this.addToReport(object)))
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


}
