'use babel'

import { CompositeDisposable, Emitter } from 'atom'
import { $, View } from 'atom-space-pen-views'
import Cell from './cells/cell';
import CellView from './cells/cell-view';
import CheckCellView from './cells/check-cell-view'
import ScreenshotView from './cells/screenshot-view'

export default class ReportViewView {
  constructor (model) {
    this.model = model
    this.subscriptions = new CompositeDisposable()
  }

  initialize () {
    this.element = $('<div>').addClass('list-tree has-collapsable-children')

    const data = this.model.getItems()
    if (Object.keys(data).length > 0) {
      this.updateReport()
    }

    this.element.prepend($('<div>').addClass('screenshot-links'))
  }

  updateReport(items = []) {
    let cell, view

    if (items == false) {
      var items = this.model.getItems()
    }
    for (item of items) {
      cell = new Cell(item)
      switch (item.type) {
        case 'check': view = new CheckCellView(); break;
        case 'checkAttr': view = new CheckCellView(); break;
        case 'no': view = new CheckCellView(); break;
        default: view = new CellView(); break;
      }
      view.initialize(cell)

      let existRows = this.element.children(`#${cell.id}`)
      if(existRows.length > 0) {
        existRows.html(view)
        console.log(cell.id, cell.actual, cell)
        // existRows[0].outerHTML = view.getView()
      } else {
        this.element.append(view)
      }
    }
  }
}
