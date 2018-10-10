'use babel'

import {CompositeDisposable} from 'event-kit'
import _ from 'underscore-plus';

import Panel2 from './panel-model'
import PanelView2 from './panel-view'

module.exports =
class PanelsMain2 {
  constructor (sandbox) {
    this.sandbox = sandbox
    this.destroyed = false
    // this.sandbox.listen('new-thread', ({data}) => this.addThread(data))
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(this.sandbox.onDidNotify(({type, data}) => {
      // if (type == 'new-thread') {
      //   this.addThread(data)
      // }
      //wait from panel1
      if (type =='threads-panel.get-view') {
        console.log(data)
      }
    }))

    //test
    setTimeout(() => {
      //this.sandbox.notify('new-thread', 'Thread test')
    }, 5000)
  }

  addThread ({name}) {
    var threadPanel = new Panel2({
      name
    })
    view = new PanelView2()
    view.initialize(threadPanel, this)
    this.sandbox.notify('threads-panel.get-view', view)
  }

  handleStart (panelModel) {
    this.sandbox.notify('threads-panel.start', panelModel.getName())
  }

  handleRemoveUser (user) {
    this.sandbox.notify('threads-panel.remove-user', user)
  }

  destroy () {
    this.destroyed = true
    if (this.subscriptions) {
      this.subscriptions.dispose()
    }
    this.subscriptions = null
  }
}
