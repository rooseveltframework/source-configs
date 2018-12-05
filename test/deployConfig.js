/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('Deploy config', function () {
  beforeEach(function (done) {
    process.env['SC_DEPLOY_FILE'] = './test/config.json'
    sourceConfig = require('../sourceConfig')
    sourceConfig.configs = {}
    schema = require('./schema.json')
    sourceConfig.init({ schema })
    done()
  })

  afterEach(function (done) {
    process.env['SC_DEPLOY_FILE'] = ''
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
