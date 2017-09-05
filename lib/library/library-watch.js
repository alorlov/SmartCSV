'use babel'

const csv = require('csv')
const stream = require('stream')
const fs = require('fs');
import LibraryCol from './col-library'
import Watch from './watch'
import path from 'path'

export default class LibraryWatch extends Watch{
  constructor () {
    super()
    this.scenariosDir = path.normalize(atom.config.get('elitecsv.projectPath') + '/TestScenarios/')
    this.options = {trim: true, relax_column_count: true, delimiter: ',', comment: "#", delimiter: ",", eof: false, escape: '"', fileEncoding: undefined, header: false, quote: '"', quoted: false, skip_empty_lines: false}
    this.subscribe()
  }

  subscribe () {
    this.subscriptions.add(this.onDidChange(items => {
      const autoItems = []
      for (var libName in items) {
        if (items.hasOwnProperty(libName)) {
          const libItems = items[libName]
          for (item of libItems) {
            const dir = item.getDirName()
            if(autoItems[dir] == null) {
              autoItems[dir] = []
            }
            autoItems[dir].push({name: item.getName(), displayName: item.getName(), block1: item.getRequiredVars(), block2: item.getWith(), block3: item.getWithout(), item: item})
          }
        }
      }
      // console.log(autoItems)
      this.emitter.emit('on-did-change-items', autoItems)
      // this.libraryAutocompleteModel.setItems(autoItems)
    }))
  }

  onDidChangeItems (callback) {
    return this.emitter.on('on-did-change-items', callback)
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

  parseFile(filename, table) {
    const tableName = filename.replace(this.scenariosDir, '')
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
          } else if (value != '') {
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

}
