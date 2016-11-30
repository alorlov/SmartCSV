ReportView = require './report-view'

module.exports =
  config:
    showOnRightSide:
      type: 'boolean'
      default: true

  coffeeNavigatorView: null

  activate: (state) ->
    Report = require './report'
    report = new Report
    #object = report.getObject()

    @coffeeNavigatorView = new ReportView \
      state.coffeeNavigatorViewState

  deactivate: ->
    @coffeeNavigatorView.destroy()

  serialize: ->
    coffeeNavigatorViewState: @coffeeNavigatorView.serialize()

  consumeTablrModelsServiceV1: (api) =>
    {Table, DisplayTable, Editor, Range} = api
    return
    tableEditor = new Editor(tableModel)
    tableEditor.deleteRowAtCursor()

  consumeStatusBar: (statusBar) =>
    my = document.createElement('div')
    my.textContent = 'Run2'
    my.style.float = 'right'
    my.className = 'run-all'
    @statusBarTile = statusBar.addLeftTile(item: my, priority: 100)
    console.log(statusBar.getLeftTiles())
