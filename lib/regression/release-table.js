'use babel'

import path from 'path'
import { File, CompositeDisposable, Emitter } from 'atom'

import Table from '../table'
import Store from '../store'
import Database from '../database'

const COL_DO = 0
const COL_SCENARIO = 1
const COL_RESULT = 3
const COL_BLOCKED = 5

export default class ReleaseTable extends Table {
  constructor(editor, release) {
    super(editor)

    this.release = release
    this.stories = []
    this.storiesByName = {}

    this.store = new Store
    this.loadTable()

    this.extendTableElement()

    this.subscriptions.add(this.tableElement.subscribeTo(this.tableElement.body, {
      'click': e => {
        const {metaKey, ctrlKey, shiftKey, pageX, pageY} = e
        const position = this.tableElement.cellPositionAtScreenPosition(pageX, pageY)
        const value = this.editor.getValueAtPosition(position)
        if (e.ctrlKey) {
          let cell = this.getCellInfo()

          const file = new File(cell.matrixPath)
          if (!file.existsSync()) {
            atom.confirm({
              message: "File doesn't exist. Do you want to create " + cell.matrixName,
              buttons: {
                "Create": () => {
                  this.createEmptyCSV(cell.matrixPath)
                  setTimeout(() => {
                    this.openFile(cell.matrixPath)
                  },300)
                },
                "No": () => {}
              }
            })
          } else {
            this.openFile(cell.matrixPath)
          }
          console.log(cell)
        }
      }
    }))
  }

  extendTableElement () {
    var self = this
    var table = atom.views.getView(this.editor)
    var startCellEdit = table.startCellEdit
    table.startCellEdit = function() {
      let cell = self.getCellInfo()

      if (cell.runID != null) {
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

    this.setColumnNames()
    let lastChanceColumns = this.getLastChanceColumns()

    for (var i = 0; i < columns.length; i++) {
      if (i >= COL_BLOCKED) {
        columns[i].align = "right"
      }
    }

    for (column in columns) {
      columns[column].cellRender = function(cell, position) {
        let value = cell.value
        if (value === undefined) {
          value = ''
        }
        let classes = []
        let [row, column] = position
        let values = editor.getRow(row)

        if (row == 0) {
          return value
        }
        // if (column == COL_RESULT) {
        //   classes.push(value == "Failed" ? 'release-failed' : 'release-passed')
        //   // return `<span class='${color}'>${value}</span>`
        // } else
        if (column > COL_BLOCKED) {
          classes.push(value != "0" ? 'release-failed' : 'release-passed')
          // return `<span class='${color}'>${value}</span>`
        }
        const inRegression = ['', 'l']
        if (inRegression.indexOf(values[COL_DO]) == -1 && values[COL_DO] !== undefined) {
          classes.push('release-no-runs')
        }

        const inQueueRows = ['q', 'new']
        const inQueueRowsCols = [COL_DO, COL_SCENARIO]
        if (inQueueRows.indexOf(values[COL_DO]) != -1 && inQueueRowsCols.indexOf(column) != -1) {
          classes.push('release-in-queue')
        }

        if (column == COL_BLOCKED) {
          classes.push('text-info')
        }

        if (lastChanceColumns.indexOf(column) > -1) {
          classes.push('separator')
        }
        return `<span class='${classes.join(' ')}'>${value}</span>`
      }
    }
    editor.displayTable.updateScreenRows()
  }

  setColumnNames() {
    let editor = this.editor
    let columns = editor.getScreenColumns()
    let firstRow = editor.getTable().getFirstRow()
    for (var i = 0; i < columns.length; i++) {
      columns[i].name = firstRow[i]
    }
  }

  getLastChanceColumns() {
    let editor = this.editor
    let columns = editor.getScreenColumns()
    let results = []
    for (var i = 0; i < columns.length; i++) {
      if (columns[i].name.match('.lc') != null)
      results.push(i)
    }
    return results
  }

  createEmptyCSV(newUri) {
    var content = 'case,scenario,vars,,,,,,,,\n'
    for(let i = 0; i < 50; i++) {
      content += ',,,,,,,,,,\n'
    }
    const newEditor = atom.workspace.buildTextEditor()
    newEditor.setText(content)
    newEditor.saveAs(newUri)
  }

  setValue(e) {
    this.editor.getTable().emitter.emit('did-change', true)
  }

  setReportClass(c) {
    this.report = c
  }

  getCellInfo() {
    let position = this.editor.getCursorScreenPosition()
    let row = position.row
    let column = position.column
    let matrixName = this.getMatrixName()
    let matrixPath = path.normalize( atom.config.get('elitecsv.projectPath') + '/TestScenarios/' + matrixName + '.csv' )
    let storyID = this.getStoryName(matrixName)
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

  getStoryName (matrixName) {
    if (Object.keys(this.storiesByName).indexOf(matrixName) < 0) {
      return -1
    }
    return this.storiesByName[matrixName].getID()
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
