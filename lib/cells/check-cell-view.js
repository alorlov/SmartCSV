'use babel'

import { $, $$ } from 'atom-space-pen-views';
import CellView from './cell-view'

class CheckCellView extends CellView {
  constructor(...args) {
    super(...args)
  }

  initFields() {
    let table = $('<table>')
    table.append($('<tr>').append(
      $('<th>').addClass('name').html('name'),
      $('<th>').addClass('expected').html('expected'),
      $('<th>').addClass('actual').html('actual'),
      $('<th>').addClass('result').html('result')
    ))
    for (item of this.cell.field) {
      let resultClass = item.result == '0' || item.result == 'false' ? 'failed' : ''
      table.append($('<tr>').append(
        $('<td>').addClass('name').html(item.name),
        $('<td>').addClass('expected').html(item.expected),
        $('<td>').addClass('actual').html(item.actual),
        $('<td>').addClass('result ' + resultClass).html(item.result)
      ))
    }
    return table
  }
}
module.exports = document.registerElement('smartcsv-view-cell-check', {prototype: CheckCellView.prototype})
