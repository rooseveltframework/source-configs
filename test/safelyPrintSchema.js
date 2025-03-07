/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('print config schema', () => {
  before(function () {
    sourceConfig = require('../source-configs')
    sourceConfig.configs = {}
    schema = require('./schema.json')

    sourceConfig(schema)
  })

  it('should safely print config schema', function () {
    const safeSchema = JSON.stringify(sourceConfig.safelyPrintSchema())
    assert.deepStrictEqual(safeSchema.includes('"sensitiveInfo":"********"'), true)
  })
})
