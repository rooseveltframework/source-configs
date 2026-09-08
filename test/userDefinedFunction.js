const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')

let schema
let sourceConfig

describe('User-defined functions', function () {
  beforeEach(function () {
    sourceConfig = require('../source-configs')
    schema = {
      userFunction: 'user-defined function'
    }
  })

  it('should expect user-defined function is true', function () {
    schema.userFunction = function () {
      return true
    }

    assert.deepStrictEqual(sourceConfig(schema).userFunction, true)
  })

  it('should expect user-defined function is undefined', function () {
    assert.deepStrictEqual(sourceConfig(schema).userFunction, null)
  })
})
