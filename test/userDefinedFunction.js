/* eslint-env mocha */
const assert = require('assert')

let schema
let sourceConfig

describe('User-defined functions', function () {
  beforeEach(function (done) {
    sourceConfig = require('../source-configs')
    sourceConfig.configs = {}
    schema = {
      userFunction: 'user-defined function'
    }
    done()
  })

  it('should expect user-defined function is true', function (done) {
    schema.userFunction = function () {
      return true
    }

    sourceConfig(schema)

    assert.deepStrictEqual(sourceConfig.configs.userFunction, true)
    done()
  })

  it('should expect user-defined function is undefined', function (done) {
    sourceConfig(schema)

    assert.deepStrictEqual(sourceConfig.configs.userFunction, null)
    done()
  })
})
