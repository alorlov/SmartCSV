'use babel'

import {Emitter, CompositeDisposable} from 'atom'
import SuggestionList from './suggestion-list'

export default class DictionarySuggestionList extends SuggestionList {
  constructor() {
    super()
    this.emitter = new Emitter()
  }

}
