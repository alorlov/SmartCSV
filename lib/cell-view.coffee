{CompositeDisposable} = require 'event-kit'

module.exports =
class CellView extends HTMLElement
  initialize: (@cell) ->
    @subscriptions = new CompositeDisposable()
    #@subscriptions.add @cell.onDidDestroy => @subscriptions.dispose()

    #@draggable = true

    @classList.add('file', 'entry', 'list-item')

    @fileName = document.createElement('span')
    @fileName.classList.add('name', 'icon')
    @appendChild(@fileName)
    @fileName.textContent = @cell.name
    @row = @cell.row

  getCell: ->
    @row



module.exports = document.registerElement('smartcsv-view-cell', prototype: CellView.prototype, extends: 'li')
