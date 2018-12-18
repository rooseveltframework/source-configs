/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('environment variables', function () {
  beforeEach(function (done) {
    schema = require('./schema.json')
    sourceConfig = require('../sourceConfig')
    sourceConfig.commandLineArgs = {}
    sourceConfig.configs = {}
    done()
  })

  it('should take a plain environment variable', function (done) {
    process.env['API_ROUTE'] = '/api'

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api')
    done()
  })

  it('should map a number string to an int', function (done) {
    process.env['TIMEOUT'] = '20'

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.timeout, 20)
    done()
  })

  it('should map a bool string to a bool', function (done) {
    process.env['EX_BOOL'] = 'true'

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.exBool, true)
    done()
  })

  it('should support arrays of environment variables', function (done) {
    process.env['FOO'] = 10

    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.envVarArray, 10)
    done()
  })

  it('should default when not passed in anything', function (done) {
    sourceConfig(schema)
    assert.strictEqual(sourceConfig.configs.exString, 'String')
    done()
  })
})
