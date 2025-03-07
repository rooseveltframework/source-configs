/* eslint-env mocha */
const assert = require('assert')
const processArgv = process.argv.slice()
let sourceConfig
let schema

describe('custom configuration', function () {
  before(() => {
    // add some cli arguments
    process.argv.push('--api-route')
    process.argv.push('/api/b')

    schema = require('./schema.json')
    sourceConfig = require('../source-configs')
  })

  after(() => {
    // reset cli argument set
    process.argv = processArgv
  })

  it('should prioritize custom source object', () => {
    sourceConfig(schema, {
      logging: false,
      sources: [
        { apiRoute: '/api/c' },
        'command line'
      ]
    })
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api/c')
  })

  it('should post-process config with transform function', () => {
    sourceConfig(schema, {
      logging: false,
      transform: (params, flags) => {
        if (flags['api-route'] === '/api/b') {
          params.apiRoute = '/api/d'
        }

        return params
      }
    })
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api/d')
  })
})
