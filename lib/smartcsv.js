'use babel'

let [_, url, CompositeDisposable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVConfig, CSVEditor, CSVEditorElement] = []
import ReportView from './report-view'
import Mediator from './mediator'
import SyntaxTable from './syntax-table'
import Runner from './runner'
import ControlPanelView from './control-panel-view'
import Regression from './regression'
let controlView = null
import path from 'path'

export default {

  reportView: null,
  controlView: null,

  activate(state) {
    if (CompositeDisposable == null) { ({ CompositeDisposable } = require('atom')) }
    //CSVConfig ?= require './csv-config'
    console.log(state)
    //@csvConfig = new CSVConfig(csvConfig)
    this.subscriptions = new CompositeDisposable
    this.reportView = new ReportView(state.reportViewState)
    controlView = new ControlPanelView(new Runner(this.reportView))


    //Watcher = require 'node-pathwatcher'
    //Watcher.watch 'D:\\Projects\\Work\\elite\\logs\\reports\\100.xml', ('change', path) ->
    //Watcher.watch c, (a,b) ->
    //    console.log path + ' is changed.'

    this.subscriptions.add(atom.workspace.addOpener(uriToOpen => {
      const extensions = atom.config.get('tablr.supportedCsvExtensions') ||
                         ['csv', 'tsv', 'CSV', 'TSV']

      if (!new RegExp(`\\.(${extensions.join('|')})$`).test(uriToOpen)) {
       return
      }
      if (!_) { _ = require('underscore-plus') }

      //choice = @csvConfig.get(uriToOpen, 'choice')
      let options = {}//_.clone(@csvConfig.get(uriToOpen, 'options') ? {})
      let choice = "TableEditor"
      let csvEditor = new CSVEditor({filePath: uriToOpen, options, choice})
      this.reportView.setModel(csvEditor)
      this.subscriptions.add(csvEditor.onDidOpen(({editor}) => {
        //this.syntaxView = new Mediator(new SyntaxTable(editor.table))
        textEditor = atom.workspace.getActivePane()
        textEditorElement = atom.views.getView(textEditor)
        console.log('TAbleelement', textEditorElement.usedCells)
      }))

      console.log(csvEditor)
      console.log(this.reportView)

      return csvEditor
    }))

    this.subscriptions.add(atom.workspace.addOpener(uriToOpen => {
      if (!url) { url = require('url') }

      const {protocol, host} = url.parse(uriToOpen)
      if (protocol !== 'smartcsv:') { return }

      switch (host) {
        case 'regression': return new Regression(new TableEditor)
      }
    }))
  },

  deactivate() {
    return this.reportView.destroy()
  },

  serialize() {
    return {reportViewState: this.reportView.serialize()}
  },

  consumeStatusBar: statusBar => {
    console.log(this.reportView)
    console.log(controlView)
    return controlView.consumeStatusBar(statusBar)
  },

  consumeTablrModelsServiceV1: api => {
    ({Table, DisplayTable, TableEditor, Range, CSVEditor} = api)
    console.log(api)

    //require './smartcsv-table-editor'

    TableEditor.prototype.deleteRowAtCursor = function() {
      let {row} = this.getCursorPosition()
      this.removeScreenRowAt(this.screenRowToModelRow(row))
      console.log('Its the smartcsv deleteRowAtCursor!')
    }
  },
}
