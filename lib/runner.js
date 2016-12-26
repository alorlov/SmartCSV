'use babel'

let xml2js;
import jsonfile from 'node-jsonfile';
let fs = require('fs',
xml2js = require('xml2js'));
import { CompositeDisposable, Emitter } from 'event-kit';
//PathWatcher = require 'pathwatcher'

export default class Runner {
  constructor(report) {
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
    this.intervalID = setInterval(() => {
      let lastID = this.updateReport();
      if (lastID) { this.setLastIDCommand(lastID); }
      return this.watchStop();
    }
    , 1000);
    return this.emitter.emit('did-start');
  }

  stop() {
    this.started = false;
    clearInterval(this.intervalID);
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

  updateReport() {
    let path = atom.config.get('smartcsv.storageDir') + '/jf-report.xml';
    let lastID = false;
    let object = this.getObject(path);
    console.log(3, object);
    if (object.length > 0) {
      lastID = this.report.updateRows(object); //if object.length > @lastReportLength
    }
    return lastID;
  }

  watch(path) {
    try {
      return this.watchSubscription != null ? this.watchSubscription : (this.watchSubscription = PathWatcher.watch(path, eventType => {
        switch (eventType) {
          case 'change': return this.updateReport();
        }
      }
      ));
    } catch (error) {}
  }

  watchStop() {
    let path = atom.config.get('smartcsv.storageDir') + '/jf-commands.json';
    return jsonfile.readFile(path, function(err, object) {
      if (object != null) { return; }
      return Array.from(object).map((name) =>
        (() => { switch (name) {
          case 'stop': return this.stop();
        } })());
    });
  }

  getObject(path) {
    //@parseXml('D:\\Projects\\Work\\elite\\dic\\gui\\ec_dic.xml')
    let rawObject = this.parseXml(path);
    console.log(2, rawObject);
    let object = (() => {
      let result = [];
      for (let cell of Array.from(rawObject.cells.cell)) {
        let res = {
          id: cell.id[0],
          type: cell.type[0],
          row: cell.row[0] * 1,
          column: cell.col[0] * 1,
          name: cell.name[0],
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
