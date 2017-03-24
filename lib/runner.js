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
    this.atomCommands = atom.config.get('smartcsv.storageDir') + '/atom-commands.json';
    this.report = report;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.started = false;
    this.lastReportLength = 0;
    this.watchStack = {}
    //this.watchJfCommands()
  }

  toggle(manual = true) {
    if (this.started) { return this.stop(manual); } else { return this.start(manual); }
  }

  start() {
    this.report.save()
    this.report.show()
    this.started = true;
    this.watchCellsID = this.watchCells()
    this.watchJfCommandsID = this.watchJfCommands()
    return this.emitter.emit('did-start')
  }

  stop(manual = true) {
    if(manual) {
      this.stopJf()
      return
    }
    this.started = false;
    this.watchCellsID.close()
    this.watchJfCommandsID.close()
    return this.emitter.emit('did-stop')
  }

  isStarted() {
    return this.started;
  }

  update() {}

  writeCommand(object) {
    return jsonfile.writeFile(this.atomCommands, object);
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

  stopJf() {
    return this.writeCommand({
        stop : true
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
    return this.watch(this.cellsPath, () => {
      let lastID = this.updateReport()
      if (lastID) { this.setLastIDCommand(lastID) }
    });
  }

  watchJfCommands() {
    return this.watch(this.jfCommandsPath, (eventType, filename) => {
      jsonfile.readFile(this.jfCommandsPath, (err, object) => {
        if (object == null) { return; }
        for (var name of Object.keys(object)) {
          switch (name) {
            case 'stop': this.stop(false);
          }
        }
      })
    })
  }

  watchJfCommands2() {
    return fs.watch(this.jfCommandsPath, (eventType, filename) => {
      console.log('commands changed', filename)
      jsonfile.readFile(this.jfCommandsPath, (err, object) => {
        if (object == null) { return; }
        for (var name of Object.keys(object)) {
          switch (name) {
            case 'stop': this.stop();
          }
        }
      })
    })
  }

  watch(path, callback) {
    this.watchStack[path] = new Date().getTime()
    return fs.watch(path, (eventType, filename) => {
      let nowTime = new Date().getTime()
      if(nowTime - this.watchStack[path] <= 100) {
        return
      }
      this.watchStack[path] = nowTime
      console.log(path, nowTime)
      callback(eventType, filename)
    })
  }

  getObject(path) {
    let rawObject = this.parseXml(path);
    if(rawObject == null) {
      return []
    }
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
