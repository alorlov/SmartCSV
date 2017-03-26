'use babel'

let _s, fs, Q;
import { CompositeDisposable, Emitter } from 'event-kit';
import _ from 'underscore-plus';
let $$ = fs = _s = Q = null;
import ResizableView from './resizable-view';
import { $, View } from 'atom-space-pen-views';
import Cell from './cells/cell';
import CellView from './cells/cell-view';
import CheckCellView from './cells/check-cell-view';

export default class ReportView extends ResizableView {

  static innerContent() {
    return this.div({id: 'smartcsv', class: 'padded'}, () => {
      return this.div({outlet: 'list', class: 'tree'});
    }
    );
  }

  initialize(serializeState) {
    super.initialize(serializeState);

    this.roots = [];
    this.firstRow = null;

    this.subscriptions = new CompositeDisposable();

    //@showOnRightSide = atom.config.get('coff.showOnRightSide')
    atom.config.onDidChange('smartcsv.showOnRightSide', ({newValue}) => {
      return this.onSideToggled(newValue);
    }
    );

    atom.commands.add('atom-workspace', 'smartcsv:toggle', () => this.toggle());

    let activePane = atom.workspace.getActivePane();
    if (activePane) { this.setModel(activePane.activeItem); }

    atom.workspace.onDidChangeActivePaneItem(item => {
      this.setModel(activePane.activeItem);
      console.log(item);
      return activePane.activeItem;
    }
    );

    return;
    this.visible = localStorage.getItem('coffeeNavigatorStatus') === 'true';
    if (this.visible) {
      return this.show();
    }
  }

  serialize() {}

  destroy() {
    return this.detach();
  }
    //@fileWatcher?.dispose()

  toggle() {
    if (this.isVisible()) {
      this.detach();
    } else {
      this.show();
    }

    return localStorage.setItem('coffeeNavigatorStatus', this.isVisible());
  }

  show() {
    this.attach();

    const JsTee = require('jstree');

    this.list.jstree({
      "core" : {

        "check_callback" : true,
       'data' : [
                {"id" : 1, "text" : "Node 1", data : {pos: 4}},
                {"id" : 2, "text" : "Node 2", data : {pos: 4}},
            ]
      },
    })
    .on('changed.jstree', (e, data) => {
      data = data.node.data
      this.csvEditor.editor.setCursorAtScreenPosition([data.pos,5])
      this.table = atom.views.getView(this.csvEditor.editor)
      this.table.afterCursorMove()
      console.log(e, data)
    })
    ref = this.list.jstree(true)
    var newID = ref.create_node('1', { "text" : "Child node cust", data : {pos: 4} })
    newID = ref.create_node('1', { "text" : "Child node cust", data : {pos: 5} })
    newID = ref.create_node('2', { "text" : "Child node cust", data : {pos: 6} })
    //ref.select_node(newID)
    this.on('click', this.list, () => {

      //ref.select_node('1')
      //sel = ref.get_selected()
      //var newID = ref.create_node('1', { "text" : "Child node cust" })
      //ref.select_node(newID)
      //console.log(newID)
    })


    return this.focus();
  }

  attach() {
    if (_.isEmpty(atom.project.getPaths())) { return; }

    return this.panel != null ? this.panel : (this.panel =
      atom.config.get('smartcsv.showOnRightSide') ?
        atom.workspace.addRightPanel({item: this})
      :
        atom.workspace.addLeftPanel({item: this}));
  }

  detach() {
    this.panel.destroy();
    return this.panel = null;
  }

  handleEvents() {
    this.on('dblclick', '.tree-view-resize-handle', () => {
      return this.resizeToFitContent();
    })
    return this.on('click', '.entry', e => {
      console.log(e);
      console.log(this.csvEditor);
      //@csvEditor.editor.deleteRowAtCursor()
      // This prevents accidental collapsing when a .entries element is the event target
      if (e.target.classList.contains('entries')) { return; }

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) { return this.entryClicked(e); }
    }
    );
  }

  entryClicked(e) {
    let entry = e.currentTarget;
    let { cell } = entry;
    this.setCursorAtPosition([cell.row, this.getWorkColumn(cell.column)]);

    return false;
  }

  onSideToggled(newValue) {
    return alert('onSideToggled');
  }

  getPath() {
    return this.csvEditor.getPath().replace(/\\/g, '/');
  }

  getName() {
    let path = this.getPath();
    let dir = atom.config.get('smartcsv.scenariosDir');
    let name = path.slice(path.lastIndexOf(dir) + dir.length);
    name = name.replace(/^\//, '');
    return name.substr(0, name.lastIndexOf('.'));
  }

  getHumanName() {
    return this.getName.replace('/', '-');
  }

  updateRows(object) {
    //CompositeDisposable = require('atom').CompositeDisposable
    //@subscriptions = new CompositeDisposable
    //@subscriptions.add @csvEditor.editor.onDidChangeCursorPosition({newPosition, oldPosition}) =>
    //  alert(33)
    let cell, existRows, view;
    let lastID = 0;
    this.roots = Array.from(object).map((params) =>
      ((() => { switch (params.type) {
        case 'check': cell = new Cell(params); return view = new CheckCellView();
        default: cell = new Cell(params); return view = new CellView();
      } })(),

      view.initialize(cell),

      existRows = this.list.children(`#${view.id}`),
      console.log("Row exists", existRows),
      console.log(view.item),

      __guard__(existRows.last(), x => x[0]) ?
        existRows.html(view.item)
      :
        this.list[0].appendChild(view),
      lastID = view.id,
      view)
    );
    this.scroller.scrollDown()
    return lastID;
  }

  setModel(csvEditor) {
    return this.csvEditor = csvEditor;
  }
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
  save() {
    return this.csvEditor.editor.save();
  }

  splitRangesToRows() {
    let ranges = this.csvEditor.editor.getSelectedRanges();
    let firstRow = this.getFirstRow();
    let rows = {};
    for (let range of Array.from(ranges)) {
      for (let row of __range__(range.start.row, range.end.row, false)) {
        if (rows[row] == null) { rows[row] = []; }
        for (let column of __range__(range.start.column, range.end.column, false)) {
          if (rows[row][column] == null) { rows[row].push(firstRow[column]); }
        }
      }
    }
    console.log(rows);
    return rows;
  }

  getFirstRow() {
    let row = _.clone(this.csvEditor.editor.table.getFirstRow());
    let nextColName = 1;
    for (let i of __range__(0, row.length, true)) {
      let name = row[i];
      if (!isNaN(name * 1)) {
        row[i] = nextColName++;
      }
    }
    return row;
  }

  getWorkColumn(column) {
    if (this.firstRow == null) { this.firstRow = this.getFirstRow(); }
    console.log({firstRow: this.firstRow, column});
    return this.firstRow.indexOf(column);
  }

  setCursorAtPosition(position) {
    return this.csvEditor.editor.setCursorAtPosition(position);
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
