/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('Enums', function () {
  beforeEach(function (done) {
    sourceConfig = require('../sourceConfig')
    schema = require('./schema.json')
    sourceConfig.configs = {}
    done()
  })

  it('should pass with a valid enum', function (done) {
    const commandLineArguments = {
      httpMethod: 'http'
    }

    sourceConfig.init({ schema, commandLineArguments })
    assert.deepStrictEqual(sourceConfig.configs.httpMethod, 'http')
    done()
  })

  it('should use fallback with invalid enum', function (done) {
    const commandLineArguments = {
      httpMethod: 'httpz'
    }

    sourceConfig.init({ schema, commandLineArguments })
    assert.deepStrictEqual(sourceConfig.configs.httpMethod, 'http')
    done()
  })

  it('should use passed arg with invalid enum and no fallback', function (done) {
    const commandLineArguments = {
      noFall: 'sometimes'
    }

    sourceConfig.init({ schema, commandLineArguments })
    assert.deepStrictEqual(sourceConfig.configs.enumWithoutFallback, 'sometimes')
    done()
  })
})
