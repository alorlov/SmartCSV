'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import { $, View } from 'atom-space-pen-views'
import _ from 'underscore-plus'
import ButtonControl from './control/button-control'
import ButtonRunnerView from './control/button-control-view'
import LinkRunnerView from './control/link-control-view'

export default class RunnerView extends View {
  constructor(...args) {
    super(...args)
    this.consumeStatusBar = this.consumeStatusBar.bind(this)
    this.release = '1.17.2'
  }

  static initClass() {
    this.prototype.panel = null
  }

  static content() {
    return this.div({class: 'smartcsv-control-panel'}, () => {
      return this.div({outlet: 'row'})
    }
    )
  }

  initialize(runner) {
    this.runner = runner
    this.subscriptions = new CompositeDisposable()

    let button = new ButtonControl({type: 'run-from', title: 'Run'})
    let view = new ButtonRunnerView()
    view.initialize(button)
    this.row[0].appendChild(view)
    this.subscribeToRunner(view)

    /*button = new ButtonControl({type: 'run-selected', title: 'Run Selected'})
    view = new ButtonRunnerView()
    view.initialize(button)
    this.row[0].appendChild(view)
    this.subscribeToRunner(view)*/

    button = new ButtonControl({type: 'regression', title: 'Open Regression'})
    view = new LinkRunnerView()
    view.initialize(button)
    this.row[0].appendChild(view)
    this.subscribeTo(view)


    this.handleEvents()
    return this.show()
  }

  subscribeToRunner (el) {
    this.subscriptions.add(this.runner.onDidStart(() => el.activate()))
    this.subscriptions.add(this.runner.onDidStop(() => el.deactivate()))
    this.subscriptions.add(this.runner.onDidForcedStop(() => el.forcedStop()))
    this.subscriptions.add(this.runner.onDidManualStop(() => el.manualStop()))
  }

  subscribeTo (el) {
    this.subscriptions.add(this.runner.onDidStart(() => el.activate()))
    this.subscriptions.add(this.runner.onDidStop(() => el.deactivate()))
  }

  show() {
    return this.attach()
  }

  attach() {
    if (_.isEmpty(atom.project.getPaths())) { return }
    return this.panel
  }

  detach() {
    this.panel.destroy()
    return this.panel = null
  }

  handleEvents() {
    this.on('click', '.entry', e => {
      // This prevents accidental collapsing when a .entries element is the event target
      if (e.target.classList.contains('entries')) {
        return
      }

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        return this.entryClicked(e)
      }
    })

    atom.commands.add('tablr-editor',
     {
       'smartcsv:run-from': () => this.toggleRunFrom(),
       'smartcsv:run-selected': () => this.toggleRunSelected(),
       'smartcsv:open-regression': () => this.openRelease(this.release)
     })
  }

    //atom.commands.add 'smartcsv-control-panel',
    // 'smartcsv:run-from': => @runFrom()

  setModel(runner) {
    this.runner = runner
  }

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar
    return this.panel = this.statusBar.addLeftTile({item: this, priority: 100})
  }

  entryClicked(e) {
    let entry = e.currentTarget
    switch (entry.dataset.type) {
      case 'run-from': this.toggleRunFrom(); break
      case 'run-selected': this.toggleRunSelected(); break
      case 'run-all': this.toggleRunAll(); break
      case 'regression': this.openRelease(this.release); break
    }

    console.log(e)
    console.log(e.currentTarget)
    //entry.toggle()

    return false
  }

  toggleRunFrom() {
    return this.runner.toggleRunFrom()
  }

  toggleRunSelected() {
    return this.runner.toggleRunSelected()
  }

  toggleRunAll() {}

  openRelease(release) {
    atom.workspace.open('smartcsv://regression', {pending: true, activatePane: false, searchAllPanes: true, data: {release: release}})
    atom.views.getView(atom.workspace).focus()
  }
}
RunnerView.initClass()
