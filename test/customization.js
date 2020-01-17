/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('environment variables', function () {
  beforeEach(function (done) {
    schema = require('./schema.json')
    sourceConfig = require('../sourceConfig')
    sourceConfig.commandLineArgs = {
      'api-route': '/api/b'
    }
    sourceConfig.configs = {}
    done()
  })

  it('should prioritize custom source object', function (done) {
    sourceConfig(schema, {
      logging: false,
      sources: [
        { apiRoute: '/api/c' },
        'command line'
      ]
    })
    assert.strictEqual(sourceConfig.configs.apiRoute, '/api/c')
    done()
  })

  it('should post-process config with transform function', function (done) {
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
    done()
  })
})
