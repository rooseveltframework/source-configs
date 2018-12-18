/* eslint-env mocha */
const assert = require('assert')

let commandLineArguments = {
  'api-route': '/api/b',
  timeout: '4000',
  'ex-bool': 'true',
  a: 'foobar'
}

let sourceConfig
let schema

describe('Command Line Arguments', function () {
  beforeEach(function (done) {
    sourceConfig = require('../sourceConfig')
    sourceConfig.configs = {}
    schema = require('./schema.json')

    sourceConfig.commandLineArgs = commandLineArguments

    sourceConfig(schema)

    done()
  })

  it('should expect an object parsed beforehand', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.apiRoute, commandLineArguments['api-route'])
    done()
  })

  it('will parse strings to ints', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.timeout, 4000)
    done()
  })

  it('will parse strings to bools', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.exBool, true)
    done()
  })

  it('will work with an array of command line args', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.commandLineArgArray, 'foobar')
    done()
  })

  it('will return the default if a field is not in a command line argument', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.exString, 'String')
    done()
  })
})
