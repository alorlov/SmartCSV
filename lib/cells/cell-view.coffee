{CompositeDisposable, Emitter} = require 'event-kit'
$$ = require('atom-space-pen-views').$$
{$} = require 'atom-space-pen-views'

module.exports =
class CellView extends HTMLElement
  initialize: (@cell) ->
    @subscriptions = new CompositeDisposable()
    #@subscriptions.add @cell.onDidDestroy => @subscriptions.dispose()

    #@draggable = true


    @classList.add('entry', 'list-item')
    @id = @cell.id
    @item = document.createElement('span')
    @item.classList.add('name', 'icon')
    @appendChild(@item)
    @item.textContent = @cell.name

    if @cell.field
      $(@item).append @initFields()
      console.log 'field', @item
    else if @cell.actual
      actual = $('<div>').addClass('actual').html(@cell.actual)
      $(@item).append(actual)

  initFields: ->
    @fields = document.createElement('div')
    for item in @cell.field
      @field = document.createElement('div')
      if item.name != 'field-general'
        name = item.name + ':'
      else
        name = ''
      @field.innerHTML = "
        #{name}
        #{item.expected},
        #{item.actual}
      "
      @field.classList.add 'failed' if item.result == 'failed'
      @fields.appendChild @field
      console.log 'cell', @field
    @fields

  getCell: ->
    @row

module.exports = document.registerElement('smartcsv-view-cell', prototype: CellView.prototype, extends: 'div')
