/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('string with no default value', () => {
  before(function () {
    sourceConfig = require('../source-configs')
    sourceConfig.configs = {}
    schema = require('./schema.json')

    sourceConfig(schema)
  })

  it('should correctly populate string with no default value', function () {
    assert.deepStrictEqual(sourceConfig.configs.stringWithoutDefault, 'stringWithoutDefault')
  })
})
