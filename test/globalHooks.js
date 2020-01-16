/* eslint-env mocha */

before(function (done) {
  const Logger = require('roosevelt-logger')
  const logger = new Logger()
  logger.winstonInstance.silent = true
  done()
})

beforeEach(function (done) {
  // Clear out getDeployConfig.js and sourceConfig.js from require cache before every test
  delete require.cache[require.resolve('../getDeployConfig')]
  delete require.cache[require.resolve('../sourceConfig')]

  done()
})
