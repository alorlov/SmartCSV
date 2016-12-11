_ = require 'underscore-plus'
$$ = fs = _s = Q = null
ResizableView = require './resizable-view'
TagGenerator = require './tag-generator'
{$, View} = require 'atom-space-pen-views'
# models
Cell = require './cell'
#ClickCell = require './click-cell'
#CheckCell = require './check-cell'
# views
CellView = require './cell-view'
#ClickCellView = require './click-cell-view'
#CheckCellView = require './check-cell-view'

module.exports =
class ReportView extends ResizableView

  @innerContent: ->
    @div id: 'smartcsv', class: 'padded', =>
      @div outlet: 'list'

  initialize: (serializeState) ->
    super serializeState

    @roots = []
    @firstRow = null

    #@showOnRightSide = atom.config.get('coff.showOnRightSide')
    atom.config.onDidChange 'smartcsv.showOnRightSide', ({newValue}) =>
      @onSideToggled(newValue)

    atom.commands.add 'atom-workspace', 'smartcsv:toggle', => @toggle()

    activePane = atom.workspace.getActivePane()
    @setModel activePane.activeItem if activePane
    atom.workspace.onDidChangeActivePaneItem (item) =>
      @setModel activePane.activeItem
      console.log item
      activePane.activeItem

    return
    @visible = localStorage.getItem('coffeeNavigatorStatus') == 'true'
    if @visible
      @show()

  serialize: ->

  destroy: ->
    @detach()
    #@fileWatcher?.dispose()

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
      if atom.config.get('smartcsv.showOnRightSide')
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
      console.log e
      console.log @csvEditor
      #@csvEditor.editor.deleteRowAtCursor()
      # This prevents accidental collapsing when a .entries element is the event target
      return if e.target.classList.contains('entries')

      @entryClicked(e) unless e.shiftKey or e.metaKey or e.ctrlKey

  entryClicked: (e) ->
    entry = e.currentTarget
    cell = entry.cell
    @setCursorAtPosition([cell.row, @getWorkColumn(cell.column)])

    false

  onSideToggled: (newValue) ->
    alert('onSideToggled')

  getPath: ->
    @csvEditor.getPath().replace /\\/g, '/'

  getName: ->
    path = @getPath()
    dir = atom.config.get('smartcsv.scenariosDir')
    name = path.slice path.lastIndexOf(dir) + dir.length
    name = name.replace /^\//, ''
    name.substr(0, name.lastIndexOf('.'))

  getHumanName: ->
    @getName.replace '/', '-'

  updateRows: (object) ->
    #CompositeDisposable = require('atom').CompositeDisposable
    #@subscriptions = new CompositeDisposable
    #@subscriptions.add @csvEditor.editor.onDidChangeCursorPosition({newPosition, oldPosition}) =>
    #  alert(33)

    @roots = for params in object
      switch params.type
        when 'click' then cell = new Cell(params); view = new CellView()
        else cell = new Cell(params); view = new CellView()

      view.initialize(cell)

      existRows = @list.children('#' + view.id)
      console.log existRows
      console.log view.item

      if existRows.last()?[0]
        existRows.html(view.item)
      else
        @list[0].appendChild(view)
    view

  setModel: (@csvEditor) ->

  splitRangesToRows:  ->
    ranges = @csvEditor.editor.getSelectedRanges()
    firstRow = @getFirstRow()
    rows = {}
    for range in ranges
      for row in [range.start.row...range.end.row]
        rows[row] = [] unless rows[row]?
        for column in [range.start.column...range.end.column]
          rows[row].push(firstRow[column]) unless rows[row][column]?
    console.log rows
    rows

  getFirstRow: ->
    row = _.clone @csvEditor.editor.table.getFirstRow()
    nextColName = 1
    for i in [0..row.length]
      name = row[i]
      if !isNaN(name * 1)
        row[i] = nextColName++
    row

  getWorkColumn: (column) ->
    @firstRow ?= @getFirstRow()
    console.log {@firstRow, column}
    @firstRow.indexOf(column)

  setCursorAtPosition: (position) ->
    @csvEditor.editor.setCursorAtPosition(position)
