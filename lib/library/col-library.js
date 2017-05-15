'use babel'

import { CompositeDisposable, Emitter } from 'event-kit'

export default class LibraryCol {
  constructor (name) {
    this.name = name
    this.optionalVars = []
    this.requiredVars = []
    this.with = []
    this.without = []
    this.actions = []
  }

  addVar (obj, required = false) {
    if (required) {
      this.requiredVars.push(obj)
    }
    else {
      this.optionalVars.push(obj)
    }
  }

  addWith (value) {
    this.with.push(value)
  }

  addWithout (value) {
    this.without.push(value)
  }

  addAction (value) {
    this.actions.push(value)
  }

  getName () {
    return `${this.name.block}-${this.name.col}-${this.name.lib}`
  }
  getLibName () {
    return this.name.lib
  }

  getRequiredVars () {
    const b = []
    this.requiredVars.map(({name}) => b.push(name))
    return b
  }

  getWith () {
    return this.with
  }

  getWithout () {
    return this.without
  }

}
