'use babel'

import MatrixSyntax from '../lib/syntax/matrix-syntax'
import ActionSyntax from '../lib/syntax/action-syntax'
//import _ from 'underscore-plus'

describe ("Check render", () => {
  it ("has static methods via array of classes", () => {
    let a = [MatrixSyntax, ActionSyntax]
    for (syntax of a) {
      let a = syntax.tryNew()
      expect(a).toBe("life")
    }
  })

  describe ("Check clone", () => {
    it ("doesn't clone inner objects", () => {
      var _ = require('underscore-plus')
      let inner = {prop : 1}
      let a = {childs : [inner], own : 'a'}
      let b = _.clone(a)
      inner.prop = 2
      b.own = 'b'
      expect(a.childs[0].prop).toBe(2)
      expect(a.own).toBe('a')
      expect(b.childs[0].prop).toBe(2)
      expect(b.own).toBe('b')
    })
  })
})
