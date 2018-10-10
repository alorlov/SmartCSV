'use babel'

import B from './b'
const Delegator = require('delegato')
const Pool = require('./mixins/pool')

class A implements B{
  constructor () {
    console.log('init a')
    Pool.includeInto(this)
    Delegator.includeInto(this)
  }

  getA () {
    console.log('a')
  }
}
module.exports = A
