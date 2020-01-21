/* eslint-env mocha */
const assert = require('assert')
const processArv = process.argv.slice()
let sourceConfig
let schema

describe('Deploy config', () => {
  before(() => {
    process.argv = []
    process.env.DEPLOY_CONFIG = './test/config.json'
    sourceConfig = require('../sourceConfig')
    schema = require('./schema.json')
    sourceConfig(schema)
  })

  after(() => {
    delete process.env.DEPLOY_CONFIG
    process.argv = processArv
  })

  it('should get fields from the deploy config file', () => {
    assert.strictEqual(sourceConfig.configs.timeout, 400)
  })

  it('should default to the defaults if a field isn\'t in the deploy config file', () => {
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api/')
  })
})
