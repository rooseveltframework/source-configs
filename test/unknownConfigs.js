const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')
const Module = require('node:module')

const loggerPath = require.resolve('roosevelt-logger')
const sourceConfigsPath = require.resolve('../source-configs')

/**
 * Load a fresh copy of source-configs with a stand-in for roosevelt-logger, so the warnings this feature emits can be inspected
 * @return {Object} - the module and the logs it wrote
 */
function requireWithLoggerStub () {
  const logs = { warn: [], error: [] }

  class LoggerStub {
    warn (...args) {
      logs.warn.push(args.join(' '))
    }

    error (...args) {
      logs.error.push(args.join(' '))
    }

    disableLogging () {}
  }

  const stub = new Module(loggerPath)
  stub.filename = loggerPath
  stub.loaded = true
  stub.exports = LoggerStub

  // source-configs grabs the logger when it is required, so the stub only needs to stand in for that moment
  const realLogger = require.cache[loggerPath]
  require.cache[loggerPath] = stub
  delete require.cache[sourceConfigsPath]
  const sourceConfig = require('../source-configs')
  if (realLogger) require.cache[loggerPath] = realLogger
  else delete require.cache[loggerPath]

  return { sourceConfig, logs }
}

describe('unknown configs', () => {
  let sourceConfig
  let config
  let logs
  let schema

  beforeEach(() => {
    ({ sourceConfig, logs } = requireWithLoggerStub())
    schema = require('./schema.json')
  })

  it('should suggest the correct config when a top level config is misspelled', () => {
    config = sourceConfig(schema, {
      sources: [{ timout: 1000 }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'timout', suggestions: ['timeout'] }])
    assert.strictEqual(logs.warn.length, 1)
    assert(logs.warn[0].includes('config.timout'))
    assert(logs.warn[0].includes('Did you mean: timeout?'))
  })

  it('should suggest the correct config when a nested config is misspelled', () => {
    config = sourceConfig(schema, {
      sources: [{ webUrlObj: { hostt: 'example.com' } }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'webUrlObj.hostt', suggestions: ['host'] }])
    assert(logs.warn[0].includes('config.webUrlObj.hostt'))
  })

  it('should suggest the correct config when only the capitalization is wrong', () => {
    config = sourceConfig(schema, {
      sources: [{ sensitiveinfo: 'hunter2' }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'sensitiveinfo', suggestions: ['sensitiveInfo'] }])
  })

  it('should warn without a suggestion when nothing in the schema resembles the config', () => {
    config = sourceConfig(schema, {
      sources: [{ totallyUnrelatedKey: true }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'totallyUnrelatedKey', suggestions: [] }])
    assert.strictEqual(logs.warn.length, 1)
    assert(logs.warn[0].includes('config.totallyUnrelatedKey'))
    assert(!logs.warn[0].includes('Did you mean'))
  })

  it('should list multiple suggestions closest first', () => {
    config = sourceConfig({
      timeout: { default: 5000 },
      timeouts: { default: [] }
    }, {
      sources: [{ timeoutss: 1000 }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'timeoutss', suggestions: ['timeouts', 'timeout'] }])
  })

  it('should list no more than 3 suggestions', () => {
    config = sourceConfig({
      optionA: { default: 1 },
      optionB: { default: 2 },
      optionC: { default: 3 },
      optionD: { default: 4 }
    }, {
      sources: [{ optionZ: 5 }]
    })

    assert.strictEqual(config.unknownConfigs[0].suggestions.length, 3)
  })

  it('should not suggest a config that merely shares a few letters with the one supplied', () => {
    config = sourceConfig(schema, {
      sources: [{ ex: true }]
    })

    // exBool and exString both start with it, but neither is a plausible misspelling of a two letter name
    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'ex', suggestions: [] }])
  })

  it('should not warn when every config supplied is defined in the schema', () => {
    config = sourceConfig(schema, {
      sources: [{ timeout: 1000, webUrlObj: { host: 'example.com', port: 9000 } }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [])
    assert.strictEqual(logs.warn.length, 0)
  })

  it('should not scan command line args or environment variables for misspellings', () => {
    process.env.SOME_UNRELATED_ENV_VAR = 'true'
    process.argv.push('--some-unrelated-flag')

    config = sourceConfig(schema, {
      sources: ['command line', 'environment variable', { name: 'commandLineArg' }, { name: 'envVar' }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [])
    assert.strictEqual(logs.warn.length, 0)

    delete process.env.SOME_UNRELATED_ENV_VAR
    process.argv.pop()
  })

  it('should not report a config supplied by more than one source twice', () => {
    config = sourceConfig(schema, {
      sources: [{ timout: 1000 }, { timout: 2000 }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [{ path: 'timout', suggestions: ['timeout'] }])
    assert.strictEqual(logs.warn.length, 1)
  })

  it('should not report configs set to undefined, which set nothing', () => {
    config = sourceConfig(schema, {
      sources: [{ timout: undefined }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [])
  })

  it('should not inspect the contents of a config whose schema entry is a primitive', () => {
    // apiRoute is a primitive, so an object supplied to it is a value, not a level of the schema to check keys against
    config = sourceConfig(schema, {
      sources: [{ apiRoute: { anythingGoesInHere: true } }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [])
  })

  it('should not check for misspellings when suggestions are turned off', () => {
    config = sourceConfig(schema, {
      suggestions: false,
      sources: [{ timout: 1000 }]
    })

    assert.deepStrictEqual(config.unknownConfigs, [])
    assert.strictEqual(logs.warn.length, 0)
  })

  it('should still source the configs it does recognize alongside a misspelled one', () => {
    config = sourceConfig(schema, {
      sources: [{ timout: 1000, apiRoute: '/api/c' }]
    })

    assert.strictEqual(config.apiRoute, '/api/c')
    assert.strictEqual(config.timeout, 5000) // the misspelled config falls back to its default
  })
})
