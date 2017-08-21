'use babel'

import EliteCSV from './elitecsv'

export default {

  activate(csvConfig) {
    console.log('elitecsv is active')
    this.elitecsv = new EliteCSV(csvConfig)
    
    // needs for tablr/csv-editor -> Tablr.csvConfig
    this.csvConfig = this.elitecsv.csvConfig
  },

  deactivate() {
    return this.elitecsv.destroy()
  },

  serialize () {
    return {csvConfig: this.csvConfig.serialize()}
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
    return EliteCSV.deserialize(state)
  },

  // deserializeTableEditor (state) {
  //   if (!TableEditor) { TableEditor = require('./tablr/table-editor') }
  //   return TableEditor.deserialize(state)
  // },
  //
  // deserializeDisplayTable (state) {
  //   if (!DisplayTable) { DisplayTable = require('./tablr/display-table') }
  //   return DisplayTable.deserialize(state)
  // },
  //
  // deserializeTable (state) {
  //   if (!Table) { Table = require('./tablr/table') }
  //   return Table.deserialize(state)
  // },

  tablrViewProvider (model) {
    return EliteCSV.getView(model)
  },
}
