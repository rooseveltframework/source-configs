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
      'http-method': 'http'
    }
    sourceConfig.commandLineArgs = commandLineArguments

    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.httpMethod, 'http')
    done()
  })

  it('should use fallback with invalid enum', function (done) {
    const commandLineArguments = {
      'http-method': 'httpz'
    }

    sourceConfig.commandLineArgs = commandLineArguments

    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.httpMethod, 'http')
    done()
  })

  it('should use passed arg with invalid enum and no default', function (done) {
    const commandLineArguments = {
      'no-default': 'sometimes'
    }

    sourceConfig.commandLineArgs = commandLineArguments

    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.enumWithoutDefault, null)
    done()
  })
})
