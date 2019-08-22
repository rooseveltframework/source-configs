/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('Deploy config', function () {
  beforeEach(function (done) {
    process.env.DEPLOY_CONFIG = './test/config.json'
    sourceConfig = require('../sourceConfig')
    schema = require('./schema.json')
    sourceConfig.configs = {}
    sourceConfig.commandLineArgs = {}
    sourceConfig(schema)
    done()
  })

  afterEach(function (done) {
    process.env.DEPLOY_CONFIG = ''
    done()
  })

  it('should get fields from the deploy config file', function (done) {
    assert.strictEqual(sourceConfig.configs.timeout, 400)
    done()
  })

  it('should default to the defaults if a field isn\'t in the deploy config file', function (done) {
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api/')
    done()
  })
})
