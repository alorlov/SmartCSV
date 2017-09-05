'use babel'

let url, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVEditor, CSVEditorElement
// let [url, CompositeDisposable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVConfig, CSVEditor, CSVEditorElement] = []
import CSVConfig from './tablr/csv-config'
import ReportView from './report-view'
//import Mediator from './mediator'
import MatrixTable from './regression/matrix-table'
import ReleaseTable from './regression/release-table'
import Runner from './runner'
import RunnerView from './runner-view'
import Regression from './regression'

import {Emitter, CompositeDisposable} from 'atom'

import path from 'path'
import _ from 'underscore-plus';

class EliteCSV {
  static initClass () {
    return this
  }

  static initMatrixTableForEditor (editor) {
    const matrixEditor = new MatrixTable(editor)
    matrixEditor.setAutocomplete(MatrixTable.getLibraryAutocomplete())
  }

  static getTableType(editor) {
    const uriToOpen = editor.getURI()

    if (uriToOpen.match('ReleasesResults')) {
      return "release-table"
    } else {
      return "matrix-table"
    }
  }

  constructor(state) {
    atom.config.set('tablr', atom.config.get('elitecsv.tablr'))

    this.csvConfig = new CSVConfig(state.csv)
    this.eliteConfig = new CSVConfig(state.elite)

    this.subscriptions = new CompositeDisposable()

    console.log(EliteCSV.a, this.a)
    console.log(atom.workspace.getPaneItems())
    atom.workspace.onDidAddPaneItem(item => {
      console.log(item)
    })

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tablr:clear-csv-storage': () => this.csvConfig.clear(),
      'tablr:clear-csv-choice': () => this.csvConfig.clearOption('choice'),
      'tablr:clear-csv-layout': () => this.csvConfig.clearOption('layout')
    }))

    this.openedFromSearch = false
    this.choiceDefault = 'TableEditor'
    this.findAction = ''

    this.normalizePath()

    this.subscriptions = new CompositeDisposable()
    this.reportView = new ReportView(this.csvConfig.reportViewState)
    //this.reportView.show()
    let runnerModel = new Runner(this.reportView)
    this.runnerView = new RunnerView(runnerModel)
    //const addonsMatrixTable = new AddonsMatrixTable()

    this.subscriptions.add(runnerModel.onDidStart(() => this.reportView.start()))
    this.subscriptions.add(runnerModel.onDidStop(() => this.reportView.stop()))

    // this.subscribeToSearch()

    if (!CSVEditor) { CSVEditor = require('./tablr/csv-editor') }

    // matrix library



    this.subscriptions.add(atom.workspace.addOpener((uriToOpen, openerOptions) => {
      if (!this.checkExtensions(uriToOpen)) {
        return
      }

      //choice = @csvConfig.get(uriToOpen, 'choice')
      if (!CSVEditor) { CSVEditor = require('./tablr/csv-editor') }
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
        let editorType = "matrix-table"
        let csvEditor = new CSVEditor({filePath: uriToOpen, options, choice})
        this.eliteConfig.set(uriToOpen, "editor-type", "matrix-table")
        //let opt = openerOptions.data
        this.reportView.setEditor(csvEditor)
        // this.subscriptions.add(csvEditor.onDidOpen(({editor}) => {
        //   // const matrixEditor = new MatrixTable(editor)
        //   // matrixEditor.setAutocomplete(libraryAutocomplete)
        // }))
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
      this.eliteConfig.set(uri, "editor-type", "release-table")
      this.reportView.setEditor(csvEditor)
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
  }

  destroy() {
    this.subscriptions.dispose()
    return this.reportView.destroy()
  }

  serializeConfig () {
    return {
      csv: this.csvConfig.serialize(),
      elite: this.eliteConfig.serialize()
    }
  }

  serialize () {
    const out = {
      deserializer: 'EliteCSV',
      csv: this.csvConfig.serialize(),
      elite: this.eliteConfig.serialize()
    }
    // let filePath = atom.workspace.getActivePaneItem().getPath()
    // out.matrixTable =
    return out
  }

  deserialize (state) {
    console.log(1345)
  }

  addRunnerControls(statusBar) {
    return this.runnerView.consumeStatusBar(statusBar)
  }

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
  }

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

  }

  checkExtensions(uriToOpen) {
    const extensions = atom.config.get('tablr.supportedCsvExtensions') ||
                       ['csv', 'tsv', 'CSV', 'TSV']

    if (!new RegExp(`\\.(${extensions.join('|')})$`).test(uriToOpen)) {
     return false
    }
    return true
  }

  normalizePath () {
    let path = atom.config.get('elitecsv.projectPath')
    atom.config.set('elitecsv.projectPath', _.capitalize(path))
  }


}
module.exports = EliteCSV.initClass()
