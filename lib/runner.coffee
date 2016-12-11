jsonfile = require 'node-jsonfile'
fs = require 'fs',
xml2js = require 'xml2js'

module.exports = class Runner

  @started = false

  constructor: (@report) ->

  toggle: ->
    if @started then @stop() else @start()

  start: ->
    @started = true
    @report.show()
    @intervalID = setInterval =>
      @updateReport()
      console.log 1
    , 1000

  stop: ->
    @started = false
    clearInterval(@intervalID)

  isStarted: ->
    @started

  update: ->

  writeCommand: (rows) ->
    file = atom.config.get('smartcsv.storageDir') + 'rows.json'
    jsonfile.writeFile file, rows

  toggleRunSelected: ->
    unless @isStarted()
      ranges = @report.getSelectedRanges()
      @writeCommand @splitRangesToRows(ranges)
    @toggle()

  splitRangesToRows: (ranges) ->
    rows = {}
    for range in ranges
      for row in [range.start.row...range.end.row]
        rows[row] = [] unless rows[row]?
        for column in [range.start.column...range.end.column]
          rows[row].push(column) unless rows[row][column]?
    rows

  updateReport: ->
    object = @getObject('D:\\Projects\\Work\\elite\\logs\\reports\\100.xml')
    @report.updateRows(object)

  getObject: (path) ->
    #@parseXml('D:\\Projects\\Work\\elite\\dic\\gui\\ec_dic.xml')
    rawObject = @parseXml(path)
    object = for cell in rawObject.cells.cell
      res =
        id: cell.id[0],
        type: cell.type[0],
        row: cell.row[0],
        column: cell.column[0],
        name: cell.name[0],
        parent: cell.parent[0]
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
      console.log res
      console.log err
    res
