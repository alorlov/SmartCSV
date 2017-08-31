'use babel'

let MatrixTable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVEditor, CSVEditorElement

import EliteCSV from './elitecsv'
import {Emitter, CompositeDisposable} from 'atom'

const subscriptions = new CompositeDisposable()

export default {

  activate(state) {
    console.log('elitecsv is active')
    this.elitecsv = new EliteCSV(state)
  },

  deactivate() {
    subscriptions.dispose()
    return this.elitecsv.destroy()
  },

  serialize () {
    return this.elitecsv.serializeConfig()
  },

  consumeStatusBar (statusBar) {
    return this.elitecsv.addRunnerControls(statusBar)
  },

  // consumeTablrModelsServiceV1 (api) {
  //   ({Table, DisplayTable, TableEditor, Range, CSVEditor} = api)
  //   console.log(api)
  //   this.deserializeTabs()
  // },

  // deserializeTabs() {
  //   const panes = atom.workspace.getPanes()
  //   const items = panes[0].getItems()
  //   const activeUri = atom.workspace.getActivePaneItem().getPath()
  //
  //   for (const item of items) {
  //     this.subscriptions.add(item.onDidOpen(({editor}) => {
  //       item.destroy()
  //       atom.workspace.open(item.getPath(), {choice: this.choiceDefault})
  //     }))
  //   }
  // },

  deserializeCSVEditor (state) {
    if (!CSVEditor) { CSVEditor = require('./tablr/csv-editor') }
    return CSVEditor.deserialize(state)
  },

  deserializeTableEditor (state) {
    if (!TableEditor) { TableEditor = require('./tablr/table-editor') }
    return TableEditor.deserialize(state)
  },

  deserializeDisplayTable (state) {
    if (!DisplayTable) { DisplayTable = require('./tablr/display-table') }
    return DisplayTable.deserialize(state)
  },

  deserializeTable (state) {
    if (!Table) { Table = require('./tablr/table') }
    return Table.deserialize(state)
  },

  tablrViewProvider (model) {
    if (!TableEditor) { TableEditor = require('./tablr/table-editor') }
    if (!Selection) { Selection = require('./tablr/selection') }
    if (!CSVEditor) { CSVEditor = require('./tablr/csv-editor') }

    let element
    if (model instanceof TableEditor) {
      if (!TableElement) { TableElement = require('./tablr/table-element') }
      element = new TableElement()
    } else if (model instanceof Selection) {
      if (!TableSelectionElement) { TableSelectionElement = require('./tablr/table-selection-element') }
      element = new TableSelectionElement()
    } else if (model instanceof CSVEditor) {
      if (!CSVEditorElement) { CSVEditorElement = require('./tablr/csv-editor-element') }
      element = new CSVEditorElement()

      subscriptions.add(model.onDidOpen(({editor}) => {
        // let editorType = this.eliteConfig.get(model.getPath, 'editor-type')
        //
        // if (editorType == "matrix-table") {
          if (!MatrixTable) { MatrixTable = require('./regression/matrix-table') }
           const matrixEditor = new MatrixTable(editor)
           EliteCSV.subscribeToEditor()
        // }
        // else if (editorType == "release-table") {
        //   var rt = new ReleaseTable(editor, release)
        //   rt.setReportClass(this.reportView)
        // }

        // matrixEditor.setAutocomplete(libraryAutocomplete)
        //new SyntaxTable(editor)
        //this.syntaxView = new Mediator(new SyntaxTable(editor.table))
      }))
    }

    if (element) {
      element.setModel(model)
      return element
    }
  },

  deserializeEliteCSV (state) {
    console.log(state)
    return 123
  },

  deserializeMatrixTable (state) {
    if (!MatrixTable) { MatrixTable = require('./regression/matrix-table') }
    return MatrixTable.deserialize(state)
  },

  eliteViewProvider (model) {
    //
  }
}
