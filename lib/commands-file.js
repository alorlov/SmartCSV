'use babel'

const {Emitter, CompositeDisposable} = require('atom')
import Commands from './commands'
import jsonfile from 'node-jsonfile'
var chokidar = require('chokidar')
var fs = require('fs')
var path = require('path')
var asap = require('asap')

class CommandsFile extends Commands {
  constructor (mediator, path) {
    super(mediator)
    this.pathAtom = path + '/atom-commands'
    this.pathJF = path + '/jf-commands'

    this.mediator.subscribe('threads-new-request', request => this.send(request))

    this.makeDir(this.pathJF)
    this.watch(this.pathJF)
  }

  makeDir (path) {
    if (!fs.existsSync(path, err => {
        if (err) throw err
    })) {
      fs.mkdirSync(path, (err, data) => {
        if (err) throw err
      })
    } else {
      this.cleanDirSync(path)
    }
  }

  cleanDirSync (dir) {
  	var list = fs.readdirSync(dir);
  	for(var i = 0; i < list.length; i++) {
  		var filename = path.join(dir, list[i]);
  			fs.unlinkSync(filename);
  	}
  }

  send (request) {
    console.log('send request file', request)
    return jsonfile.writeFile(this.pathAtom + '/' + new Date().getTime(), request.getParams());
  }

  watch (path) {
    // Initialize watcher.
    var watcher = chokidar.watch(path, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 1000,
        pollInterval: 100
      }
    });

    // Something to use when events are received.
    var log = console.log.bind(console);
    // Add event listeners.
    watcher
      .on('add', path => {
        log(`File ${path} has been added`)
        // fs.readFile(path, (err0, data) => {
        //   if (err0) throw err0
        //   console.log(path, data)
          // asap(() => {
            jsonfile.readFile(path, (err, request) => {
              if (err) throw err

              fs.unlink(path, err => {
                if (err) throw err
              })
              console.log(path, request)
              this.mediator.handleRequest(request)
            })
          // })
        // })
        //jsonfile.deleteFile(path)
      })
      .on('change', path => log(`File ${path} has been changed`))
      .on('unlink', path => log(`File ${path} has been removed`));

  }
}

module.exports = CommandsFile
