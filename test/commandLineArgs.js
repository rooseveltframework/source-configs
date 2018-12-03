/* eslint-env mocha */
const assert = require('assert')

let commandLineArguments

let sourceConfig
let schema

describe('Command Line Arguments', function () {
  beforeEach(function (done) {
    sourceConfig = require('../sourceConfig')
    schema = require('./schema.json')

    sourceConfig.configs = {}

    commandLineArguments = {
      apiRoute: '/api/b',
      timeout: '4000',
      exBool: 'true'
    }

    sourceConfig.init({ schema, commandLineArguments })

    done()
  })

  it('should expect an object parsed beforehand', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.apiRoute, commandLineArguments.apiRoute)
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

  it('will return the default if a field is not in a command line argument', function (done) {
    assert.deepStrictEqual(sourceConfig.configs.exString, 'String')
    done()
  })
})
