'use babel'

const {Emitter, CompositeDisposable} = require('atom')

import Threads from './threads'
import MatrixTable from './regression/matrix-table'

class Mediator {

  constructor () {
    this.modules = {}
    console.log('im mediator')
  }

  getEliteEditor () {
    return this.modules['base'].getCurrentEliteEditor()
  }

  addModule (name, instance) {
    this.modules[name] = instance
  }

  addMatrixToThread (request) {
    this.modules['threads'].addMatrixToThread(request)
  }

  createRunRequest (from) {
    var table = this.getEliteEditor()

    if (table instanceof MatrixTable) {
      table.save()
    }
    return table.createRunRequest(from)
  }

  getWorkcolByColumn (column) {
    return this.getEliteEditor().getWorkcolByColumn(column)
  }

  getColumnByWorkcol(column) {
    return this.getEliteEditor().getColumnByWorkcol(column)
  }
  // constructor (table) {
  //   this.subscriptions = new CompositeDisposable
  //   this.table = table
  //   this.syntaxList = []
  //   return
  //   this.matrixSyntax = new MatrixSyntax()
  //   this.matrixSyntax.addSuccessor(new CaseSyntax)
  //   this.syntaxOrder = {
  //     include: new MatrixSyntax(this.table),
  //     vars: new TextSyntax(this.table),
  //   }
  //   this.syntaxOrder.forEach((name, syntax) => {
  //     syntax.addTableModel(this.table)
  //   })
  //
  //   this.subscriptions.add(this.table.onDidUpdate((cell) => this.update(cell)))
  // }
  //
  // update (cell) {
  //   this.updateExists(cell)
  //   this.checkInit(cell)
  // }
  //
  // updateExists (cell) {}
  //
  // checkInit (cell) {
  //   if (addInclude) {
  //     syntaxType = new IncludeSyntax(this.table)
  //     this.modules['vars'].onDidUpdate(() => syntaxType.updateVars(this.modules['vars'].getVarsByLetter(syntaxType.getLetter())))
  //     //this.modules['include'].onDidAddColumn(({case, column}) => syntaxType.getCase2(case).addColumn(column))
  //   }
  //   let caseSyntax = CaseSyntax.checkInit(this.table, cell)
  //   this.syntaxList.push(caseSyntax)
  //   let syntaxType = new ParallelSyntax(this.table)
  //   this.syntaxList.push(syntaxType)
  // }
  //
  // render () {
  //   let mapTable = {
  //     case: 'case',
  //     scenario: 'scenario',
  //     vars: 'vars'
  //   },
  //     csvTable = []
  //   this.syntaxOrder.forEach((name, syntax) => {
  //     mapTable = syntax.render(mapTable)
  //   })
  //
  //   for (var row in mapTable) {
  //     for (var cell in row) {
  //       csvTable = cell.exportCsv(csvTable)
  //     }
  //   }
  //   return csvTable
  // }
}

module.exports = Mediator
