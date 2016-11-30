path = require 'path'
#fs = require 'fs-plus'
{CompositeDisposable, Emitter} = require 'event-kit'
{repoForPath} = require './helpers'

module.exports =
class Cell
  constructor: ({ @parent, @row, @column, @name, field}) ->
    @fields = field
    @destroyed = false
    @emitter = new Emitter()
    @subscriptions = new CompositeDisposable()

    #@subscribeToRepo()
    @updateStatus()

  destroy: ->
    @destroyed = true
    @subscriptions.dispose()
    @emitter.emit('did-destroy')

  onDidDestroy: (callback) ->
    @emitter.on('did-destroy', callback)

  onDidStatusChange: (callback) ->
    @emitter.on('did-status-change', callback)

  # Subscribe to the project's repo for changes to the Git status of this file.
  subscribeToRepo: ->
    repo = repoForPath("/")
    return unless repo?

    @subscriptions.add repo.onDidChangeStatus (event) =>
      @updateStatus(repo) if @isPathEqual(event.path)
    @subscriptions.add repo.onDidChangeStatuses =>
      @updateStatus(repo)

  # Update the status property of this directory using the repo.
  updateStatus: ->
    #if newStatus isnt @status
    #  @status = newStatus
    #  @emitter.emit('did-status-change', newStatus)
