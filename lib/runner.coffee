jsonfile = require 'node-jsonfile'
fs = require 'fs',
xml2js = require 'xml2js'
{CompositeDisposable, Emitter} = require 'event-kit'

module.exports = class Runner
  constructor: (@report) ->
    @emitter = new Emitter()
    @subscriptions = new CompositeDisposable()
    @started = false
    @path = 'D:\\Projects\\Work\\elite\\logs\\reports\\100.xml'
    @lastReportLength = 0

  toggle: ->
    if @started then @stop() else @start()

  start: ->
    @started = true
    @report.show()
    @intervalID = setInterval =>
      @updateReport()
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

  updateReport: ->
    path = atom.config.get('smartcsv.storageDir') + '/jf-report.xml'
    object = @getObject(path)
    console.log object
    @report.updateRows(object[@lastReportLength..]) #if object.length > @lastReportLength
    #@lastReportLength = object.length

  getObject: (path) ->
    #@parseXml('D:\\Projects\\Work\\elite\\dic\\gui\\ec_dic.xml')
    rawObject = @parseXml(path)
    object = for cell in rawObject.cells.cell
      res =
        type: cell.type[0],
        row: cell.row[0] * 1,
        column: cell.col[0] * 1,
        name: cell.name[0],
        parent: cell.parent[0]

      if res.field?
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
      res = result
    res
