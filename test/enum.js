/* eslint-env mocha */
const assert = require('assert')
const processArgv = process.argv.slice()
let sourceConfig
let schema

describe('Enums', () => {
  before(() => {
    sourceConfig = require('../source-configs')
    schema = require('./schema.json')
    sourceConfig.configs = {}
  })

  it('should pass with a valid enum', () => {
    process.argv.push('--http-method')
    process.argv.push('http')

    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.httpMethod, 'http')

    process.argv = processArgv
  })

  it('should use fallback with invalid enum', () => {
    process.argv.push('--http-method')
    process.argv.push('httpz')

    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.httpMethod, 'http')

    process.argv = processArgv
  })

  it('should use passed arg with invalid enum and no default', () => {
    process.argv.push('--no-default')
    process.argv.push('sometimes')

    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.enumWithoutDefault, null)

    process.argv = processArgv
  })
})
