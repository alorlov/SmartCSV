module.exports =
  class ButtonControlView extends HTMLElement

    initialize(type): ->
      @button = document.createElement('span')
      @button.classList.add('entry')
      @button.dataset.name = type
      @button.textContent = 'run-' + type
      @appendChild(@button)

    activate: ->
      @classList.add('active')

    deactivate: ->
      @classList.remove('active')

    toggle: ->
      if @classList.contains('active') then @deactivate else @activate
