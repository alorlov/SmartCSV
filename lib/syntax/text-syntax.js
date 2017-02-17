'use babel'

/*
  Simplest syntax object
*/

import Syntax from './syntax'

class TextSyntax extends Syntax {
  constructor (cell) {
    super()
    this.cell = cell
  }

  getInstanceName () {
    return 'matrix'
  }

  render (map) {
    return this.cell.value
  }
}

module.exports = TextSyntax
