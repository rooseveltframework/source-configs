const { describe, it, before, after } = require('node:test')
const assert = require('node:assert')
const processArgv = process.argv.slice()

let sourceConfig
let schema

describe('environment variables', () => {
  before(() => {
    process.argv = []
    schema = require('./schema.json')
    sourceConfig = require('../source-configs')
  })

  after(() => {
    process.argv = processArgv
  })

  it('should take a plain environment variable', () => {
    process.env.API_ROUTE = '/api'

    assert.strictEqual(sourceConfig(schema).apiRoute, '/api')

    delete process.env.API_ROUTE
  })

  it('should map a number string to an int', () => {
    process.env.TIMEOUT = '20'

    assert.strictEqual(sourceConfig(schema).timeout, 20)

    delete process.env.TIMEOUT
  })

  it('should map a bool string to a bool', () => {
    process.env.EX_BOOL = 'true'

    assert.strictEqual(sourceConfig(schema).exBool, true)

    delete process.env.EX_BOOL
  })

  it('should support arrays of environment variables', () => {
    process.env.FOO = 10

    assert.strictEqual(sourceConfig(schema).envVarArray, 10)

    delete process.env.FOO
  })

  it('should default when not passed in anything', () => {
    assert.strictEqual(sourceConfig(schema).exString, 'String')
  })
})
