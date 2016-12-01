
function getSmallTable () {
    if (!TableEditor) { TableEditor = require('./table-editor') }

    const table = new TableEditor()

    table.lockModifiedStatus()
    table.addColumn('key', {width: 150, align: 'right'})
    table.addColumn('value', {width: 150, align: 'center', grammarScope: 'source.js'})
    table.addColumn('locked', {width: 150, align: 'left'})

    const rows = new Array(100).fill().map((v, i) => [
      `row${i}`,
      Math.random() * 100,
      i % 2 === 0 ? 'yes' : 'no'
    ])

    table.addRows(rows)

    table.clearUndoStack()
    table.initializeAfterSetup()
    table.unlockModifiedStatus()
    return table
  }
