/* eslint-env mocha */
const assert = require('assert')
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

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api')

    delete process.env.API_ROUTE
  })

  it('should map a number string to an int', () => {
    process.env.TIMEOUT = '20'

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.timeout, 20)

    delete process.env.TIMEOUT
  })

  it('should map a bool string to a bool', () => {
    process.env.EX_BOOL = 'true'

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.exBool, true)

    delete process.env.EX_BOOL
  })

  it('should support arrays of environment variables', () => {
    process.env.FOO = 10

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.envVarArray, 10)

    delete process.env.FOO
  })

  it('should default when not passed in anything', () => {
    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.exString, 'String')
  })
})
