/* eslint-env mocha */
const assert = require('assert')

let sourceConfig
let schema

describe('Command Line Arguments', () => {
  before(function () {
    sourceConfig = require('../sourceConfig')
    sourceConfig.configs = {}
    schema = require('./schema.json')

    sourceConfig(schema)
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
`
    assert.deepStrictEqual(sourceConfig.printHelp(), resultingMenu)
  })
})
