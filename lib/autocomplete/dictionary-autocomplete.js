'use babel'

import {Emitter, CompositeDisposable} from 'atom'

export default class DictionaryAutocompleteModel extends AutocompleteModel {
  constructor() {
    this.emitter = new Emitter()
  }

}
