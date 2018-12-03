/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('environment variables', function () {
  beforeEach(function (done) {
    schema = require('./schema.json')
    sourceConfig = require('../sourceConfig')
    sourceConfig.configs = {}
    done()
  })

  it('should take a plain environment variable', function (done) {
    process.env['API_ROUTE'] = '/api'

    sourceConfig.init({ schema })
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api')
    done()
  })

  it('should map a number string to an int', function (done) {
    process.env['TIMEOUT'] = '20'

    sourceConfig.init({ schema })
    assert.strictEqual(sourceConfig.configs.timeout, 20)
    done()
  })

  it('should map a bool string to a bool', function (done) {
    process.env['EX_BOOL'] = 'true'

    sourceConfig.init({ schema })
    assert.strictEqual(sourceConfig.configs.exBool, true)
    done()
  })

  it('should default when not passed in anything', function (done) {
    sourceConfig.init({ schema })
    assert.strictEqual(sourceConfig.configs.exString, 'String')
    done()
  })
})
