/**
 * Grab deployment configuration object
 * @module getDeployConfig
 */
const path = require('path')
const fs = require('fs')
const os = require('os')
const projectRoot = require('app-root-path')
const appPackage = require(path.join(projectRoot.path, 'package.json'))
const commandLineArguments = require('yargs-parser')(process.argv.slice(2), { alias: { deployConfigFile: ['df'] } })
const Logger = require('roosevelt-logger')
const params = {
  params: {
    disable: ['MOCHA_MODE'] // disable logging during Mocha tests
  }
}
const logger = new Logger(params)

// Setting name in package.json
const DEPLOY_CONFIG_SETTING_NAME = 'deployConfig'

let configPath
let config

// First
if (commandLineArguments.deployConfigFile) {
  logger.log('💭', 'Attempting to use deploy file from command line')
  configPath = commandLineArguments.deployConfigFile
} else if (process.env.DEPLOY_CONFIG) {
  logger.log('💭', 'Attempting to use deploy file from ENV variable')
  configPath = process.env.DEPLOY_CONFIG
} else { // package.json
  logger.log('💭', 'Attempting to use deploy file from package.json')
  configPath = appPackage[DEPLOY_CONFIG_SETTING_NAME]
  if (configPath !== null && configPath !== undefined) {
    configPath = configPath[0] === '~' ? path.join(os.homedir(), configPath.substr(1)) : configPath
  }
}

if (configPath === null || configPath === undefined) {
  // Package.json does not specify deployment config path
  logger.warn('❗', 'A deployment configuration file was not specified in package.json, falling back to env variables, defaults, and prompting (where appropriate)')
  config = null
} else {
  config = sourceConfig(configPath)

  if (config === 'B01') {
    logger.error('Could not read/access deployment configuration file "$FILEPATH"'.replace('$FILEPATH', configPath))
    config = null
  } else if (config === 'B02') {
    logger.error('Could not parse deployment configuration file JSON. Ensure JSON formatting is valid.')
    config = null
  } else {
    logger.log('✔️ ', `Configuration file found: ${configPath}`.green)
  }
}

// Export the config once so that it is module cached
module.exports = {
  config,
  sourceConfig
}

/**
 * Sources the config object from the deployment configuration file
 * @param {string} filepath - File path to deployment configuration file
 * @return {(Object|"B01"|"B02")} Configuration object. Source deployment configuration error code if error occurs.
 */
function sourceConfig (filepath) {
  let config

  // Always use absolute path
  if (!path.isAbsolute(filepath)) {
    filepath = path.join(projectRoot.toString(), filepath)
  }

  try {
    config = fs.readFileSync(filepath)
  } catch (e) {
    // Failed to read from file specified by filepath
    return 'B01'
  }

  try {
    config = JSON.parse(config)
  } catch (e) {
    // Failed to parse file's JSON contents
    return 'B02'
  }

  return config
}
