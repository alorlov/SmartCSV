'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'

import ThreadTable from './regression/thread-table'
import StoriesTable from './regression/stories-table'

export default class Regression {
  constructor(editor) {
    this.subscriptions = new CompositeDisposable
    this.editor = editor
    new StoriesTable(editor)
    //new ThreadTable(editor)
    return editor
  }


}
