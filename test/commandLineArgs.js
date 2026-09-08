const { describe, it, before, after } = require('node:test')
const assert = require('node:assert')
const processArgv = process.argv.slice()

const commandLineArguments = {
  'api-route': '/api/b',
  timeout: '4000',
  'ex-bool': 'true',
  a: 'foobar'
}

let config

describe('Command Line Arguments', () => {
  before(() => {
    // setup some cli flags
    process.argv = []
    process.argv.push('node')
    process.argv.push('app.js')
    process.argv.push('--api-route')
    process.argv.push('/api/b')
    process.argv.push('--timeout')
    process.argv.push('4000')
    process.argv.push('--ex-bool')
    process.argv.push('-a')
    process.argv.push('foobar')

    config = require('../source-configs')(require('./schema.json'))
  })

  after(() => {
    process.argv = processArgv
  })

  it('should expect an object parsed beforehand', () => {
    assert.deepStrictEqual(config.apiRoute, commandLineArguments['api-route'])
  })

  it('will parse strings to ints', () => {
    assert.deepStrictEqual(config.timeout, 4000)
  })

  it('will parse strings to bools', () => {
    assert.deepStrictEqual(config.exBool, true)
  })

  it('will work with an array of command line args', () => {
    assert.deepStrictEqual(config.commandLineArgArray, 'foobar')
  })

  it('will return the default if a field is not in a command line argument', () => {
    assert.deepStrictEqual(config.exString, 'String')
  })
})
