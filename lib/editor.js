'use strict'

let _

module.exports = class Editor {
  constructor () {

  }

  getValue (position) {
    return this.editor.getValueAtPosition(position)
  }

}
