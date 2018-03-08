'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import { $, View } from 'atom-space-pen-views'
import _ from 'underscore-plus'
import ButtonControl from './control/button-control'
import ButtonRunnerView from './control/button-control-view'
import LinkRunnerView from './control/link-control-view'
import ReleaseTableNew from './regression/release-table-new'
import Button from './button'
import ButtonView from './button-view'

export default class RunnerView extends View {
  constructor(...args) {
    super(...args)
    this.consumeStatusBar = this.consumeStatusBar.bind(this)
  }

  static initClass() {
    this.prototype.panel = null
  }

  static content() {
    return this.div({class: 'elitecsv-control-panel'}, () => {
      return this.div({outlet: 'row'})
    }
    )
  }

  initialize(runner) {
    this.runner = runner
    this.subscriptions = new CompositeDisposable()
    let button = new Button({selected: this.runner.getOption('save-report-file'), type: 'save-report-file', title: 'report to file', tooltip: 'Save report to file'})
    let view = new ButtonView()
    view.initialize(button)
    this.row[0].appendChild(view)

    this.runStopMethod = $('<select>').append(
      $('<option value="step">Step</option>'),
      $('<option value="all">All</option>')
    )
    $(this.row).append(this.runStopMethod)
    this.runStopMethod.val(this.runner.stopMethod)
    this.runStopMethod.change(() => {
      this.runner.setStopMethod(this.runStopMethod.val())
    })

    button = new ButtonControl({type: 'run-from', title: 'Run'})
    view = new ButtonRunnerView()
    view.initialize(button)
    this.row[0].appendChild(view)
    this.subscribeToRunner(view)

    /*button = new ButtonControl({type: 'run-selected', title: 'Run Selected'})
    view = new ButtonRunnerView()
    view.initialize(button)
    this.row[0].appendChild(view)
    this.subscribeToRunner(view)*/

    // Trying with TextEditor
    // var textEditor = atom.workspace.buildTextEditor(true)
    // textEditor.autoHeight = false
    // this.releaseBox = textEditor.getElement()
    // this.releaseBox.classList.add('release')
    // $(this.releaseBox).val(localStorage.getItem('release'))

    this.releaseBox = $('<input>').addClass('release').val(localStorage.getItem('release'))
    $(this.row).append(this.releaseBox)


    button = new ButtonControl({type: 'regression', title: ''})
    view = new LinkRunnerView()
    view.initialize(button)
    this.row[0].appendChild(view)
    this.subscribeTo(view)

    this.report1 = document.createElement('input')
    this.report1.value = localStorage.getItem('report1')
    this.report1.classList.add('report1')
    this.row[0].appendChild(this.report1)

    let button1 = document.createElement('button')
    button1.classList.add('entry', 'button1', 'inline-block', 'btn', 'icon', 'icon-checklist');
    button1.dataset.type = 'get-run'
    this.row[0].appendChild(button1)

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
       'elitecsv:run-from': () => this.toggleRunFrom(),
       'elitecsv:run-selected': () => this.toggleRunSelected(),
       'elitecsv:open-regression': () => this.openRelease()
     })
  }

    //atom.commands.add 'elitecsv-control-panel',
    // 'elitecsv:run-from': => @runFrom()

  setModel(runner) {
    this.runner = runner
  }

  consumeStatusBar(statusBar) {
    console.log('status-bar',statusBar)
    this.statusBar = statusBar
    return this.panel = this.statusBar.addLeftTile({item: this, priority: 100})
  }

  entryClicked(e) {
    let entry = e.currentTarget
    switch (entry.dataset.type) {
      case 'run-from': this.toggleRunFrom(); break
      case 'run-selected': this.toggleRunSelected(); break
      case 'run-all': this.toggleRunAll(); break
      case 'regression': this.openRelease(); break
      case 'get-run': this.runReport(); break
      case 'save-report-file':
        entry.button.toggle();
        this.runner.setOption('save-report-file', entry.button.getValue());
        break
    }

    console.log(e)
    console.log(e.currentTarget)
    //entry.toggle()

    return false
  }

  // toggleRunFrom(withThreads) {
  //   return this.runner.toggleRunFrom(withThreads)
  // }
  //
  // toggleRunSelected(withThreads) {
  //   return this.runner.toggleRunSelected(withThreads)
  // }

  toggleRunAll() {}

  openRelease() {
    let release = this.releaseBox.val()
    localStorage.setItem('release', release)
    atom.workspace.open('elitecsv://regression', {pending: true, activatePane: false, searchAllPanes: true, data: {release: release}})
    atom.views.getView(atom.workspace).focus()
  }

  runReport () {
    let releaseTableNew = new ReleaseTableNew()
    let runName = this.report1.value
    localStorage.setItem('report1', runName)
    releaseTableNew.openRun(runName)
  }
}
RunnerView.initClass()
