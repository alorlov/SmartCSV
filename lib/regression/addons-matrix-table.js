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


}
