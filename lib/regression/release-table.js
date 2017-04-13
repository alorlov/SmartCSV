'use babel'

import path from 'path'

import Table from '../table'
import Store from '../store'
import Database from '../database'

const COL_RESULT = 3
const COL_SCENARIO = 1

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

      if(cell.column == COL_SCENARIO) {
        self.openFile(cell.matrixPath)
      }
      else if (cell.runID != null) {
        self.store.getStoryReport(cell.storyID, cell.runID)
        .then(report => {
          let uriData = {}
          self.openFile(cell.matrixPath, uriData)
          let newReport = self.report.addReport(cell.matrixPath, report, cell.runID)
          self.report.showReport(cell.matrixPath, cell.runID)
        })
      }
      else {
        var ret = startCellEdit.apply(this, arguments)
        return ret
      }

      return
    }

    let editor = this.editor
    let columns = editor.getScreenColumns()
    for (column in columns) {
      columns[column].cellRender = function(cell, position) {
        if (cell.value === undefined) {
          cell.value = ''
        }
        let [row, column] = position

        if (column == COL_RESULT) {
          let color = cell.value == "Failed" ? 'failed' : 'passed'
          return `<span class='${color}'>${cell.value}</span>`
        }
        return `${cell.value}`
      }
    }
    editor.displayTable.updateScreenRows()
  }

  setValues() {}

  setReportClass(c) {
    this.report = c
  }

  getCellInfo() {
    let position = this.editor.getCursorScreenPosition()
    let row = position.row
    let column = position.column
    let matrixName = this.getMatrixName()
    let matrixPath = path.normalize( atom.config.get('smartcsv.projectPath') + '/TestScenarios/' + matrixName + '.csv' )
    let storyID = this.storiesByName[matrixName].getID()
    let colName = this.getColName(position.column)
    let runID = null
    let part = colName.indexOf(', ')
    if (part > -1) {
      runID = colName.substr(part + 2)
      console.log('runID', runID)
    }
    return {
      position: position,
      matrixName: matrixName,
      matrixPath: matrixPath,
      colName: colName,
      storyID: storyID,
      runID: runID,
      column,
      row
    }
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
    return this.editor.getValueAtScreenPosition([position.row, COL_SCENARIO])
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