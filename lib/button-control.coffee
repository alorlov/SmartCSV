{CompositeDisposable, Emitter} = require 'event-kit'

module.exports =
class ButtonControl
  constructor: ({@type}) ->
