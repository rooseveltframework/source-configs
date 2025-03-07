/* eslint-env mocha */

before(function (done) {
  const Logger = require('roosevelt-logger')
  const logger = new Logger()
  logger.winstonInstance.silent = true
  done()
})

beforeEach(function (done) {
  delete require.cache[require.resolve('../source-configs')]

  done()
})
