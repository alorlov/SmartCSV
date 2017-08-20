'use strict'

const element = require('./decorators/element')

class TableCellElement extends HTMLElement {
  static initClass () {
    return element(this, 'tablr-cell')
  }

  setModel (model) {
    if(this.tableEditor._timeStart == null) {
      this.tableEditor._timeStart = (new Date()).getTime()
    }
    const timeStart = this.tableEditor._timeStart

    this.model = model
    this.released = false
    const {cell, column, row} = this.model

    this.className = this.getCellClasses(cell, column, row).join(' ')
    this.dataset.row = row
    this.dataset.column = column
    //width: ${this.tableEditor.getScreenColumnWidthAt(column)}px;
    this.style.cssText = `
      left: ${this.tableEditor.getScreenColumnOffsetAt(column)}px;
      height: ${this.tableEditor.getScreenRowHeightAt(row)}px;
      top: ${this.tableEditor.getScreenRowOffsetAt(row)}px;
      text-align: ${this.tableEditor.getScreenColumnAlignAt(column)};
    `
    if (cell.column.cellRender != null) {
      this.innerHTML = cell.column.cellRender(cell, [row, column])
    } else {
      this.textContent = cell.value != null ? cell.value : this.tableElement.getUndefinedDisplay()
    }

    // Set cell width
    let width = this.getWidth()

    this.style.cssText = this.style.cssText + `z-index: ${1000 - column}`;
    this.style.cssText = this.style.cssText + `width: ${width}px`;
    //  console.log(row, column, valueWidth, (new Date() - timeStart))

    this.lastRow = row
    this.lastColumn = column
    this.lastValue = cell.value
  }

  getWidth () {
    const {cell, column, row} = this.model

    let valueWidth
    if (cell.value != null) {
      valueWidth = 120 * (cell.value.length / 15)
    } else {
      valueWidth = this.tableEditor.getScreenColumnWidthAt(column)
    }

    let ed = this.tableEditor
    let width = ed.getScreenColumnWidthAt(column)

    if (valueWidth > width) {
      let columns = ed.getRow(row)
      for (let i = column + 1; i < columns.length; i++) {
        let nextValue = ed.getValueAtPosition([row, i])

        if (nextValue != '' && nextValue !== undefined) {
          break
        }
        else {
          width += ed.getScreenColumnWidthAt(i)
          if (width > valueWidth) {
            break
          }
        }
      }
    }
    return width
  }

  isReleased () { return this.released }

  release (dispatchEvent = true) {
    if (this.released) { return }
    this.style.cssText = 'display: none'
    delete this.dataset.rowId
    delete this.dataset.columnId
    this.released = true
  }

  getCellClasses (cell, column, row) {
    const classes = ['tablr-cell']
    this.tableElement.isCursorCell([row, column]) && classes.push('active')
    this.tableElement.isSelectedCell([row, column]) && classes.push('selected')
    return classes
  }

  isSameCell (cell, column, row) {
    return cell.value === this.lastValue &&
           column === this.lastColumn &&
           row === this.lastRow
  }
}

module.exports = TableCellElement.initClass()
