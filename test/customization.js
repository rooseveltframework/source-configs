const { describe, it, before, after } = require('node:test')
const assert = require('node:assert')
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
    const config = sourceConfig(schema, {
      logging: false,
      sources: [
        { apiRoute: '/api/c' },
        'command line'
      ]
    })
    assert.strictEqual(config.apiRoute, '/api/c')
  })

  it('should keep the config a transform function mutated when it returns nothing', () => {
    const config = sourceConfig(schema, {
      logging: false,
      transform: params => {
        params.apiRoute = '/api/mutated'
        // deliberately returns nothing, which is how a transform that only mutates gets written
      }
    })
    assert.strictEqual(config.apiRoute, '/api/mutated')
  })

  it('should use the config a transform function returns, even when it is a new object', () => {
    const config = sourceConfig(schema, {
      logging: false,
      transform: () => {
        return { replaced: true }
      }
    })
    assert.deepStrictEqual(config, { replaced: true })
  })

  it('should not throw when a custom source sets a config along the path to a deeper one to null', () => {
    // reading a property off null throws, so walking a source object toward webUrlObj.host has to stop at the null rather than descend through it
    const config = sourceConfig({ webUrlObj: { host: { default: 'localhost' } } }, {
      logging: false,
      sources: [{ webUrlObj: null }]
    })
    assert.strictEqual(config.webUrlObj.host, 'localhost')
  })

  it('should post-process config with transform function', () => {
    const config = sourceConfig(schema, {
      logging: false,
      transform: (params, flags) => {
        if (flags['api-route'] === '/api/b') {
          params.apiRoute = '/api/d'
        }

        return params
      }
    })
    assert.strictEqual(config.apiRoute, '/api/d')
  })
})
