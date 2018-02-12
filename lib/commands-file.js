'use babel'

const {Emitter, CompositeDisposable} = require('atom')
import Commands from './commands';
import jsonfile from 'node-jsonfile';

class CommandsFile extends Commands {
  constructor (path) {
    super()
    this.path = path
  }

  send (object) {
    console.log('send command file', object)
    return jsonfile.writeFile(this.path + '/' + new Date(), object);
  }
}

module.exports = CommandsFile
