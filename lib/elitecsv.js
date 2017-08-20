'use babel'

let [url, CompositeDisposable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVConfig, CSVEditor, CSVEditorElement] = []
import ReportView from './report-view'
//import Mediator from './mediator'
import MatrixTable from './regression/matrix-table'
import ReleaseTable from './regression/release-table'
import Runner from './runner'
import RunnerView from './runner-view'
import Regression from './regression'
import LibraryAutocomplete from './autocomplete/library-autocomplete'
import LibraryWatch from './library/library-watch'
//import AddonsMatrixTable from './regression/addons-matrix-table'

let runnerView = null
import path from 'path'
import _ from 'underscore-plus';

import {Evaluator, Number} from './interpreter/expression'

export default {

  reportView: null,
  runnerView: null,

  activate(state) {
    console.log('elitecsv is active')
    if (CompositeDisposable == null) { ({ CompositeDisposable } = require('atom')) }
    this.subscriptions = new CompositeDisposable

    this.openedFromSearch = false
    this.choiceDefault = 'TableEditor'
    this.findAction = ''

    // Normalize paths
    let path = atom.config.get('elitecsv.projectPath')
    atom.config.set('elitecsv.projectPath', _.capitalize(path))

    this.subscriptions = new CompositeDisposable
    this.reportView = new ReportView(state.reportViewState)
    //this.reportView.show()
    let runnerModel = new Runner(this.reportView)
    runnerView = new RunnerView(runnerModel)
    //const addonsMatrixTable = new AddonsMatrixTable()

    this.subscriptions.add(runnerModel.onDidStart(() => this.reportView.start()))
    this.subscriptions.add(runnerModel.onDidStop(() => this.reportView.stop()))

    this.subscribeToSearch()

    // matrix library
    const libraryAutocomplete = new LibraryAutocomplete()

    this.library = new LibraryWatch()
    this.library.onDidChangeItems(items => {
      libraryAutocomplete.setItems(items)
    })

    dir = atom.config.get('elitecsv.projectPath')
    const libraryDirs = [
      dir + '/TestScenarios/EE',
      dir + '/TestScenarios/EG'
    ]
    this.library.loadDirs(libraryDirs)


    this.subscriptions.add(atom.workspace.addOpener((uriToOpen, openerOptions) => {
      if (!this.checkExtensions(uriToOpen)) {
        return
      }

      //choice = @csvConfig.get(uriToOpen, 'choice')

      let options = {trim: true, relax_column_count: true}//_.clone(@csvConfig.get(uriToOpen, 'options') ? {})

      let choice = openerOptions.choice ? openerOptions.choice : this.choiceDefault


      if (choice === 'TextEditor') {
        return atom.workspace.openTextFile(uriToOpen)
        .then(textEditor => {
          setTimeout(() => {
            editorView = atom.views.getView(textEditor)
            atom.commands.dispatch(editorView, this.findAction)
          }, 300)
          return textEditor
        })
      }
      else if (choice == "TableEditor") {
        let csvEditor = new CSVEditor({filePath: uriToOpen, options, choice})
        //let opt = openerOptions.data
        this.reportView.setEditor(csvEditor)
        this.subscriptions.add(csvEditor.onDidOpen(({editor}) => {
          const matrixEditor = new MatrixTable(editor)
          matrixEditor.setAutocomplete(libraryAutocomplete)
        }))
        return csvEditor
      }

    }))

    this.subscriptions.add(atom.workspace.addOpener((uriToOpen, openerOptions) => {
      if (!url) { url = require('url') }

      const {protocol, host} = url.parse(uriToOpen)
      if (protocol !== 'elitecsv:') { return }

      const release = openerOptions.data.release
      const uri = atom.config.get('elitecsv.projectPath') + '/TestScenarios/ReleasesResults/' + release + '.csv';
      //choice = @csvConfig.get(uriToOpen, 'choice')
      let options = {relax_column_count: true}//_.clone(@csvConfig.get(uriToOpen, 'options') ? {})
      let choice = "TableEditor"
      let csvEditor = new CSVEditor({filePath: uri, options, choice})
      //this.reportView.setModel(csvEditor)
      this.subscriptions.add(csvEditor.onDidOpen(({editor}) => {
        //console.log('regres-table', editor)
        var rt = new ReleaseTable(editor, release)
        rt.setReportClass(this.reportView)
        //new SyntaxTable(editor)
        //this.syntaxView = new Mediator(new SyntaxTable(editor.table))
      }))
      return csvEditor
      /*switch (host) {
        case 'regression': return new Regression(new TableEditor)
      }*/
    }))


  },

  deactivate() {
    this.subscriptions.dispose()
    return this.reportView.destroy()
  },

  serialize() {
    return {reportViewState: this.reportView.serialize()}
  },

  consumeStatusBar (statusBar) {
    console.log(this.reportView)
    console.log(runnerView)
    return runnerView.consumeStatusBar(statusBar)
  },

  consumeTablrModelsServiceV1 (api) {
    ({Table, DisplayTable, TableEditor, Range, CSVEditor} = api)
    console.log(api)
    this.deserializeTabs()
  },

  deserializeTabs() {
    const panes = atom.workspace.getPanes()
    const items = panes[0].getItems()
    const activeUri = atom.workspace.getActivePaneItem().getPath()

    for (const item of items) {
      this.subscriptions.add(item.onDidOpen(({editor}) => {
        item.destroy()
        atom.workspace.open(item.getPath(), {choice: this.choiceDefault})
      }))
    }
  },

  subscribeToSearch () {
    atom.workspace.onDidChangeActivePaneItem(item => {
      this.openedFromSearch = false
      this.choiceDefault = 'TableEditor'
      if (!item) {
        return
      }
      if (Object.keys(item).indexOf('searchResults') != -1) {
        this.openedFromSearch = true
        this.choiceDefault = 'TextEditor'
      }
    })

    atom.workspace.onDidOpen(e => {
      if (!e) {
        return
      }
      if (this.openedFromSearch && e.item instanceof CSVEditor) {
        if (e.item.choice == 'TableEditor') {
          this.changeChoice('TextEditor')
        }
      }
    })

    const self = this
    atom.commands.add('tablr-editor', {
      'find-and-replace:show' () {
        self.findAction = 'find-and-replace:show'
        self.changeChoice('TextEditor')
      },
      'project-find:show' () {
        self.findAction = 'project-find:show'
        self.changeChoice('TextEditor')
      },
    })
    atom.commands.add('atom-text-editor', {
      'core:cancel' () { self.changeChoice('TableEditor') },
    })
  },

  changeChoice(choice) {
    const item = atom.workspace.getActivePaneItem()
    if (!item) {
      return
    }
    const uri = item.getURI()
    if (!this.checkExtensions(uri) || item.choice == choice) {
      return
    }

    reopen = () => {
      item.destroy()
      atom.workspace.open(uri, {choice: choice})
      .then(editor => {
        atom.views.getView(editor).focus()
      })
    }

    let promise = item.save()
    if (!promise) {
      setTimeout(reopen, 500)
    }
    else {
      promise.then(() => {
        reopen()
      })
    }

  },

  checkExtensions(uriToOpen) {
    const extensions = atom.config.get('tablr.supportedCsvExtensions') ||
                       ['csv', 'tsv', 'CSV', 'TSV']

    if (!new RegExp(`\\.(${extensions.join('|')})$`).test(uriToOpen)) {
     return false
    }
    return true
  }
}
