/** @babel */

import SelectListView from 'atom-select-list'
import AutocompleteView from './autocomplete-view'
import {humanizeKeystroke} from 'underscore-plus'
import fuzzaldrin from 'fuzzaldrin'
import fuzzaldrinPlus from 'fuzzaldrin-plus'
import {Emitter, CompositeDisposable} from 'atom'

export default class Aucocomplete {
  constructor () {
    this.disposables = new CompositeDisposable()
    this.emitter = new Emitter()

    // this.items = this.getItems()

    this.disposables.add(atom.config.observe('elitecsv-palette.useAlternateScoring', (newValue) => {
      this.update({useAlternateScoring: newValue})
    }))
    this.disposables.add(atom.config.observe('elitecsv-palette.preserveLastSearch', (newValue) => {
      this.update({preserveLastSearch: newValue})
    }))
    //this.update({didConfirmEmptySelection: true})

    this.keyBindingsForActiveElement = []
    this.commandsForActiveElement = []
    this.selectListView = new SelectListView({
      items: this.commandsForActiveElement,
      emptyMessage: 'No matches found',
      filterKeyForItem: (item) => item.displayName,
      elementForItem: ({name, displayName, block1, block2, block3}) => {
        const li = document.createElement('li')

        const divLeft = document.createElement('div')
        divLeft.className = 'left'
        li.appendChild(divLeft)

        const divRight = document.createElement('div')
        divRight.className = 'right'
        li.appendChild(divRight)

        li.classList.add('event')
        li.dataset.eventName = name

        const div = document.createElement('div')
        div.className = 'block0'
        div.title = name

        const query = this.prepareQuery(this.selectListView.getQuery())
        const matches = this.useAlternateScoring ? fuzzaldrinPlus.match(displayName, query) : fuzzaldrin.match(displayName, query)
        let matchedChars = []
        let lastIndex = 0
        for (const matchIndex of matches) {
          const unmatched = displayName.substring(lastIndex, matchIndex)
          if (unmatched) {
            if (matchedChars.length > 0) {
              const matchSpan = document.createElement('span')
              matchSpan.classList.add('character-match')
              matchSpan.textContent = matchedChars.join('')
              div.appendChild(matchSpan)
              matchedChars = []
            }

            div.appendChild(document.createTextNode(unmatched))
          }

          matchedChars.push(displayName[matchIndex])
          lastIndex = matchIndex + 1
        }

        if (matchedChars.length > 0) {
          const matchSpan = document.createElement('span')
          matchSpan.classList.add('character-match')
          matchSpan.textContent = matchedChars.join('')
          div.appendChild(matchSpan)
        }

        const unmatched = displayName.substring(lastIndex)
        if (unmatched) {
          div.appendChild(document.createTextNode(unmatched))
        }

        divLeft.appendChild(div)

        if (block1.length > 0) {
          const div = document.createElement('div')
          div.classList.add('block1')
          const items = block1.map(v => {
            const span = document.createElement('span')
            span.className = 'item'
            span.textContent = v
            div.appendChild(span)
          })
          divRight.appendChild(div)
        }
        if (block2.length > 0) {
          const div = document.createElement('div')
          div.classList.add('block2')
          const items = block2.map(v => {
            const span = document.createElement('span')
            span.className = 'item'
            span.textContent = v
            div.appendChild(span)
          })
          divRight.appendChild(div)
        }
        if (block3.length > 0) {
          const div = document.createElement('div')
          div.classList.add('block3')
          const items = block3.map(v => {
            const span = document.createElement('span')
            span.className = 'item'
            span.textContent = v
            div.appendChild(span)
          })
          divRight.appendChild(div)
        }

        return li
      },
      didConfirmSelection: (keyBinding) => {
        this.confirmFired = true
        const event = new CustomEvent(keyBinding.name, {bubbles: true, cancelable: true})
        this.activeElement.dispatchEvent(event)
        this.prepareQuery(this.selectListView.refs.queryEditor.getText())
        this.confirmSelection(this.selectListView.getSelectedItem().item)
        this.hide()
      },
      didChangeSelection: (e) => {
        //console.log(e)
      },
      didCancelSelection: () => {
        if (this.confirmFired) {
          return
        }
        this.hide()
        this.cancelSelection()
      }
    })
    this.selectListView.element.classList.add('elitecsv-palette')

    //this.registerCommands()
    this.hookSelectListView()
  }

  getItems () {

  }

  prepareQuery (query) {
    return query
  }

  cancelSelection (item) {

  }
  // registerCommands() {
  //   // atom.commands.add(this.selectListView.element, {
  //   //   'elitecsv:confirm-with': (event) => {
  //   //     this.with = true
  //   //     this.selectListView.confirmSelection()
  //   //     event.stopPropagation()
  //   //   }
  //   // })
  //
  //   //this.refs.queryEditor.onDidChange(this.didChangeQuery.bind(this)))
  // }

  addBindings (editor) {
    if (this.bindings && this.bindings.dispose) {
      this.bindings.dispose()
    }
    this.bindings = new CompositeDisposable()
    this.bindings.add(atom.commands.add(editor, {
      'core:move-up': (event) => {
        this.selectListView.selectPrevious()
        event.stopPropagation()
      },
      'core:move-down': (event) => {
        this.selectListView.selectNext()
        event.stopPropagation()
      },
      'core:confirm': (event) => {
        this.selectListView.confirmSelection()
        event.stopPropagation()
      },
      'core:cancel': (event) => {
        this.selectListView.cancelSelection()
        event.stopPropagation()
      }
    }))
  }

  setQuery(query) {
    this.selectListView.refs.queryEditor.setText(query)
  }

  hookSelectListView () {
    var self = this
    var getQuery = this.selectListView.getQuery
    this.selectListView.getQuery = function() {
      if (this.refs && this.refs.queryEditor) {
        return self.prepareQuery(this.refs.queryEditor.getText())
      } else {
        return ''
      }
    }
  }

  async destroy () {
    this.disposables.dispose()
    await this.selectListView.destroy()

    if (this.bindings && this.bindings.dispose) {
      this.bindings.dispose()
    }
  }

  isVisible() {
    return this.panel && this.panel.isVisible()
  }

  toggle () {
    if (this.panel && this.panel.isVisible()) {
      this.hide()
      return Promise.resolve()
    } else {
      return this.show()
    }
  }

  // attachTo (element) {
  //   element.appendChild(this.panel)
  // }

  attachTo (element) {
    //if (!this.panel) {
      this.panel = new AutocompleteView
      this.panel.initialize(this.selectListView.element)
      element.appendChild(this.panel)
      // this.panel = atom.workspace.addModalPanel({item: this.selectListView})
      // this.panel = this.editor.appendChild(this.selectListView.element)
    //}
  }

  setEditorPosition (top, left) {
    this.panel.setTop(top)
    this.panel.setLeft(left)
  }

  async show () {
    this.confirmFired = false
    // if (!this.panel) {
    //   this.panel = new AutocompleteView
    //   this.panel.initialize(this.selectListView.element)
    //   element.appendChild(this.panel)
    //   // this.panel = atom.workspace.addModalPanel({item: this.selectListView})
    //   // this.panel = this.editor.appendChild(this.selectListView.element)
    // }


    if (!this.preserveLastSearch) {
      this.selectListView.reset()
    } else {
      console.log(this.selectListView.refs.queryEditor.getText())
      this.selectListView.refs.queryEditor.selectAll()
    }

    this.activeElement = (document.activeElement === document.body) ? atom.views.getView(atom.workspace) : document.activeElement
    this.keyBindingsForActiveElement = atom.keymaps.findKeyBindings({target: this.activeElement})
    this.addBindings(this.activeElement)

    // this.commandsForActiveElement = atom.commands.findCommands({target: this.activeElement})
    this.commandsForActiveElement = this.getItems()
    // this.commandsForActiveElement = [{name: 'Create-CM-User', displayName: 'Crate CM User'},{name: 'Create-CA-User', displayName: 'Crate CA User'}]
    this.commandsForActiveElement.sort((a, b) => a.displayName.localeCompare(b.displayName))
    await this.selectListView.update({items: this.commandsForActiveElement})

    this.previouslyFocusedElement = document.activeElement
    this.panel.show()
    // this.selectListView.focus()
    //return this.selectListView
  }

  hide () {
    this.panel.hide()
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
      this.previouslyFocusedElement = null
    }

    if (this.bindings && this.bindings.dispose) {
      this.bindings.dispose()
    }
  }

  async update (props) {
    if (props.hasOwnProperty('preserveLastSearch')) {
      this.preserveLastSearch = props.preserveLastSearch
    }

    // if (props.hasOwnProperty('useAlternateScoring')) {
    //   this.useAlternateScoring = props.useAlternateScoring
    //   if (this.useAlternateScoring) {
    //     await this.selectListView.update({
    //       filter: (items, query) => {
    //         return query ? fuzzaldrinPlus.filter(items, query, {key: 'displayName'}) : items
    //       }
    //     })
    //   } else {
    //     await this.selectListView.update({filter: null})
    //   }
    // }
  }
}
