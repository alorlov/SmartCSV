'use babel'

const {Emitter, CompositeDisposable} = require('atom')

class ExportTable {
  constructor (table) {
    this.emitter = new Emitter()
    let mapTable = [{
      case: 'case',
      scenario: 'scenario'
      vars: 'vars',
      columns: []
    }]
  }

}

module.exports = ExportTable
