/* eslint-env mocha */

before(function (done) {
  const Logger = require('roosevelt-logger')
  const logger = new Logger()
  logger.winstonInstance.silent = true
  process.env.NODE_ENV = 'test'
  done()
})

beforeEach(function (done) {
  // Clear out getDeployConfig.js, deployConfig.js, and sourceConfig.js from require cache before every test
  delete require.cache[require.resolve('../getDeployConfig')]
  delete require.cache[require.resolve('../sourceConfig')]
  delete require.cache[require.resolve('../deployConfig')]

  done()
})

after(function (done) {
  delete process.env.NODE_ENV

  done()
})
