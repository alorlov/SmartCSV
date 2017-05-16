'use babel'

const csv = require('csv')
const stream = require('stream')
const fs = require('fs');
import { File, CompositeDisposable, Emitter } from 'atom'
import LibraryCol from './col-library'
import Syntax from '../syntax/syntax'
import path from 'path'

export default class Library {
  constructor () {
    this.subscriptions = new CompositeDisposable
    this.emitter = new Emitter

    this.syntax = new Syntax
    this.items = []
  }

  load () {
    const dir = atom.config.get('elitecsv.projectPath')
    const files = [dir + '/TestScenarios/Agenda.csv']
    const options = {trim: true, relax_column_count: true, delimiter: ',', comment: "#", delimiter: ",", eof: false, escape: '"', fileEncoding: undefined, header: false, quote: '"', quoted: false, skip_empty_lines: false}

    const watchedDirs = [
      dir + '/TestScenarios/EE',
      dir + '/TestScenarios/EG'
    ]

    for (let dirPath of watchedDirs) {
      dirPath = path.normalize(dirPath)
      fs.readdir(dirPath, {}, (err, files) => {
        for (name of files) {
          if (!name.match('^[A-Z]')) {
            continue
          }

          const filePath = path.normalize(dirPath + '/' + name)
          this.loadFile(new File(filePath), options)
          .then(() => {
            console.log(name, this.items)
          })
        }
        this.subscribeToDir(dirPath, options)
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

  onDidChange(callback) {
    this.emitter.on('on-did-change', callback)
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
    const scenariosDir = path.normalize(atom.config.get('elitecsv.projectPath') + '/TestScenarios/')
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
        const tableName = file.getPath().replace(scenariosDir, '')
        // const tableName = path.basename(file.getPath(), '.csv')
        this.parseTable(tableName, output)
        resolve()
        this.emitter.emit('on-did-change', this.items)
      }
      input.on('readable', read)
      input.on('end', end)
      input.on('error', onerror)
    })
  }

  parseTable(tableName, table) {
    const shortTableName = path.basename(tableName, '.csv')
    const dirName = path.dirname(tableName)
    const colsByName = this.syntax.getColumnsByName(table)
    const workColumns = this.syntax.getWorkColumns(table)

    const blockRows = this.getBlockRows(table, colsByName)

    this.items[tableName] = []
    for (var blockName in blockRows) {
      if (blockRows.hasOwnProperty(blockName)) {
        const block = blockRows[blockName]

        for (let column of workColumns) {
          const value = block[0][column]
          if (value === undefined || value.trim() == '') {
            continue
          }
          const colName = value.trim()
          const item = new LibraryCol({dir: dirName, lib: shortTableName, block: blockName, col: colName})
          this.parseBlockColumns(item, block, column, colsByName)
          this.items[tableName].push(item)
        }
      }
    }
  }

  getBlockRows (data, col) {
    const ignore = ['-','>','','case']
    const blocks = []
    let curName = ''
    const curBlock = []

    for (let r of data) {
      const value = r[col.case]
      const caseValue = value === undefined ? '' : value.trim()
      if (ignore.indexOf(caseValue) == -1) {
        curName = caseValue
        block = []
        blocks[curName] = block
      }
      if (!curName) {
        continue
      }
      block.push(r)
    }
    return blocks
  }

  parseBlockColumns (item, blockData, column, col) {
    for (let i = 1, count = blockData.length; i < count; i++) {
      let r = blockData[i]
      let casee = r[col.case],
          scenario = r[col.scenario],
          vars = r[col.vars],
          value = r[column]

      casee = casee === undefined ? '' : casee.trim()
      scenario = scenario === undefined ? '' : scenario.trim()
      vars = vars === undefined ? '' : vars.trim()
      value = value === undefined ? '' : value.trim()

      let hasCase = casee != '',
          hasScenario = scenario != '',
          hasVars = vars != ''

      // Vars
      if (hasVars) {
        let varObj = this.parseVar(scenario, vars, value)
        if (value == '+') {
          item.addVar(varObj, true)
        }
        else {
          if (vars != '!') {
            item.addVar(varObj)
          }
        }
      }
      // Actions
      else {
        if (value.substr(0, 1) == '@') {
          item.addAction(value)
          item.addWith(value.substr(value.lastIndexOf('@') + 1))
        }
        else if (value.substr(0, 1) == '-') {
          item.addAction(value)
          item.addWithout(value.substr(value.lastIndexOf('@') + 1))
        }
        else if (value != ''){
          if (value == '+') {
            let j = column-1
            while (r[j] == '+') {
              j--
            }
            value = r[j]
          }
          item.addAction(value)
        }
      }
    }
  }

  parseVar (scenario, varValue, colValue) {
    var name = scenario,
          value = colValue,
          letter = ''

    const pipe = scenario.lastIndexOf(' ')
    if (pipe != -1) {
      name = scenario.substr(0, pipe)
      letter = scenario.substr(pipe + 1)
    }

    return {name, value, letter}
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
          return
        }
      }
      this.watchStack[path] = {time: nowTime, data: nowData}
      callback(eventType, filename)
    })
  }

}
