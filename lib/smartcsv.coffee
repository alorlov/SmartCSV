[_, url, CompositeDisposable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVConfig, CSVEditor, CSVEditorElement] = []
ReportView = require './report-view'
Runner = require './runner'
ControlPanelView = require './control-panel-view'
controlView = null

module.exports = Smartcsv =

  reportView: null
  controlView: null

  activate: (state) ->
    CompositeDisposable ?= require('atom').CompositeDisposable
    #CSVConfig ?= require './csv-config'

    #@csvConfig = new CSVConfig(csvConfig)
    @subscriptions = new CompositeDisposable
    @reportView = new ReportView state.reportViewState
    controlView = new ControlPanelView(new Runner(@reportView))

    @subscriptions.add atom.workspace.addOpener (uriToOpen) =>
      extensions = atom.config.get('tablr.supportedCsvExtensions') ? ['csv', 'tsv', 'CSV', 'TSV']

      return unless ///\.(#{extensions.join('|')})$///.test uriToOpen

      _ ?= require 'underscore-plus'

      #choice = @csvConfig.get(uriToOpen, 'choice')
      #options = _.clone(@csvConfig.get(uriToOpen, 'options') ? {})
      options = {}
      choice = "TableEditor"
      csvEditor = new CSVEditor({filePath: uriToOpen, options, choice})
      @reportView.setModel(csvEditor)

      console.log csvEditor
      console.log @reportView
      csvEditor

  deactivate: ->
    @reportView.destroy()

  serialize: ->
    reportViewState: @reportView.serialize()

  consumeStatusBar: (statusBar) =>
    console.log @reportView
    console.log controlView
    controlView.consumeStatusBar(statusBar)

  consumeTablrModelsServiceV1: (api) =>
    {Table, DisplayTable, TableEditor, Range, CSVEditor} = api
    console.log api

    #require './smartcsv-table-editor'

    TableEditor::deleteRowAtCursor = ->
        {row} = @getCursorPosition()
        @removeScreenRowAt @screenRowToModelRow(row)
        console.log 'Its the smartcsv deleteRowAtCursor!'

    return
