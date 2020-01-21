/* eslint-env mocha */
const assert = require('assert')
const path = require('path')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const expectedConfig = require('./config.json')

describe('getDeployConfig', function () {
  it('should grab a deploy file from command line args', function (done) {
    const yargsParserStub = sinon.stub().returns({
      deployConfigFile: path.join(`${__dirname}/config.json`)
    })

    const config = proxyquire('../getDeployConfig', { 'yargs-parser': yargsParserStub })()

    assert.deepStrictEqual(config, expectedConfig)

    done()
  })

  it('should fail with invalid filename', function (done) {
    const yargsParserStub = sinon.stub().returns({
      deployConfigFile: path.join(`${__dirname}/foo.json`)
    })

    const config = proxyquire('../getDeployConfig', { 'yargs-parser': yargsParserStub })()

    assert.strictEqual(config, null)
    done()
  })

  it('should fail with invalid JSON', function (done) {
    const yargsParserStub = sinon.stub().returns({
      deployConfigFile: path.join(`${__dirname}/invalidConfig.json`)
    })

    const config = proxyquire('../getDeployConfig', { 'yargs-parser': yargsParserStub })()

    assert.strictEqual(config, null)
    done()
  })
})
