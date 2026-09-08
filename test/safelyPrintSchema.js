const { describe, it } = require('node:test')
const assert = require('node:assert')

describe('print config schema', () => {
  it('should safely print config schema', function () {
    const config = require('../source-configs')(require('./schema.json'))

    const safeSchema = JSON.stringify(config.safelyPrintSchema())
    assert.deepStrictEqual(safeSchema.includes('"sensitiveInfo":"********"'), true)
  })
})
