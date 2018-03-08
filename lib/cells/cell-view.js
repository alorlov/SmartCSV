'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
//$$ = require('atom-space-pen-views').$$
//{$} = require 'atom-space-pen-views'
import { $, $$ } from 'atom-space-pen-views';

class CellView extends HTMLElement {
  initialize (cell) {
    this.cell = cell
    this.subscriptions = new CompositeDisposable()

    this.classList.add('entry', 'list-item', 'type-' + cell.type)
    this.id = cell.id

    // build a num
    let numColID = (cell.column % 5) == 0 ? 5 : (cell.column % 5),
        numClass = 'column-color-' + numColID
        numText = cell.column > -1 ? cell.column : ''
    let num = $('<span>').addClass('num ' + numClass).text(numText)
    $(this).append(num)

    // build a name
    this.item = document.createElement('span')
    this.item.classList.add('name')
    this.appendChild(this.item)
    this.item.textContent = cell.name

    if (cell.comment != '') {
      $(this).append($('<span>').addClass('comment').text(cell.comment))
    }

    if (cell.field.length > 0) {
      this.item.classList.add('no-icon')
      $(this.item).append(this.initFields())
    }
    if (cell.actual != '') {
      let actual = $('<span>').addClass('actual').html(cell.actual)
      //let resultClass = this.item.result == '0' || this.item.result == 'false' ? 'failed' : ''
      if(cell.result == '0' || cell.result == 'false') {
        actual.addClass('failed')
      }
      $(this.item).append(actual)
    }

    if (cell.screenshot != '') {
      this.screenLink = document.createElement('span')
      this.screenLink.classList.add('screenshot')
      this.screenLink.textContent = '[image]'
      $(this.item).append(this.screenLink)
    }
  }

  getView() {
    return this.item
  }

  initFields() {
    let table = $('<table>')
    for (item of this.cell.field) {
      let resultClass = item.result == '0' || item.result == 'false' ? 'failed' : ''
      table.append($('<tr>').append(
        $('<td>').addClass('name').html(item.name),
        $('<td>').addClass('expected').html(item.expected),
        $('<td>').addClass('actual').html(item.actual)
      ).addClass(resultClass))
    }
    return table
  }

  initFields2 () {
    this.fields = document.createElement('div')
    for (item in this.cell.field) {
      this.field = document.createElement('div')
      if (item.name != 'field-general')
        name = item.name + ':'
      else
        name = ''
      this.field.innerHTML = `
        ${name}
        ${item.expected},
        ${item.actual}
      `
      if (item.result == 'failed'){
        this.field.classList.add ('failed')
      }
      this.fields.appendChild (this.field)
      console.log ('cell', this.field)
    }
    return this.fields
  }

  getCell () {
    return this.row
  }
}

module.exports = document.registerElement('elitecsv-view-cell', {prototype: CellView.prototype, extends: 'div'})
