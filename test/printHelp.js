const { describe, it, before } = require('node:test')
const assert = require('node:assert')

let sourceConfig
let config

describe('Command Line Arguments', () => {
  before(function () {
    sourceConfig = require('../source-configs')
    config = sourceConfig(require('./schema.json'))
  })

  it('should create menu based on provided schema', function () {
    const resultingMenu =
`Options:
  --timeout                   timeout in ms (default: 5000)
  --api-route                 base route for API (default: /api/)
  --ex-bool                   example boolean (default: false)
  --ex-string                 example string (default: String)
  -a, --arg-array             Example array of command line args (default: )
  --http-method               example enum (default: http)
  --no-default                enum with no default
  --swd, --string-no-default  string with no default
`
    assert.deepStrictEqual(config.printHelp(), resultingMenu)
  })

  it('should describe a config that uses description rather than its desc alias', () => {
    const documentedConfig = sourceConfig({
      documented: {
        commandLineArg: '--documented',
        description: 'written the way the docs describe',
        default: 1
      }
    })

    assert.deepStrictEqual(documentedConfig.printHelp(), 'Options:\n  --documented                written the way the docs describe (default: 1)\n')
  })

  it('should treat a config carrying nothing but a description as a config rather than a group of them', () => {
    const config = sourceConfig({
      describedOnly: { description: 'has no other metadata' },
      descOnly: { desc: 'has no other metadata' }
    })

    // a config with no default takes its own name as its value, which a group of configs would never do
    assert.deepStrictEqual(config, { describedOnly: 'describedOnly', descOnly: 'descOnly' })
  })
})
