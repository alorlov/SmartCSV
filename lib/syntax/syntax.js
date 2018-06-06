'use babel'

const {Emitter, CompositeDisposable} = require('atom')
import _ from 'underscore-plus';

const SMB_COPYPASTE = '$'

class Syntax {

  constructor (editor) {
    this.editor = editor
  }

  getFirstRow (table = null) {
    if (!table) {
      table = this.editor.getTable().getRows()
    }
    let row = _.clone(table[0])
    let nextColName = 1
    for (let i = 0, count = row.length; i < count; i++) {
      const name = row[i] === undefined ? '' : row[i].trim()
      if (!isNaN(name * 1)) {
        row[i] = (nextColName++).toString()
      }
    }
    return row
  }

  getColumnsByName (table = null) {
    if (!table) {
      table = this.editor.getTable().getRows()
    }
    const row = this.getFirstRow(table)
    const cols = []
    for (let i = 0, count = row.length; i < count; i++) {
      let name = row[i];
      cols[name] = i
    }
    return cols
  }

  getWorkColumns (table = null) {
    if (!table) {
      table = this.editor.getTable().getRows()
    }
    const row = this.getFirstRow(table)
    const cols = []
    for (let i = 0, count = row.length; i < count; i++) {
      let name = row[i];
      if (!isNaN(name * 1)) {
        cols.push(i)
      }
    }
    return cols
  }

  getCellInfo (position = null) {
    if (!position) {
      position = this.editor.getCursorPosition()
    }
    const {row, column} = position

    let r = this.editor.getRow(row)

    const cols = this.getColumnsByName()
    let casee = r[cols.case],
        scenario = r[cols.scenario],
        vars = r[cols.vars],
        value = r[column]

    casee = casee === undefined ? '' : casee.trim()
    scenario = scenario === undefined ? '' : scenario.trim()
    vars = vars === undefined ? '' : vars.trim()
    value = value === undefined ? '' : value.trim()

    let hasCase = casee != '',
        hasScenario = scenario != '',
        hasVars = vars != '',
        hasWork = value != ''

    let isCase = column == cols.case,
        isScenario = column == cols.scenario,
        isVars = column == cols.vars,
        isWork = column > cols.vars

    return {
      hasCase, hasScenario, hasVars, hasWork,
      isCase, isScenario, isVars, isWork
    }
  }

  isCall (val) {
    const cell = this.getCellInfo()
    if (!cell.hasVars && cell.isWork)
    {
      if (val.match('[<>+]') != null) { return false }
      // Call @
      else if (val.indexOf('@') > -1) { return true }
    }
    return false
  }

  getCallName (text) {
    const pipeFirstPos = text.indexOf('@')
    const pipeLastPos = text.lastIndexOf('@')
    const prefix = text.substr(0, pipeFirstPos + 1)
    const name = text.substr(pipeLastPos + 1)
    return {prefix, name}
  }

  getCopypasteList() {
    const list = []
    const table = this.editor.table
    const tableRows = table.getRows()

    for (row of tableRows) {
      if (row[0] === undefined) {
        continue
      }

      if (this.hasCopypastItem(row[0])) {
        let values = []
        let workCols = this.getWorkColumns()
        if (row[0].length == 1) {
          for (col of workCols) {
            if (this.hasCopypastItem(row[col])) {
              values = values.concat(this.splitCopypastItems(row[col]))
            }
          }
        } else {
          values = this.splitCopypastItems(row[0])
        }

        for (let value of values) {
          if (list.indexOf(value) == -1) {
            list.push(value)
          }
        }
      }
    }
    return list
  }

  setCopypasteItemForRows(itemName, rows) {
    // const table = this.editor.table
    const tableRows = rows//table.getRows()

    for (row of tableRows) {
      let value = row[0]
      if (value === undefined || value === null) {
        continue
      }

      if (this.hasCopypastItem(value)) {

        if (value.length > 1) {
          if (this.hasCopypastItem(value, itemName)) {
            row[0] = ''
          } else {
            row[0] = '-'
          }
        } else {
          row[0] = '-'
          this.setCopypastItemsForColumnsFrom(itemName, rows, tableRows.indexOf(row))
        }
      }
    }

    return tableRows
  }

  setCopypastItemsForColumnsFrom(itemName, rows, from) {
    let mainRow = rows[from]
    let to
    for (var i = from; i < rows.length; i++) {
      if (rows[i][0] == '$') {
        to = i
        break
      }
      to = rows.length
    }

    // find item columns
    let itemCols = []
    let workCols = this.getWorkColumns()
    for (col of workCols) {
      // if (mainRow[col] == itemName) {
      if (this.hasCopypastItem(mainRow[col], itemName)) {
        itemCols.push(col)
      }
    }

    if (itemCols.length == 0) {
      return false
    }

    // replace "+" to value
    for (col of itemCols) {
      for (var i = from + 1; i < to; i++) {
        let row = rows[i]
        if (row[col] == '+') {
          // look up left
          let fullValue
          for (var leftCol = col - 1; leftCol >= workCols[0]; leftCol--) {
            if (row[leftCol] != '+' && row[leftCol] != '' && row[leftCol] != undefined) {
              fullValue = row[leftCol]
              break
            }
          }

          if (fullValue == null) {
            console.log(`No value for ${itemName} at row ${i+1}`)
          } else {
            row[col] = fullValue
          }
        }
      }
    }

    // clean other item columns
    for (col of workCols) {
      if (this.hasCopypastItem(mainRow[col]) && !this.hasCopypastItem(mainRow[col], itemName)) {
        for (var i = from + 1; i < to; i++) {
          rows[i][col] = ''
        }
      }
    }
  }

  hasCopypastItem(value, item = null) {
    if (!value) {
      return false
    }

    if (!item) {
      return value.substring(0, 1) == SMB_COPYPASTE
    }
    return this.splitCopypastItems(value).indexOf(item) != -1
  }

  splitCopypastItems(value) {
    let values = value.split(' ')
    values.forEach((el,i) => values[i] = el.trim())
    return values
  }
}

module.exports = Syntax
