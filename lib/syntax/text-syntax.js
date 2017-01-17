'use babel'

/*
  Simplest syntax object
*/

import Syntax from './syntax'

class TextSyntax extends Syntax {
  constructor (cell) {
    this.cell = cell
  }

  render (map) {
    return this.cell.value
  }
}

module.exports = TextSyntax
