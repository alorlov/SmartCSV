jsonfile = require 'node-jsonfile'
fs = require 'fs',
xml2js = require 'xml2js'
{CompositeDisposable, Emitter} = require 'event-kit'
Runner = require './runner'
#PathWatcher = require 'pathwatcher'

module.exports = class RunnerChild extends Runner

  dif: ->
    console.log 'im a child'
