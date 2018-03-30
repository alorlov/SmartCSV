'use babel'

const JsTee = require('jstree');

let _s, fs, Q;
import { Point, CompositeDisposable, Emitter } from 'atom';
import _ from 'underscore-plus';
let $$ = fs = _s = Q = null;
import ResizableView from './resizable-view';
import { $, View } from 'atom-space-pen-views';
import ReportViewView from './report-view-view';
import ScreenshotImageView from './cells/screenshot-image-view'

let Database = require('./database')
fs = require('fs')
let base64 = require('base64')

const Range = require('./tablr-hooks/range')

export default class ReportView extends ResizableView {

  static innerContent() {
    return this.div({id: 'elitecsv', class: 'padded'}, () => {
      this.div({outlet: 'list', class: 'list-group'});
      return this.div({outlet: 'throbber', class: 'throbber loading loading-spinner-small inline-block', style: 'display: none'});
    })
  }

  initialize(serializeState, mediator) {
    super.initialize(serializeState);
    this.scenariosDir = atom.config.get('elitecsv.projectPath') + "/TestScenarios"

    this.mediator = mediator
    this.active = null
    this.reports = {}

    this.subscriptions = new CompositeDisposable();

    this.showOnRightSide = atom.config.get('elitecsv.showOnRightSide')
    atom.config.onDidChange('elitecsv.showOnRightSide', ({newValue}) => {
      return this.onSideToggled(newValue);
    }
    );

    atom.commands.add('atom-workspace', 'elitecsv:toggle', () => this.toggle());

    let activePane = atom.workspace.getActivePane();
    if (activePane) { this.setEditor(activePane.activeItem); }

    atom.workspace.onDidChangeActivePaneItem(item => {
      if (item && item.editor != null) {
        this.setEditor(item)
        // this.changePane(item)
      }
    })

    // atom.workspace.onDidDestroyPaneItem(({item}) => {
    //   if (item && item.editor != null) {
    //     let path = item.getPath()
    //     if(this.getReport(path)) {
    //       this.removeReport(path)
    //       this.checkReport()
    //     }
    //   }
    // })

    return;
    // this.visible = localStorage.getItem('coffeeNavigatorStatus') === 'true';
    // if (this.visible) {
    //   return this.show();
    // }
  }

  serialize() {}

  destroy() {
    return this.detach()
  }
    //@fileWatcher?.dispose()

  toggle() {
    if (this.isVisible()) {
      this.detach();
    } else {
      this.show();
    }

    //return localStorage.setItem('coffeeNavigatorStatus', this.isVisible());
  }

  show() {
    this.attach()
    this.mediator.hideTreeView()

    return this.focus();
  }

  attach() {
    if (_.isEmpty(atom.project.getPaths())) { return; }
    //this.panel = atom.workspace.addRightPanel({item: this})
    //return this.panel
    return this.panel != null ? this.panel : (this.panel =
      atom.config.get('elitecsv.showOnRightSide') ?
        atom.workspace.addRightPanel({item: this})
      :
        atom.workspace.addLeftPanel({item: this}));
  }

  detach() {
    if (this.isVisible()) {
      this.panel.destroy()
      this.mediator.showTreeView()
      return this.panel = null;
    }
  }

  handleEvents() {
    super.handleEvents()

    atom.commands.add('tablr-editor',
     {
       'elitecsv:toggle-report': () => this.toggle(),
     })

    return this.on('click', '.entry', e => {
      console.log(e);
      console.log(this.csvEditor);
      //@csvEditor.editor.deleteRowAtCursor()
      // This prevents accidental collapsing when a .entries element is the event target
      if (e.target.classList.contains('entries')) { return; }

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) { return this.entryClicked(e); }
    })
  }

  entryClicked(e) {
    let entry = e.currentTarget;
    let { cell } = entry;

    this.focusOnCell(cell)

    return false
  }

  start() {
    this.throbber.show()
  }

  stop() {
    this.throbber.hide()
  }

  onSideToggled(newValue) {
    return alert('onSideToggled');
  }

  getPath() {
    return this.csvEditor.getPath().replace(/\\/g, '/');
  }

  focusOnCell (cell) {
    this.table = atom.views.getView(this.csvEditor.editor)
    this.setCursorAtPosition([cell.row, this.mediator.getColumnByWorkcol(cell.column)]);
    this.table.afterCursorMove()

    if (cell.screenshot != "") {
      this.showScreenshot(cell.screenshot)
    }
  }
  //
  // getName() {
  //   let path = this.getPath();
  //   let name = path.slice(path.lastIndexOf(this.scenariosDir) + this.scenariosDir.length);
  //   name = name.replace(/^\//, '');
  //   return name.substr(0, name.lastIndexOf('.'));
  // }
  //
  // getHumanName() {
  //   return this.getName().replace('/', '-');
  // }

  setEditor(csvEditor) {
    return this.csvEditor = csvEditor;
  }

  // checkReport() {
  //   var pane = atom.workspace.getActivePaneItem()
  //   if(!pane) {
  //     this.removeAll()
  //   }
  // }

  changePane (item) {
    this.setEditor(item)
    let path = this.getPath()
    if(this.getReport(path) != null) {
      this.showReport(path)
    } else {
      this.detach()
    }
  }

  showReport (name) {
    this.active = name
    const report = this.getReport(name)
    this.list.append(report.element)
    this.show()
    this.highlightEditorByReport(this.getReportModel(name))
    // report.element.show()
  }

  highlightEditorByReport(report) {
    this.colorRows = {}
    const items = report.getItems()
    for (item of items) {
      var row = item.getRow()
      var col = item.getColumn()
      if (row > -1 && col > -1 && item.type != 'report-case-new') {
        let color = item.result == 0 ? 'failed' : 'passed'
        if(!this.colorRows.hasOwnProperty(row)) {
          this.colorRows[row] = {}
        }
        this.colorRows[row][col] = color
      }
    }

    let self = this

    this.subscriptions.add(this.csvEditor.onDidChangeModified(() => {
      let editor = this.csvEditor.editor

      let columns = editor.getScreenColumns()
      let colorRows = self.colorRows
      for (column in columns) {
        var cellRender = columns[column].cellRender
        columns[column].cellRender = function(cell, position) {
          let value = cell.value
          value = cellRender.apply(this, arguments)

          if (self.csvEditor.editor == null) {
            return value
          }

          if (value === undefined) {
            value = ''
          }
          let [row, column] = position
          let workColumn = self.mediator.getWorkcolByColumn(column)
          if(workColumn != null && colorRows.hasOwnProperty(row)) {
            if(colorRows[row].hasOwnProperty(workColumn)) {
              let color = colorRows[row][workColumn]
              return `<span class='${color}'>${value}</span>`
            }
          }
          return `${value}`
        }
      }
      editor.displayTable.updateScreenRows()
    }))
  }

  getReport(name) {
    return this.reports[name]
  }

  getReportModel(name) {
    return this.getReport(name).model
  }

  removeActiveReport () {
    this.removeReport(this.active)
    this.active = null
  }

  removeReport(name) {
    this.list.children('div').remove()
    delete this.reports[name]

    this.reportSubscriptions && this.reportSubscriptions.dispose()
    delete this.reportSubscriptions
  }

  createReport(report) {
    const view = new ReportViewView(report)
    this.reports[report.getName()] = view
    view.initialize()

    this.reportSubscriptions = new CompositeDisposable()
    this.reportSubscriptions.add(report.onDidNewItems(newItems => {
      view.updateReport(newItems)
      this.scroller.scrollTop(32*1024)
    }))

    return view
  }

  // updateReportLive(path, object) {
  //   //CompositeDisposable = require('atom').CompositeDisposable
  //   //@subscriptions = new CompositeDisposable
  //   //@subscriptions.add @csvEditor.editor.onDidChangeCursorPosition({newPosition, oldPosition}) =>
  //   //  alert(33)
  //   let existRows;
  //   let lastID = 0;
  //   this.updateReport(this.getReport(path, 'live'), object)
  //   this.scroller.scrollDown()
  //   return lastID;
  // }

  // removeReport(path) {
  //   var report = this.reports[path]
  //   if(report) {
  //     for (var suf in report.list) {
  //       if (report.list.hasOwnProperty(suf)) {
  //         report.list[suf].detach()
  //       }
  //     }
  //     //report.detach()
  //   }
  // }


    /*csvEditor = this.csvEditor

    this.subscriptions.add @csvEditor.onDidOpen () =>
      table = csvEditor.editor.getTable()

      *@subscriptions.add csvEditor.editor.onDidChangeModified () =>
      *  console.log 'updated'
        *csvEditor.editor.displayTable.updateScreenRows()

      columns = csvEditor.editor.getScreenColumns()
      for column in columns
        column.cellRender = (cell, position) ->
          isCase = table.getValueAtPosition [position[0], 0]
          isVar = table.getValueAtPosition [position[0], 2]
          if isCase != '' and isCase != '-'
            console.log 1,isCase, isVar, position
            "<div style='color: yellow'>#{cell.value}</div>"
          else if isVar != ''
            console.log 2,isCase, isVar, position
            "<div style='color: green'>#{cell.value}</div>"
          else
            console.log 3,isCase, isVar, position
            "#{cell.value}"
    */
  // save() {
  //   return this.csvEditor.editor.save();
  // }



  setCursorAtPosition(position) {
    return this.csvEditor.editor.setCursorAtPosition(position);
  }

  // addScreenshotLinks (reportElement, list) {
  //   for (r of list) {
  //     let view = new ScreenshotView()
  //     view.initialize({
  //       id: r.id,
  //       comment: r.comment,
  //       type: "screenshot"
  //     })
  //
  //     reportElement.children('.screenshot-links').append(view)
  //   }
  // }

  showScreenshot (id) {
    let database = new Database()
    database.query(`Select data From run_screenshot Where id = ${id}`)
    .then(rows => {
      for (row of rows) {
        let data = row.data
        let src = atom.config.get('elitecsv.projectPath') + `/tmp/jf-${id + '-' + this.mediator.getHumanName()}.jpg`
        fs.writeFile(src, data, (err) => {
          if (err) throw err;

          let view = new ScreenshotImageView()
          view.initialize({src: src})

          let editorElement = atom.views.getView(this.csvEditor)
          editorElement.appendChild(view)
        })
      }
    })
  }

  hideScreenshot () {
    this.screenshotElement.style.zIndex = 0
  }
};

// function __guard__(value, transform) {
//   return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
// }
// function __range__(left, right, inclusive) {
//   let range = [];
//   let ascending = left < right;
//   let end = !inclusive ? right : ascending ? right + 1 : right - 1;
//   for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
//     range.push(i);
//   }
//   return range;
// }
