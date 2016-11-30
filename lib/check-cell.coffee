path = require 'path'
#fs = require 'fs-plus'
{CompositeDisposable, Emitter} = require 'event-kit'
{repoForPath} = require './helpers'
Cell = require './cell'

module.exports =
class CheckCell extends Cell
