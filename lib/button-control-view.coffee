{CompositeDisposable} = require 'event-kit'

module.exports =
class ButtonControlView extends HTMLElement
  initialize: (@button) ->
    @classList.add('entry')
    @item = document.createElement('button')
    @dataset.type = @button.type
    @item.classList.add('inline-block', 'btn')
    @item.textContent = 'run-' + @button.type
    @appendChild(@item)

  activate: ->
    @item.classList.add('btn-success')

  deactivate: ->
    @item.classList.remove('btn-success')

  toggle: ->
    if @item.classList.contains('btn-success') then @deactivate() else @activate()

module.exports = document.registerElement('smartcsv-control-button', prototype: ButtonControlView.prototype, extends: 'span')
