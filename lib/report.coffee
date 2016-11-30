$ = require('atom-space-pen-views').$
$$ = require('atom-space-pen-views').$$

fs = require 'fs',
xml2js = require 'xml2js'

module.exports =
class Report

  getObject: (path) ->
    #@parseXml('D:\\Projects\\Work\\elite\\dic\\gui\\ec_dic.xml')
     rawObject = @parseXml(path)
     rawObject.cells

  parseXml: (path) ->
    res = null
    parser = new xml2js.Parser()
    data = fs.readFileSync path

    parser.parseString data, (err, result) ->
      res = result
    res

  setRow: (@model) ->
    {row} = @model
    @pane.append $ ->
      @div class: 'row', outlet: 'row'

    @row.textContent = @setInner(row)

  setInner: (@model) ->
    {field, expected, actual} = @model
    @row.append $ ->
      @table =>
        @thead =>
          @th 'field'
          @th 'expected'
          @th 'actual'
        @tr =>
          @td field
          @td expected
          @td actual
