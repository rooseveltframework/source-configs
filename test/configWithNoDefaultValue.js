const { describe, it } = require('node:test')
const assert = require('node:assert')

describe('string with no default value', () => {
  it('should correctly populate string with no default value', function () {
    const config = require('../source-configs')(require('./schema.json'))

    assert.deepStrictEqual(config.stringWithoutDefault, 'stringWithoutDefault')
  })
})
