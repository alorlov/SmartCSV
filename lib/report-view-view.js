'use babel'

import { CompositeDisposable, Emitter } from 'atom'
import { $, View } from 'atom-space-pen-views'
import Cell from './cells/cell';
import CellView from './cells/cell-view';
import CheckCellView from './cells/check-cell-view'
import ScreenshotView from './cells/screenshot-view'
import ScreenshotImageView from './cells/screenshot-image-view'

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

    this.subscriptions.add(this.model.onDidNewItems(items => {
      this.updateReport()
    }))

    this.element.prepend($('<div>').addClass('screenshot-links'))

    class List extends View{
      static content() {
        return this.div({id: 'elitecsv', class: 'padded'}, () => {
          return this.div({outlet: 'list', class: 'tree'});
        })
      }

    }
  }

  updateReport() {
    let cell, view
    const items = this.model.getItems()
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
      } else {
        this.element.append(view)
      }
    }
  }
}
