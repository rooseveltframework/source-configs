const { describe, it, before, after } = require('node:test')
const assert = require('node:assert')
const processArgv = process.argv.slice()

let sourceConfig
let schema

describe('Enums', () => {
  before(() => {
    sourceConfig = require('../source-configs')
    schema = require('./schema.json')
  })

  after(() => {
    process.argv = processArgv
  })

  it('should pass with a valid enum', () => {
    process.argv.push('--http-method')
    process.argv.push('http')

    assert.deepStrictEqual(sourceConfig(schema).httpMethod, 'http')

    process.argv = processArgv.slice()
  })

  it('should use fallback with invalid enum', () => {
    process.argv.push('--http-method')
    process.argv.push('httpz')

    assert.deepStrictEqual(sourceConfig(schema).httpMethod, 'http')

    process.argv = processArgv.slice()
  })

  it('should use passed arg with invalid enum and no default', () => {
    process.argv.push('--no-default')
    process.argv.push('sometimes')

    assert.deepStrictEqual(sourceConfig(schema).enumWithoutDefault, null)

    process.argv = processArgv.slice()
  })
})
