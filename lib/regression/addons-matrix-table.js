'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'


import LibraryWatch from '../library/library-watch'


export default class AddonsMatrixTable {
  constructor() {
    this.subscriptions = new CompositeDisposable()

    //this.autocomplete = new Autocomplete()

    dir = atom.config.get('elitecsv.projectPath')

    const libraryDirs = [
      dir + '/TestScenarios/EE',
      dir + '/TestScenarios/EG'
    ]
    this.library = new LibraryWatch()
    this.subscribeToLibrary()
    this.library.loadDirs(libraryDirs)

    // this.dictionary = new DictionaryWatch()
    // this.subscribeToLibrary()
    // this.dictionary.load()

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
