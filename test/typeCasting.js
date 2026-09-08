const { describe, it, beforeEach } = require('node:test')
const assert = require('node:assert')

let schema
let sourceConfig

describe('Type casting', function () {
  beforeEach(function () {
    sourceConfig = require('../source-configs')
    schema = {
      allStrings: {
        default: ['var1', 'var2', 'var3']
      },
      shouldTypecast: {
        default: ['1', 'true', 'var3']
      }
    }
  })

  it('should not typecast entry from all strings', function () {
    assert.deepStrictEqual(sourceConfig(schema).allStrings, ['var1', 'var2', 'var3'])
  })

  it('should typecast entry to corresponding types', function () {
    assert.deepStrictEqual(sourceConfig(schema).shouldTypecast, [1, true, 'var3'])
  })

  it('should typecast the strings in an array that also holds other types', function () {
    const config = sourceConfig({ mixed: { default: [] } }, {
      sources: [{ mixed: [1, '2', 'true', 'three', null] }]
    })

    assert.deepStrictEqual(config.mixed, [1, 2, true, 'three', null])
  })

  it('should typecast negative numbers and decimals', function () {
    const config = sourceConfig({
      negative: { default: 0 },
      decimal: { default: 0 },
      negativeDecimal: { default: 0 }
    }, {
      sources: [{ negative: '-3', decimal: '1.5', negativeDecimal: '-1.5' }]
    })

    assert.deepStrictEqual(config, { negative: -3, decimal: 1.5, negativeDecimal: -1.5 })
  })

  it('should leave a string that merely contains a number alone', function () {
    const config = sourceConfig({
      version: { default: '' },
      signed: { default: '' },
      spaced: { default: '' }
    }, {
      sources: [{ version: '1.2.3', signed: '+5', spaced: '5 ' }]
    })

    assert.deepStrictEqual(config, { version: '1.2.3', signed: '+5', spaced: '5 ' })
  })

  it('should leave an empty string as an empty string rather than casting it to a number', function () {
    const config = sourceConfig({ blank: { default: 'unset' } }, {
      sources: [{ blank: '' }]
    })

    assert.strictEqual(config.blank, '')
  })
})
