'use babel'

const {Point, Emitter, CompositeDisposable} = require('atom')

class SyntaxTable {
  constructor (table) {
    this.table = table
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable
    this.cell = null

    this.subscriptions.add(this.table.onDidChangeCellValue((event) => {
      console.log(event)
      return
      let cells = this.convertChangeCellValueToCells(event)
      for (let cell of cells) {
        switch (cell.status) {
          case 'set': this.setValue(cell); break;
          case 'add': this.addValue(cell); break;
          case 'update': this.updateValue(cell); break;
          case 'remove': this.removeValue(cell); break;
        }
      }
      if (oldVal) {}
      this.emitter.emit('did-update', cell)
    }))
  }

  onDidUpdate (callback) {
    return this.emitter.on('did-update', callback)
  }
  convertChangeCellValueToCells ({newValues, oldValues, positions, range}) {
    if (positions != null) {
      return {value: newValues[0], row: positions[0].row, column: positions[0].column}
    }
  }

  addValue (cell) {
    this.emitter.emit('did-add-value', cell)
  }

  removeValue (cell) {
    this.emitter.emit('did-remove-value', cell)
  }

  updateValue (cell) {
    this.emitter.emit('did-update-value', cell)
  }

  addRowAt (index, values = {}) {
    index >= this.rows.length
      ? this.rows.push(row)
      : this.rows.splice(index, 0, row)
  }
}


module.exports = SyntaxTable
