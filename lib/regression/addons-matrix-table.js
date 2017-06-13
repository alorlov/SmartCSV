'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'

import Autocomplete from '../autocomplete/autocomplete'
import LibraryAutocompleteModel from '../autocomplete/library-autocomplete-model'
import Library from '../library/library'


export default class AddonsMatrixTable {
  constructor() {
    this.subscriptions = new CompositeDisposable
    this.libraryAutocompleteModel = new LibraryAutocompleteModel
    this.autocomplete = new Autocomplete(this.libraryAutocompleteModel)

    this.library = new Library()
    this.subscribeToLibrary()
    this.library.load()
  }

  subscribeToLibrary () {
    this.subscriptions.add(this.library.onDidChange(items => {
      const autoItems = []
      for (var libName in items) {
        if (items.hasOwnProperty(libName)) {
          const libItems = items[libName]
          for (item of libItems) {
            const dir = item.getDirName()
            if(autoItems[dir] == null) {
              autoItems[dir] = []
            }
            autoItems[dir].push({name: item.getName(), displayName: item.getName(), block1: item.getRequiredVars(), block2: item.getWith(), block3: item.getWithout(), item: item})
          }
        }
      }
      // console.log(autoItems)
      this.libraryAutocompleteModel.setItems(autoItems)
    }))
  }
}
