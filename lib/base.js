'use babel'

export default class Core {
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
}
