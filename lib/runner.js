'use babel'

import jsonfile from 'node-jsonfile';
let fs = require('fs');
let xml2js = require('xml2js');
import { CompositeDisposable, Emitter } from 'event-kit';
//PathWatcher = require 'pathwatcher'

export default class Runner {
  constructor(report) {
    this.cellsPath = atom.config.get('smartcsv.storageDir') + '/jf-report.xml';
    this.jfCommandsPath = atom.config.get('smartcsv.storageDir') + '/jf-commands.json';
    this.report = report;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.started = false;
    this.lastReportLength = 0;
  }

  toggle() {
    if (this.started) { return this.stop(); } else { return this.start(); }
  }

  start() {
    this.report.save();
    this.report.show();
    this.started = true;
    this.watchCellsID = this.watchCells()
    this.watchJfCommands()
    return this.emitter.emit('did-start');
  }

  stop() {
    this.started = false;
    this.watchCellsID.close()
    return this.emitter.emit('did-stop');
  }

  isStarted() {
    return this.started;
  }

  update() {}

  writeCommand(object) {
    let path = atom.config.get('smartcsv.storageDir') + '/atom-commands.json';
    return jsonfile.writeFile(path, object);
  }

  onDidStart(callback) {
    return this.emitter.on('did-start', callback);
  }

  onDidStop(callback) {
    return this.emitter.on('did-stop', callback);
  }

  toggleRunSelected() {
    if (!this.isStarted()) {
      this.writeCommand({
          start: {
            scenario: this.report.getName() + '.csv',
            type: 'run-selected',
            rows: this.report.splitRangesToRows()
          }
      });
    }
    return this.toggle();
  }

  setLastIDCommand(id) {
    return this.writeCommand({
        setLastID: {
          id
        }
    });
  }

  hasReportUpdate() {
    let data = fs.readFileSync(this.cellsPath)
    return data.length > 0
  }

  updateReport() {
    let lastID = false;
    let object = this.getObject(this.cellsPath);

    if (object.length > 0) {
      lastID = this.report.updateRows(object); //if object.length > @lastReportLength
      //this.report.updateRows(object); //if object.length > @lastReportLength
    }
    return lastID;
  }

  watchCells() {
    return fs.watch(this.cellsPath, () => {
      let lastID = this.updateReport()
      if (lastID) { this.setLastIDCommand(lastID) }
    });
  }

  watchJfCommands() {
    fs.watch(this.jfCommandsPath, (eventType, filename) => {
      return jsonfile.readFile(this.jfCommandsPath, (err, object) => {
        if (object != null) { return; }
        return Array.from(object).map((name) => {
          switch (name) {
            case 'stop': return this.stop();
          }
        })
      })
    })
  }

  getObject(path) {
    let rawObject = this.parseXml(path);
    let object = (() => {
      let result = [];
      for (let cell of Array.from(rawObject.cells.cell)) {
        let res = {
          id: cell.id[0],
          type: cell.type[0],
          row: cell.row[0] * 1,
          column: cell.col[0] * 1,
          name: cell.name[0],
          actual: cell.actual[0],
          parent: cell.parent[0]
        };

        if (cell.field != null) {
          var resf;
          res.field = Array.from(cell.field).map((field) =>
            (resf = {
              expected: field.expected[0],
              actual: field.actual[0],
              result: field.result[0],
              name: field.name[0]
            },
            resf));
        }
        result.push(res);
      }
      return result;
    })();
    return object;
  }


  parseXml(path) {
    let res = null;
    let parser = new xml2js.Parser();
    let data = fs.readFileSync(path);

    parser.parseString(data, function(err, result) {
      if (err) { atom.notifications.addWarning("ParseXML failed", {detail: err}); }
      return res = result;
    });
    return res;
  }
};
