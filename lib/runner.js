'use babel'

import jsonfile from 'node-jsonfile';
let fs = require('fs');
let xml2js = require('xml2js');
import { CompositeDisposable, Emitter } from 'event-kit';
import Report from './regression/report';
import _ from 'underscore-plus';
//PathWatcher = require 'pathwatcher'
import path from 'path'

export default class Runner {
  constructor(report) {
    var storageDir = atom.config.get('elitecsv.projectPath') + '/logs/reports'
    this.cellsPath = storageDir + '/jf-report.json';
    this.jfCommandsPath = storageDir + '/jf-commands.json';
    this.atomCommands = storageDir + '/atom-commands.json';
    this.report = report;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.started = false;
    this.lastReportLength = 0;
    this.watchStack = {}

    this.setStopMethod(localStorage.getItem('runStopMethod'))

    /*jsonfile.readFile(storageDir + '/test.json', (err, object) => {
      console.log('test', object, err)
    })*/
  }

  toggle(manual = true) {
    if (this.started) { return this.stop(manual); } else { return this.start(manual); }
  }

  start() {
    this.activePath = path.normalize(atom.workspace.getActivePaneItem().getPath())
    this.report.save()
    this.report.addReport(this.activePath, [], 'live')
    this.report.showReport(this.activePath, 'live')
    this.started = true;
    this.watchCellsID = this.watchCells()
    this.watchJfCommandsID = this.watchJfCommands()
    return this.emitter.emit('did-start')
  }

  stop(manual = true) {
    if(manual) {
      this.manualStop()
      return
    }
    this.started = false;
    this.watchCellsID.close()
    this.watchJfCommandsID.close()
    return this.emitter.emit('did-stop')
  }

  forcedStop() {
    this.stop(false)
    return this.emitter.emit('did-forced-stop')
  }

  isStarted() {
    return this.started;
  }

  writeCommand(object) {
    console.log('to JF', object)
    return jsonfile.writeFile(this.atomCommands, object);
  }

  onDidStart(callback) {
    return this.emitter.on('did-start', callback);
  }

  onDidForcedStop(callback) {
    return this.emitter.on('did-forced-stop', callback);
  }

  onDidManualStop(callback) {
    return this.emitter.on('did-manual-stop', callback);
  }

  onDidStop(callback) {
    return this.emitter.on('did-stop', callback);
  }

  setStopMethod (method) {
    if (method == null) {
      method = 'all'
    }
    this.stopMethod = method
    localStorage.setItem('runStopMethod', method)
  }

  toggleRunSelected() {
    if (!this.isStarted()) {
      let rows = this.report.splitSelectedToRows()
      if (Object.keys(rows).length == 0) {
        return atom.notifications.addWarning('Please, re-select actions for running')
      }
      this.writeCommand({
          start: {
            scenario: this.report.getName() + '.csv',
            type: 'run-selected',
            rows: rows,
            stopOnFail: this.stopMethod
          }
      });
    }
    return this.toggle();
  }

  toggleRunFrom() {
    if (!this.isStarted()) {
      this.writeCommand({
          start: {
            scenario: this.report.getName() + '.csv',
            type: 'run-selected',
            rows: this.report.splitFromCursorToRows(),
            stopOnFail: this.stopMethod
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

  manualStop() {
    this.writeCommand({
        stop : true
    });
    this.emitter.emit('did-manual-stop')
  }

  hasReportUpdate() {
    let data = fs.readFileSync(this.cellsPath)
    return data.length > 0
  }

  readReport(path) {
    return new Promise(resolve => {
      jsonfile.readFile(path, (err, object) => {
        console.log('from JF.Report', object, err)
        if (object == null || object.length == 0) { return; }
        //return object != null ? object : []
        resolve (object)
      })
    })
  }

  watchCells() {
    return this.watch(this.cellsPath, () => {
      this.readReport(this.cellsPath)
      .then(object => {
        this.report.updateReportLive(this.activePath, object);
        lastID = _.last(object).id
        if (lastID) { this.setLastIDCommand(lastID) }
      })
    });
  }

  watchJfCommands() {
    return this.watch(this.jfCommandsPath, (eventType, filename) => {
      jsonfile.readFile(this.jfCommandsPath, (err, object) => {
        console.log('from JF.Command', object, err)
        if (object == null) { return; }
        for (var name of Object.keys(object)) {
          switch (name) {
            case 'stop': this.stop(false); break
            case 'forcedStop': this.forcedStop(); break
          }
        }
      })
    })
  }

  watch(path, callback) {
    this.watchStack[path] = {time: new Date().getTime(), data: ''}
    return fs.watch(path, (eventType, filename) => {
      let nowTime = new Date().getTime()
      let nowData = fs.readFileSync(path, "utf-8");
      if(nowTime - this.watchStack[path].time < 1000) {
        if (nowData == this.watchStack[path].data) {
          return
        }
      }
      this.watchStack[path] = {time: nowTime, data: nowData}
      callback(eventType, filename)
    })
  }

};
