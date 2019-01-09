/* eslint-env mocha */

before(function (done) {
  require('roosevelt-logger').winstonInstance.silent = true
  done()
})

beforeEach(function (done) {
  // Clear out getDeployConfig.js, deployConfig.js, and sourceConfig.js from require cache before every test
  delete require.cache[require.resolve('../getDeployConfig')]
  delete require.cache[require.resolve('../sourceConfig')]
  delete require.cache[require.resolve('../deployConfig')]

  done()
})
