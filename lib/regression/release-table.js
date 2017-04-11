'use babel'

import Table from '../table'
import Store from '../store'
import Database from '../database'

const COL_RESULT = 'result'
const COL_SCENARIO = 'scenario'

export default class ReleaseTable extends Table {
  constructor(editor, release) {
    super(editor)

    this.release = release
    this.stories = []
    this.storiesByName = {}

    this.store = new Store
    this.loadTable()

    this.extendTableElement()
  }

  extendTableElement () {
    var self = this
    var table = atom.views.getView(this.editor)
    var startCellEdit = table.startCellEdit
    table.startCellEdit = function() {
      let cell = self.getCellInfo()

      if(cell.colName == COL_SCENARIO) {
        self.openFile(cell.matrixPath)
      }
      else if (cell.runID != null) {
        self.store.getStoryReport(cell.storyID, cell.runID)
        .then(report => {
          let newReport = self.report.addReport(cell.matrixPath, report, cell.runID)
          self.report.showReport(cell.matrixPath, cell.runID)
          let uriData = {}
          self.openFile(cell.matrixPath, uriData)
        })
      }
      else {
        var ret = startCellEdit.apply(this, arguments)
        return ret
      }

      return
    }
  }

  extendTableElement2 () {
    var self = this
    var table = atom.views.getView(this.editor)
    var startCellEdit = table.startCellEdit
    table.startCellEdit = function() {
      let cell = self.getCellInfo()
      if(cell.colName == COL_SCENARIO) {

      } else if(cell.runID == null) {
        var ret = startCellEdit.apply(this, arguments)
        return ret
      }
      self.store.getStoryReport(cell.storyID, cell.runID)
      .then(report => {
        let newReport = self.report.addReport(cell.matrixPath, report, cell.runID)
        self.report.showReport(cell.matrixPath, cell.runID)
        let uriData = {}
        self.openFile(cell.matrixPath, uriData)
      })
      return
    }
  }

  setValues() {}

  setReportClass(c) {
    this.report = c
  }

  getCellInfo() {
    let position = this.editor.getCursorScreenPosition()
    let matrixName = this.getMatrixName()
    let matrixPath = atom.config.get('smartcsv.projectPath') + '/TestScenarios/' + matrixName + '.csv'
    let storyID = this.storiesByName[matrixName].getID()
    let colName = this.getColName(position.column)
    let runID = null
    let part = colName.indexOf(', ')
    if (part > -1) {
      runID = colName.substr(part + 2)
      console.log('runID', runID)
    }
    return {position: position, matrixName: matrixName, matrixPath: matrixPath, colName: colName, storyID: storyID, runID: runID}
  }

  jsTreeFromObject(obj) {
    console.log(obj)
    return obj
  }

  setRelease (release) {
    this.release = release
  }

  getMatrixReport (name, run_id = null) {
    let story_id = this.storiesByName[name].getID()
    if(run_id == null) {
      run_id = this.store.getStoryLastRunID(story_id, this.release)
    }
    return this.store.getStoryReport(story_id, run_id)
    .then(rows => {
      return rows
    })
  }

  getMatrixName () {
    const position = this.editor.getCursorScreenPosition()
    return this.editor.getValueAtScreenPosition([position.row, this.getColByName(COL_SCENARIO)])
  }

  openFile(uri, data = {}) {
    atom.workspace.open(
      uri,
      {pending: true, activatePane: false, searchAllPanes: true, data : data}
    )
    atom.views.getView(atom.workspace).focus()
  }

  loadTable () {
    this.store.getStoriesForRelease(this.release)
    .then(stories => {
      for (story of stories) {
        this.stories.push(story)
        this.storiesByName[story.getName()] = story
      }
    })
  }
}
