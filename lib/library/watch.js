'use babel'

const csv = require('csv')
const stream = require('stream')
const fs = require('fs');
import { File, CompositeDisposable, Emitter } from 'atom'
import path from 'path'

export default class Watch {
  constructor () {
    this.subscriptions = new CompositeDisposable()
    this.emitter = new Emitter()
    this.options = {}
    this.items = []
  }

  loadDirs (watchedDirs) {
    for (let dirPath of watchedDirs) {
      dirPath = path.normalize(dirPath)
      fs.readdir(dirPath, {}, (err, files) => {
        for (name of files) {
          if (!name.match('^[A-Z]')) {
            continue
          }

          const filePath = path.normalize(dirPath + '/' + name)
          this.loadFile(new File(filePath), this.options)
          .then(() => {
            // console.log(name, this.items)
          })
        }
        this.subscribeToDir(dirPath, this.options)
      })
    }
    //
    // return
    //
    // const file = new File(files[0])
    //
    // this.loadFile(file, options)
    // .then(() => {
    //   console.log(this.items)
    // })
    // this.subscribeToFile(file, options)
  }



  onDidDirChange(callback) {
    return this.emitter.on('on-did-dir-change', callback)
  }

  onDidChange(callback) {
    return this.emitter.on('on-did-change', callback)
  }

  subscribeToFile (file, options) {
    return this.watch(file.getPath(), (eventType, filename) => {
      this.loadFile(file, options)
      .then(() => {
        console.log(this.items)
      })
    })
  }

  subscribeToDir (dirPath, options) {
    return this.watchDir(dirPath, (eventType, filename) => {
      const filePath = path.normalize(dirPath + '/' + filename)
      const basename = path.basename(filePath, '.csv')
      if (!basename.match('^[A-Z]')) {
        return 'not type of library'
      }

      this.loadFile(new File(filePath), options)
      .then(() => {
        console.log(filePath, this.items)
      })
    })
  }

  loadFile (file, options = {}) {
    return new Promise((resolve, reject) => {
      const output = []
      const input = this.createReadStream(file, options)
      let length = 0

      const onerror = err => reject(err)

      const read = () => {
        let record
        while ((record = input.read())) {
          output.push(record)
          length = Math.max(length, record.length)
        }
      }

      const end = () => {
        this.parseFile(file.getPath(), output)
        resolve()
        this.emitter.emit('on-did-change', this.items)
      }
      input.on('readable', read)
      input.on('end', end)
      input.on('error', onerror)
    })
  }

  createReadStream (file, options) {
    const encoding = options.fileEncoding || 'utf8'
    const filePath = file.getPath()
    file.setEncoding(encoding)
    let input

    if (encoding === 'utf8') {
      input = fs.createReadStream(filePath, {encoding})
    } else {
      if (!iconv) { iconv = require('iconv-lite') }
      input = fs.createReadStream(filePath).pipe(iconv.decodeStream(encoding))
    }

    const { size } = fs.lstatSync(filePath)
    const parser = csv.parse(options)
    let length = 0

    const counter = new stream.Transform({
      transform (chunk, encoding, callback) {
        length += chunk.length
        this.push(chunk)
        callback()
      }
    })

    input.pipe(counter).pipe(parser)

    parser.stop = () => {
      input.unpipe(counter)
      counter.unpipe(parser)
      parser.end()
    }

    parser.getProgress = () => ({length, total: size, ratio: length / size})

    return parser
  }

  watch(path, callback) {
    if(!this.watchStack) {
      this.watchStack = []
    }
    this.watchStack[path] = {time: new Date().getTime(), data: ''}
    return fs.watch(path, (eventType, filename) => {
      let nowTime = new Date().getTime()
      let nowData = fs.readFileSync(path, "utf-8");
      if(nowTime - this.watchStack[path].time < 1000) {
        if (nowData == this.watchStack[path].data) {
          return
        }
      }
      this.watchStack[path] = {time: nowTime, data: nowData}
      callback(eventType, filename)
    })
  }

  addDir(dirPath) {
    this.watchDir(dirPath, (eventType, filename) => {
      const filePath = path.normalize(dirPath + '/' + filename)
      this.emitter.emit('on-did-dir-change', filename)
    })
  }

  watchDir(path, callback) {
    if(!this.watchStack) {
      this.watchStack = []
    }
    this.watchStack[path] = {time: new Date().getTime(), data: ''}
    return fs.watch(path, (eventType, filename) => {
      let nowTime = new Date().getTime()
      let nowData = fs.readFileSync(path + '/' + filename, "utf-8");
      if(nowTime - this.watchStack[path].time < 1000) {
        if (nowData == this.watchStack[path].data) {
          console.log('dublicates')
          return
        }
      }
      console.log(path, this.watchStack[path])
      this.watchStack[path] = {time: nowTime, data: nowData}
      callback(eventType, filename)
    })
  }

  destroy () {
    this.emitter.emit('did-destroy', this)
    this.emitter.dispose()
    this.emitter = null
    this.subscriptions.dispose()
    this.subscriptions = null
  }
}
