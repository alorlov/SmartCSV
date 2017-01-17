'use babel'

import Syntax from './syntax'

class ActionSyntax extends Syntax {
  constructor (cell) {
    super()
    this.cell = cell
  }

  static tryNew () {
    return "life"
  }

  render (map) {
    return this.cell.value
  }
}

module.exports = ActionSyntax
