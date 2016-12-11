path = require 'path'
#fs = require 'fs-plus'
{CompositeDisposable, Emitter} = require 'event-kit'
{repoForPath} = require './helpers'
Cell = require './cell'

module.exports =
class ClickCell extends Cell ->
  constructor: (serializeState) ->
    super serializeState
