/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('User Defined Functions', function () {
  beforeEach(function (done) {
    sourceConfig = require('../sourceConfig')
    sourceConfig.configs = {}
    schema = require('./schema.json')
    done()
  })

  it('should be null when not defined', function (done) {
    sourceConfig.init({ schema })
    assert.strictEqual(sourceConfig.configs.webUrlObj.getWebUrl, null)
    done()
  })

  it('should implement a user defined function', function (done) {
    schema.webUrlObj.getWebUrl = function (config) {
      return config.httpMethod + '://' + config.host + (config.port ? (':' + config.port) : '')
    }

    sourceConfig.init({ schema })
    assert.strictEqual(sourceConfig.configs.webUrlObj.getWebUrl, 'http://localhost:8081')
    done()
  })
})
