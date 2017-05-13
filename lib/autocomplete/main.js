/** @babel */

import {CompositeDisposable} from 'atom'
import CommandPaletteView from './view'

export default class Autocomplete {
  constructor() {}

  activate () {
    this.commandPaletteView = new CommandPaletteView()
    this.disposables = new CompositeDisposable()
    this.disposables.add(atom.commands.add('atom-workspace', 'elitecsv-palette:toggle', () => {
      this.commandPaletteView.toggle()
    }))
    this.disposables.add(atom.config.observe('elitecsv-palette.useAlternateScoring', (newValue) => {
      this.commandPaletteView.update({useAlternateScoring: newValue})
    }))
    this.disposables.add(atom.config.observe('elitecsv-palette.preserveLastSearch', (newValue) => {
      this.commandPaletteView.update({preserveLastSearch: newValue})
    }))
    this.disposables.add(this.commandPaletteView.onDidConfirmSelection(event => {
      console.log(event)
    }))
    return this.commandPaletteView.show()
  }

  async deactivate () {
    this.disposables.dispose()
    await this.commandPaletteView.destroy()
  }
}
