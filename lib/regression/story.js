'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'
import Database from '../database'

export default class Story {
  constructor ({story_id, name, subject}) {
    this.id = story_id
    this.name = name
    this.subject = subject
    this.after = 0
  }

  getID () { return this.id }

  setOrderAfter (id) {
    this.after = id
    this.database.query(`UPDATE story SET after = ${id} WHERE story_id = ${this.id}`)
  }

  getName() { return this.name }
  setName (name) {
    this.name = name
    this.database.query(`UPDATE story SET name = ${name} WHERE story_id = ${this.id}`)
  }
}
