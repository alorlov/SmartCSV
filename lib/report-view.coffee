_ = require 'underscore-plus'
$$ = fs = _s = Q = null
ResizableView = require './resizable-view'
TagGenerator = require './tag-generator'
{$, View} = require 'atom-space-pen-views'
# models
ClickCell = require './click-cell'
CheckCell = require './check-cell'
# views
ClickCellView = require './click-cell-view'
CheckCellView = require './check-cell-view'

module.exports =
class ReportView extends ResizableView

  @innerContent: ->
    @div id: 'runner', class: 'padded', =>
      @div outlet: 'list'

  initialize: (serializeState) ->
    super serializeState

    @roots = []

    atom.config.onDidChange 'runner.showOnRightSide', ({newValue}) =>
      @onSideToggled(newValue)

    atom.commands.add 'atom-workspace', 'runner:toggle', => @toggle()
    atom.workspace.onDidChangeActivePaneItem (item) =>
      console.log('pane is changed')

    @visible = localStorage.getItem('coffeeNavigatorStatus') == 'true'
    if @visible
      @show()

    @update()

  serialize: ->

  destroy: ->
    @detach()
    @fileWatcher?.dispose()

  toggle: ->
    if @isVisible()
      @detach()
    else
      @show()

    localStorage.setItem 'coffeeNavigatorStatus', @isVisible()

  show: ->
    @attach()
    @focus()

  attach: ->
    return if _.isEmpty(atom.project.getPaths())

    @panel ?=
      if atom.config.get('runner.showOnRightSide')
        atom.workspace.addRightPanel(item: this)
      else
        atom.workspace.addLeftPanel(item: this)

  detach: ->
    @panel.destroy()
    @panel = null

  handleEvents: ->
    @on 'dblclick', '.tree-view-resize-handle', =>
      @resizeToFitContent()
    @on 'click', '.entry', (e) =>

      # This prevents accidental collapsing when a .entries element is the event target
      return if e.target.classList.contains('entries')

      @entryClicked(e) unless e.shiftKey or e.metaKey or e.ctrlKey

  entryClicked: (e) ->
    entry = e.currentTarget

    false

  onSideToggled: (newValue) ->
    alert('onSideToggled')

  getPath: ->
    # Get path for currently edited file
    atom.workspace.getActiveTextEditor()?.getPath()

  update: ->

    Report = require './report'
    report = new Report
    object = report.getObject('D:\\Projects\\Work\\elite\\logs\\reports\\100.xml')
    console.log object
    @roots = for item of object
      params = item
      switch item.type
        when 'click' then cell = new ClickCell(params); view = new ClickCellView()
        else cell = new ClickCell(params); view = new ClickCellView()

      view.initialize(cell)
      @list[0].appendChild(view)
      view

    return
    Report = require './report'
    report = new Report
    @list.append report.getObject()
    @list.append report.getObject()
