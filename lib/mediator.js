'use babel'

const {Emitter, CompositeDisposable} = require('atom')
import path from 'path'

// import Threads from './threads'
import MatrixTable from './regression/matrix-table'

class Mediator {

  constructor (base) {
    this.base = base
    this.modules = {}
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
  }

  addModule (name, instance) {
    this.modules[name] = instance
  }

  subscribe (command, callback) {
    return this.emitter.on(command, callback)
  }

  notify (command, object) {
    this.emitter.emit(command, object)
  }

  /* REPORT */
  createReport (name) {
    return this.modules['reports'].createReport(name)
  }

  /**
   * REQUEST
   */

  handleRequest (request) {
    switch (request.type) {
      case "report":
        this.modules['reports'].getReport(request.threadName).addItemsTo(request.scenarioName, request.data)
        break
        // this.mediator.notify('commands-new-report', {name: request.threadName, items: request.data})
      default:
        console.log('read unknown request', request)
    }
  }

  getEliteEditor () {
    return this.base.getCurrentEliteEditor()
  }

  addMatrixToThread (request) {
    this.modules['threads'].addMatrixToThread(request)
  }

  createRunRequest (from) {
    var table = this.getEliteEditor()

    if (table instanceof MatrixTable) {
      table.save()
    }

    var request = table.createRunRequest(from)
    request.setOption('stopOnFail', this.modules['runner'].getOption('stop-method'))
    request.setOption('saveReportFile', this.modules['runner'].getOption('save-report-file'))

    return request
  }

  getWorkcolByColumn (column) {
    return this.getEliteEditor().getWorkcolByColumn(column)
  }

  getColumnByWorkcol(column) {
    return this.getEliteEditor().getColumnByWorkcol(column)
  }

  getRunnerOption (name) {
    return this.modules['runner'].getOption(name)
  }

  handleClickThreadReportItem (reportName, reportItemID) {
    const report = this.modules['reports'].getReport(reportName)
    const item = report.getItem(reportItemID)
    const scenarioName = item.getScenarioName()
    const uri = this.base.getConfig('projectPath') + '/TestScenarios/' + scenarioName

    this.base.openFile(uri)
    let newReport = this.modules['report-view'].addReport(report)
    this.modules['report-view'].showReport(report.getName())
    // reportModule.focusOnCell(item.getRow(), item.getColumn())
  }

  handleClickReleaseRunCell ({storyID, runID, matrixName}) {
    this.modules['regression-db'].getStoryReport(storyID, runID)
    .then(data => {
      var report = this.modules['reports'].getReport(matrixName)
      if (!report) {
        report = this.modules['reports'].createReport(matrixName)
        report.addItemsTo(matrixName, data)
        this.modules['report-view'].addReport(report)
      }

      const matrixNameCsv = path.extname(matrixName) == '' ? `${matrixName}.csv` : matrixName
      var uri = this.base.getConfig('projectPath') + '/TestScenarios/' + matrixNameCsv
      this.base.openFile(uri)
      this.modules['report-view'].showReport(matrixName)
    })
  }

  toggleTreeView () {
    atom.commands.dispatch(atom.workspace.getActivePane().element, 'tree-view:toggle')
  }

  showTreeView () {
    atom.workspace.getLeftDock().show()
  }

  hideTreeView () {
    atom.workspace.getLeftDock().hide()
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
