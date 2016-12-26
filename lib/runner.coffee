jsonfile = require 'node-jsonfile'
fs = require 'fs',
xml2js = require 'xml2js'
{CompositeDisposable, Emitter} = require 'event-kit'
#PathWatcher = require 'pathwatcher'

module.exports = class Runner
  constructor: (@report) ->
    @emitter = new Emitter()
    @subscriptions = new CompositeDisposable()
    @started = false
    @lastReportLength = 0

  toggle: ->
    if @started then @stop() else @start()

  start: ->
    @report.save()
    @report.show()
    @started = true
    @intervalID = setInterval =>
      lastID = @updateReport()
      @setLastIDCommand(lastID) if lastID
      @watchStop()
    , 1000
    @emitter.emit('did-start')

  stop: ->
    @started = false
    clearInterval(@intervalID)
    @emitter.emit('did-stop')

  isStarted: ->
    @started

  update: ->

  writeCommand: (object) ->
    path = atom.config.get('smartcsv.storageDir') + '/atom-commands.json'
    jsonfile.writeFile path, object

  onDidStart: (callback) ->
    @emitter.on('did-start', callback)

  onDidStop: (callback) ->
    @emitter.on('did-stop', callback)

  toggleRunSelected: ->
    unless @isStarted()
      @writeCommand
          start:
            scenario: @report.getName() + '.csv'
            type: 'run-selected'
            rows: @report.splitRangesToRows()
    @toggle()

  setLastIDCommand: (id) ->
    @writeCommand
        setLastID:
          id: id

  updateReport: ->
    path = atom.config.get('smartcsv.storageDir') + '/jf-report.xml'
    lastID = false
    object = @getObject(path)
    console.log 3, object
    if object.length > 0
      lastID = @report.updateRows(object) #if object.length > @lastReportLength
    lastID

  watch: (path) ->
    try
      @watchSubscription ?= PathWatcher.watch path, (eventType) =>
        switch eventType
          when 'change' then @updateReport()

  watchStop: ->
    path = atom.config.get('smartcsv.storageDir') + '/jf-commands.json'
    jsonfile.readFile path, (err, object) ->
      return if object?
      for name in object
        switch name
          when 'stop' then @stop()

  getObject: (path) ->
    #@parseXml('D:\\Projects\\Work\\elite\\dic\\gui\\ec_dic.xml')
    rawObject = @parseXml(path)
    console.log 2, rawObject
    object = for cell in rawObject.cells.cell
      res =
        id: cell.id[0],
        type: cell.type[0],
        row: cell.row[0] * 1,
        column: cell.col[0] * 1,
        name: cell.name[0],
        parent: cell.parent[0]

      if cell.field?
        res.field = for field in cell.field
          resf =
            expected: field.expected[0],
            actual: field.actual[0],
            result: field.result[0],
            name: field.name[0]
          resf
      res
    object


  parseXml: (path) ->
    res = null
    parser = new xml2js.Parser()
    data = fs.readFileSync path

    parser.parseString data, (err, result) ->
      atom.notifications.addWarning("ParseXML failed", detail: err) if err
      res = result
    res
