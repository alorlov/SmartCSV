'use babel'

const {Emitter, CompositeDisposable} = require('atom')
import Commands from './commands'
import jsonfile from 'node-jsonfile'
var chokidar = require('chokidar')

class CommandsFile extends Commands {
  constructor (path) {
    super()
    this.pathAtom = path + '/atom-commands'
    this.pathJF = path + '/jf-commands'

    this.watch(this.pathJF)
  }

  send (object) {
    console.log('send command file', object)
    return jsonfile.writeFile(this.path + '/' + new Date(), object);
  }

  watch (path) {
    // Initialize watcher.
    var watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    // Something to use when events are received.
    var log = console.log.bind(console);
    // Add event listeners.
    watcher
      .on('add', path => log(`File ${path} has been added`))
      .on('change', path => log(`File ${path} has been changed`))
      .on('unlink', path => log(`File ${path} has been removed`));

  }
}

module.exports = CommandsFile
