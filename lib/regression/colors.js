'use babel'

import _ from 'underscore-plus'

export default class Colors {
  constructor(editor) {
    this.editor = editor
    this.table = this.editor.getTable()
    this.updateMeta()
  }


  updateMeta () {
    let row = this.table.getFirstRow()
    this.col = {
      case: row.indexOf('case'),
      scenario: row.indexOf('scenario'),
      vars: row.indexOf('vars')
    }
  }

  make (val, row, col) {
    if (val === undefined || val === '') {
      return ''
    }

    let casee = this.table.getValueAtPosition ([row, this.col.case]),
        scenario = this.table.getValueAtPosition ([row, this.col.scenario]),
        vars = this.table.getValueAtPosition ([row, this.col.vars])

    casee = casee === undefined ? '' : casee.trim()
    scenario = scenario === undefined ? '' : scenario.trim()
    vars = vars === undefined ? '' : vars.trim()

    let isCase = col == this.col.case,
        isScenario = col == this.col.scenario,
        isVars = col == this.col.vars,
        isWork = col > this.col.vars

    let el = val

    // Check Letter
    let i = val.lastIndexOf(' ')
    if (i > -1 && val.substr(i).indexOf('@') == -1) {
      var start = val.substr(0, i),
          end = ' ' + this.createLetter(val.substr(i + 1))
    } else {
      var start = val,
          end = ''
    }

    // Case head
    if (casee != '' && casee != undefined && (casee.indexOf('>') == -1)
         && (casee.substring(0, 1) != '$'))
    {
      if (casee == '-') {
        el = this.createComment(val)
      }
      else {
        if (isWork) el = this.createCaseRole(val)
        else el = this.createCase(val)

      }

    }

    // Vars row
    else if (vars != '')
    {
      if (isScenario && val == 'steps') el = this.createSteps(val)
      else {
        if (isScenario) el = this.createVarName(start) + end
        else if (isVars) el = this.createVarValue(val)
        else el = this.createVarCol(val)
      }
    }

    // Work cell
    else if (isWork)
    {
      if (val.match('[<>+]') != null) {}
      // Call @
      else if (val.indexOf('@') > -1) el = this.createCall(start)

      //
      else {

        let i = start.indexOf('.')
        let hasDot = i > -1
        let hasDialog = start.match('^[A-Z]+') != null,
            hasDefaultDialog = hasDialog && !hasDot,
            hasTemporaryDialog = hasDialog && hasDot,
            hasUtilitiesAction = !hasDialog && hasDot

        // Default dialog
        if (hasDefaultDialog) el = this.createDefaultDialog(start)
        // [Dialog.]Action
        else
        {
          el = ''
          // Temporary dialog
          if (hasTemporaryDialog) el = this.createTemporaryDialog(start.substr(0, i))

          let action = hasDot ? start.substr(i) : start
          // Add utilities action
          if (hasUtilitiesAction) el += this.createUtilitesAction(action)
          // Add general action
          else el += this.createGeneralAction(action)
        }
      }

      el += end
    }
    else if (isScenario) el = this.createComment(val)
    else if (isCase) el = this.createComment(val)
    else if (isCase) el = this.createComment(val)

    if (isCase && casee.substring(0,1) == '$') el = this.createCopypaste(val)
    
    return el
  }

  createElement(className, val) {
    //console.log(`<span class="${className}">${val}</span>`)
    return `<span class="wider ${className}">${val}</span>`
  }

  createCall (val) {
    let i = val.indexOf('@')
    let el = this.createElement('syntax--storage syntax--type syntax--var syntax--js', val.substr(0, i))
    el += this.createElement('syntax--comment', '@')
    let parts = val.substr(i + 1).split('-', 3)
    let a = this.createElement('syntax--comment', '-')
    if (parts.length > 0) el += this.createElement('syntax--support syntax--function syntax--dom syntax--js', parts[0])
    if (parts.length > 1) el += a + this.createElement('', parts[1])
    if (parts.length > 2) el += a + this.createElement('syntax--constant syntax--language syntax--js', parts[2])
    return el
  }

  createLetter (val) {
    return this.createElement('syntax--variable', val)
  }

  createDefaultDialog (val) {
    return this.createElement('syntax--entity syntax--name syntax--type syntax--class syntax--js syntax--default syntax-dialog syntax--ecsv', val)
  }

  createTemporaryDialog (val) {
    return this.createElement('syntax--entity syntax--name syntax--type syntax--class syntax--js syntax--temporary syntax-dialog syntax--ecsv', val)
  }

  createUtilitesAction (val) {
    return this.createAction(val)
  }

  createGeneralAction (val) {
    return this.createAction(val)
  }

  createAction (val) {
    let parts = val.split('-', 4)
    let a = this.createElement('syntax--comment', '-')
    if (parts.length > 0) el = this.createElement('syntax--storage syntax--type syntax--var syntax--js', parts[0])
    if (parts.length > 1) el += a + this.createElement('syntax--entity syntax--name syntax--function', parts[1])
    if (parts.length > 2) el += a + this.createElement('syntax--constant syntax--numeric syntax--decimal', parts[2])
    if (parts.length > 3) el += a + this.createElement('syntax--storage', parts[3])
    return el
  }

  createCaseRole (val) {
    return this.createElement('syntax--comment syntax--bold syntax--case', val)
  }

  createCase (val) {
    return this.createElement('syntax--comment syntax--bold syntax--case', val)
  }

  createVarName (val) {
    return this.createElement('syntax--entity syntax--name syntax--function', val)
  }

  createVarValue (val) {
    return this.createElement('syntax--string syntax--quoted', val)
  }

  createVarCol (val) {
    return this.createElement('syntax--string syntax--quoted', val)
  }

  createComment (val) {
    return this.createElement('syntax--comment', val)
  }

  createStepsScenario (val) {
    return el
  }

  createSteps (val) {
    return this.createElement('syntax--comment', val)
  }

  createStepsCol (val) {
    return el
  }

  createCopypaste (val) {
    return this.createElement('syntax--variable', val)
  }
}
