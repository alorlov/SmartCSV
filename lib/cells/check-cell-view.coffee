{CompositeDisposable} = require 'event-kit'
{$, View} = require 'atom-space-pen-views'
CellView = require './cell-view'

module.exports =
class CheckCellView extends CellView
  initFields: ->
    table = $('<table>')
    table.append($('<tr>').append(
      $('<th>').addClass('name').html('name')
      $('<th>').addClass('expected').html('expected')
      $('<th>').addClass('actual').html('actual')
      $('<th>').addClass('result').html('result')
    ))
    for item in @cell.field
      table.append($('<tr>').append(
        $('<td>').addClass('name').html(item.name)
        $('<td>').addClass('expected').html(item.expected)
        $('<td>').addClass('actual').html(item.actual)
        $('<td>').addClass('result').html(item.result)
      ))
    table

module.exports = document.registerElement('smartcsv-view-cell-check', prototype: CheckCellView.prototype)
