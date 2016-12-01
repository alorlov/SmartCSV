[_, url, CompositeDisposable, Range, Table, DisplayTable, TableEditor, Selection, TableElement, TableSelectionElement, CSVConfig, CSVEditor, CSVEditorElement] = []
ReportView = require './report-view'

module.exports =
  config:
    showOnRightSide:
      type: 'boolean'
      default: true

  coffeeNavigatorView: null

  activate: (state) ->
    CompositeDisposable ?= require('atom').CompositeDisposable
    #CSVConfig ?= require './csv-config'

    #@csvConfig = new CSVConfig(csvConfig)
    @subscriptions = new CompositeDisposable

    Report = require './report'
    report = new Report
    #object = report.getObject()

    @coffeeNavigatorView = new ReportView \
      state.coffeeNavigatorViewState

    @subscriptions.add atom.workspace.addOpener (uriToOpen) =>
      console.log(uriToOpen)
      extensions = atom.config.get('smartcsv.supportedCsvExtensions') ? ['csv', 'tsv', 'CSV', 'TSV']

      return unless ///\.(#{extensions.join('|')})$///.test uriToOpen

      _ ?= require 'underscore-plus'

      #choice = @csvConfig.get(uriToOpen, 'choice')
      #options = _.clone(@csvConfig.get(uriToOpen, 'options') ? {})
      options = {}
      choice = "TableEditor"
      csvEditor = new CSVEditor({filePath: uriToOpen, options, choice})
      console.log csvEditor
      #csvEditor.editor.deleteRowAtCursor()

  deactivate: ->
    @coffeeNavigatorView.destroy()

  serialize: ->
    coffeeNavigatorViewState: @coffeeNavigatorView.serialize()


  consumeStatusBar: (statusBar) =>
    my = document.createElement('div')
    my.textContent = 'Run2'
    my.style.float = 'right'
    my.className = 'run-all'
    @statusBarTile = statusBar.addLeftTile(item: my, priority: 100)
    console.log(statusBar.getLeftTiles())

  consumeTablrModelsServiceV1: (api) =>
    {Table, DisplayTable, TableEditor, Range, CSVEditor} = api
    console.log api

  getSmallTable: (api) ->
    {Table, DisplayTable, Editor, Range} = api
    Editor ?= require './table-editor'

    table = new Editor

    table.lockModifiedStatus()
    table.addColumn 'key', width: 150, align: 'right'
    table.addColumn 'value', width: 150, align: 'center'
    table.addColumn 'locked', width: 150, align: 'left'

    rows = []
    for i in [0...100]
      rows.push [
        "row#{i}"
        Math.random() * 100
        if i % 2 is 0 then 'yes' else 'no'
      ]

    table.addRows(rows)

    table.clearUndoStack()
    table.initializeAfterSetup()
    table.unlockModifiedStatus()
    return table
