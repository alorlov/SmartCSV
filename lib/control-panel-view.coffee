{CompositeDisposable} = require 'event-kit'
{$, View} = require 'atom-space-pen-views'
_ = require 'underscore-plus'

module.exports =
class ControlPanelView extends View
  panel: null

  @content: ->
    @div class: 'smartcsv-control-panel', =>
      @div outlet: 'row'

  initialize: (@runner) ->
    @handleEvents()
    @show()
    @update()

  show: ->
    @attach()

  attach: ->
    return if _.isEmpty(atom.project.getPaths())
    @panel

  detach: ->
    @panel.destroy()
    @panel = null

  handleEvents: ->
    @on 'click', '.entry', (e) =>
      # This prevents accidental collapsing when a .entries element is the event target
      return if e.target.classList.contains('entries')

      @entryClicked(e) unless e.shiftKey or e.metaKey or e.ctrlKey

    atom.commands.add 'smartcsv-control-panel',
     'smartcsv:run-from': => @runFrom()

  setModel: (@runner) ->

  consumeStatusBar: (@statusBar) =>
    @panel = @statusBar.addLeftTile(item: this, priority: 100)

  update: ->
    @button = document.createElement('span')
    @button.classList.add('entry')
    @button.dataset.name = 'run-from'
    @button.textContent = 'run-from'
    @row[0].appendChild(@button)

    @button = document.createElement('span')
    @button.classList.add('entry')
    @button.dataset.name = 'run-selected'
    @button.textContent = 'run-selected'
    @row[0].appendChild(@button)

    @button = document.createElement('span')
    @button.classList.add('entry')
    @button.dataset.name = 'run-all'
    @button.textContent = 'run-all'
    @row[0].appendChild(@button)

    ###button = new ButtonControlView
    @row[0].appendChild(button.initialize('from'))
    button = new ButtonControlView
    @row[0].appendChild(button.initialize('selected'))
    ###

  entryClicked: (e) ->
    entry = e.currentTarget
    switch entry.dataset.name
      when 'run-from' then @toggleRunFrom()
      when 'run-selected' then @toggleRunSelected()
      when 'run-all' then @toggleRunAll()

    console.log entry

    false

  toggleRunFrom: ->

  toggleRunSelected: ->
    @runner.toggleRunSelected()

  toggleRunAll: ->
