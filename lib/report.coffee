$ = require('atom-space-pen-views').$
$$ = require('atom-space-pen-views').$$

fs = require 'fs',
xml2js = require 'xml2js'

module.exports =
class Report

  getObject: (path) ->
    #@parseXml('D:\\Projects\\Work\\elite\\dic\\gui\\ec_dic.xml')
    rawObject = @parseXml(path)
    object = for cell in rawObject.cells.cell
      res =
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
