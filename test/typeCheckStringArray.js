/* eslint-env mocha */
const assert = require('assert')

let schema
let sourceConfig

describe('Array of Strings Type Check', function () {
  beforeEach(function (done) {
    sourceConfig = require('../sourceConfig')
    sourceConfig.configs = {}
    schema = {
      allStrings: {
        default: ['var1', 'var2', 'var3']
      },
      shouldTypecast: {
        default: ['1', 'true', 'var3']
      }
    }
    done()
  })

  it('should not typecast entry from all strings', function (done) {
    sourceConfig(schema)

    assert.deepStrictEqual(sourceConfig.configs.allStrings, ['var1', 'var2', 'var3'])
    done()
  })

  it('should typecast entry to corresponding types', function (done) {
    sourceConfig(schema)
    assert.deepStrictEqual(sourceConfig.configs.shouldTypecast, [1, true, 'var3'])
    done()
  })
})
