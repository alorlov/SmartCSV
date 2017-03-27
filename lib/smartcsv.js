'use babel'

let [_, url, CompositeDisposable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVConfig, CSVEditor, CSVEditorElement] = []
import ReportView from './report-view'
//import Mediator from './mediator'
import MatrixTable from './regression/matrix-table'
import Runner from './runner'
import ControlPanelView from './control-panel-view'
import Regression from './regression'
let controlView = null
import path from 'path'

import {Evaluator, Number} from './interpreter/expression'

export default {

  reportView: null,
  controlView: null,

  activate(state) {
    if (CompositeDisposable == null) { ({ CompositeDisposable } = require('atom')) }

    this.subscriptions = new CompositeDisposable
    /*
    const expression = "w x z + -";
    const sentence = new Evaluator(expression);
    const variables = new Map
    //variables.set("rule1", new Parallel());
    variables.set("a", new Number(10));
    variables.set("b", new Number(42));
    const result = sentence.interpret(variables);
    console.log(result);
    */

    this.reportView = new ReportView(state.reportViewState)
    this.reportView.show()
    controlView = new ControlPanelView(new Runner(this.reportView))

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
        console.log(editor)
        new MatrixTable(editor)
        //new SyntaxTable(editor)
        //this.syntaxView = new Mediator(new SyntaxTable(editor.table))
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


  },
}
