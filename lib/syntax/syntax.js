'use babel'

const {Emitter, CompositeDisposable} = require('atom')

class Syntax {

  constructor (editor) {
    this.editor = editor
  }

  getFirstRow (table = null) {
    if (!table) {
      table = this.editor.getTable().getRows()
    }
    let row = table[0]
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
}

module.exports = Syntax
