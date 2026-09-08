const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')

const features = ['commandLineArgs', 'yargsParser', 'printHelp', 'safelyPrintSchema', 'unknownConfigs']

let sourceConfig

describe('exposed features', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../source-configs')]
    sourceConfig = require('../source-configs')
  })

  it('should expose every feature on the config it returns', () => {
    const config = sourceConfig({ alpha: { default: 'a' } })

    for (const feature of features) {
      assert.notStrictEqual(config[feature], undefined, `${feature} is missing from the returned config`)
    }
  })

  it('should keep the features out of the config\'s own keys', () => {
    const config = sourceConfig({ alpha: { default: 'a' } })

    assert.deepStrictEqual(Object.keys(config), ['alpha'])
    assert.strictEqual(JSON.stringify(config), '{"alpha":"a"}')
  })

  it('should leave an earlier config untouched when a second one is sourced', () => {
    // two libraries sourcing configs in the same process each need to keep the config they asked for
    const first = sourceConfig({ alpha: { default: 'a' } })
    const second = sourceConfig({ beta: { default: 'b' } })

    assert.deepStrictEqual(Object.keys(first), ['alpha'])
    assert.strictEqual(first.printHelp(), 'Options:\n')
    assert.deepStrictEqual(Object.keys(second), ['beta'])
  })

  it('should let a schema claim a name a feature would otherwise use', () => {
    const config = sourceConfig({ printHelp: { default: 'mine' } })

    assert.strictEqual(config.printHelp, 'mine')
  })

  it('should not leave the features on the module itself', () => {
    // they used to live here, where a second call would overwrite what the first one left behind
    sourceConfig({ alpha: { default: 'a' } })

    assert.strictEqual(sourceConfig.configs, undefined)
    for (const feature of features) {
      assert.strictEqual(sourceConfig[feature], undefined, `${feature} is still on the module`)
    }
  })

  it('should expose the features on a config a transform function replaced', () => {
    const config = sourceConfig({ alpha: { default: 'a' } }, {
      transform: () => {
        return { replaced: true }
      }
    })

    assert.deepStrictEqual(Object.keys(config), ['replaced'])
    assert.strictEqual(typeof config.printHelp, 'function')
  })

  it('should not throw when a transform function returns something that cannot carry the features', () => {
    const config = sourceConfig({ alpha: { default: 'a' } }, {
      transform: () => null
    })

    assert.strictEqual(config, null)
  })
})
