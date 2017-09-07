'use babel'

import {Emitter, CompositeDisposable} from 'atom'

export default class DictionarySuggestionList extends SuggestionList {
  constructor() {
    this.emitter = new Emitter()
  }

}
