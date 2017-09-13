'use babel'

import { File, CompositeDisposable, Emitter } from 'atom'
import LibraryCol from './col-library'
import Watch from './watch'
import path from 'path'

export default class DictionaryWatch extends Watch {
  constructor () {
    super()
  }

  parseFile(filename, data) {

  }
}
