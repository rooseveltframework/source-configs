/**
 * Grab deployment configuration object
 * @module getDeployConfig
 */
const path = require('path')
const fs = require('fs')
const os = require('os')
const projectRoot = require('app-root-path')
const appPackage = require(projectRoot + '/package.json')
const commandLineArguments = require('yargs-parser')(process.argv.slice(2), { alias: { deployFile: ['df'] } })

// Setting name in package.json
const DEPLOY_CONFIG_SETTING_NAME = 'deployConfig'

// Enable CLI output colors
require('./cli-colors')

let configPath
let config

// First
if (commandLineArguments.deployFile) {
  console.log('💭  Attempting to use deploy file from command line')
  configPath = commandLineArguments.deployFile
} else if (process.env.SC_DEPLOY_FILE) {
  console.log('💭  Attempting to use deploy file from ENV variable')
  configPath = process.env.SC_DEPLOY_FILE
} else { // package.json
  console.log('💭  Attempting to use deploy file from package.json')
  try {
    configPath = appPackage[DEPLOY_CONFIG_SETTING_NAME]

    if (configPath !== null && configPath !== undefined) {
      configPath = configPath[0] === '~' ? path.join(os.homedir(), configPath.substr(1)) : configPath
    }
  } catch (e) {
    if (e.message === 'A01') {
      console.error('❌  Failed to read package.json contents')
    } else if (e.message === 'A02') {
      console.error('❌  Failed to parse package.json JSON contents')
    }
  }
}

if (configPath === null || configPath === undefined) {
  // Package.json does not specify deployment config path
  console.warn('❗  A deployment configuration file was not specified in package.json, falling back to env variables, defaults, and prompting (where appropriate)'.warn)
  config = null
} else {
  config = sourceConfig(configPath)

  if (config === 'B01') {
    console.warn('❌  Could not read/access deployment configuration file "$FILEPATH"'.replace('$FILEPATH', configPath).warn)
    config = null
  } else if (config === 'B02') {
    console.warn('❌  Could not parse deployment configuration file JSON. Ensure JSON formatting is valid.'.warn)
    config = null
  } else {
    console.log(('✔️  Configuration file found: ' + configPath).success)
  }
}

// Export the config once so that it is module cached
module.exports = {
  config,
  sourceConfig
}

/**
 * Sources the config object from the database connection configuration file
 * @param {string} filepath - File path to database connection configuration file
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
