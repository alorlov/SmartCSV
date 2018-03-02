'use babel'

export default class Base {
  constructor () {

  }

  getConfig (name) {
    return atom.config.get('elitecsv.' + name)
  }

  openFile(uri, data = {}) {
    atom.workspace.open(
      uri,
      {pending: true, activatePane: false, searchAllPanes: true, data : data}
    )
    atom.views.getView(atom.workspace).focus()
  }

  getCurrentEliteEditor () {
    return atom.workspace.getActivePaneItem().editor.eliteTable
  }
}
