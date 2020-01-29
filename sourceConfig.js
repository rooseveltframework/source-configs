const getFromConfig = require('./getFromConfig')
const Logger = require('roosevelt-logger')
const yargsParser = require('yargs-parser')
const getDeployConfig = require('./getDeployConfig')
let logger
let deployConfig

module.exports = sourceConfigs

function sourceConfigs (schema, config) {
  /**
   * when a custom config source doesn't supply an object...
   * source the config from the schema instead if it exists
   * otherwise ignore it
   */

  // ensure config is an object
  config = config || {}

  // set default source priority when unset
  config.sources = config.sources || [
    'command line',
    'environment variable',
    'deploy config'
  ]

  // setup the logger
  const params = {
    params: {
      disable: ['SILENT_MODE'] // disable logging during Mocha tests
    }
  }

  logger = new Logger(params)

  // disable logging if config turns it off
  if (config.logging === false) {
    logger.disableLogging()
  }

  // parse cli args
  const commandLineArgs = yargsParser(process.argv.slice(2))

  // check that deployConfig is a source before requiring it
  for (const key in config.sources) {
    const source = config.sources[key]

    if (source === 'deployConfig' || source === 'deploy config') {
      deployConfig = getDeployConfig(logger)
      break
    }
  }

  // build the configuration
  const configs = parseObject('', schema, commandLineArgs, config.sources)

  // run transformation on config if function is in use
  if (config.transform && typeof config.transform === 'function') {
    sourceConfigs.configs = config.transform(configs, commandLineArgs)
  }

  // expose features
  sourceConfigs.configs = configs
  sourceConfigs.commandLineArgs = commandLineArgs
  sourceConfigs.yargsParser = yargsParser

  return sourceConfigs.configs
}

/**
 * Recursive function to go through config schema and generate configuration
 * @function parseObject
 * @param {string} path - current path of the object being parsed delimited by a period
 * @param {Object} obj - current level of the config object
 * @param {Object} commandLineArgs - parsed commmand line arguments
 * @param {Array} sources - list of sources to check from
 * @return {Object} generated config object
 */
function parseObject (path, obj, commandLineArgs, sources) {
  const config = {}

  for (const key in obj) {
    const newPath = path === '' ? key : path + '.' + key

    // Check if a user defined function has been implemented before calling init. if not, notify the user on such.
    if (obj[key] === 'user defined function') {
      logger.error(`Error: Expected user defined function to be implemented in app level code for schema.${newPath}...`)
      logger.error('Setting field to null')
      config[key] = null
      continue
    } else if (typeof obj[key] === 'function') {
      config[key] = obj[key](config)
      continue
    }

    // Recurse if the current object is not a primitive (has 'desc', 'envVar', 'default' fields)
    if (!isPrimitive(obj[key])) {
      config[key] = parseObject(newPath, obj[key], commandLineArgs, sources)
    } else {
      // Grab the config result from Command Line Args, Environment Variables, Deploy Config file, or defaults
      let configResult = checkConfig(newPath, obj[key], commandLineArgs, sources)

      // If value is an enum, make sure it is valid
      if (obj[key].values !== undefined) {
        configResult = checkEnum(newPath, configResult, obj[key])
      }

      // Check if it's an array, and if it has strings as values, typecast them
      if (isStringArray(configResult)) {
        configResult = configResult.map(arrayEntry => typeCastEntry(arrayEntry))
      }

      // Typecast in case of strings that could be numbers or booleans ('2' -> 2, 'false' -> false)
      if ((typeof configResult) === 'string') {
        configResult = typeCastEntry(configResult)
      }

      config[key] = configResult
    }
  }

  return config
}

/**
 * Try getting config item from various locations
 * @function checkConfig
 * @param {string} path - current path of the object being parsed delimited by a period
 * @param {Object} configObject - current level of the config object
 * @param {Object} commandLineArgs - parsed command line arguments
 * @param {Array} sources - list of sources to check from
 * @return {*} - the value found for the config item
 */
function checkConfig (path, configObject, commandLineArgs, sources) {
  let value

  // start looping through sources list
  for (const key in sources) {
    const source = sources[key]

    // handle command line args
    if (source === 'command line' || source.name === 'commandLineArg') {
      if (commandLineArgs !== undefined && configObject.commandLineArg !== undefined) {
        if (isStringArray(configObject.commandLineArg)) {
          for (const arg of configObject.commandLineArg) {
            if (commandLineArgs[arg.slice(2)] !== undefined) {
              value = commandLineArgs[arg.slice(2)]
              break
            }
          }

          if (value !== undefined) {
            break
          }
        } else {
          if (commandLineArgs[configObject.commandLineArg.slice(2)] !== undefined) {
            value = commandLineArgs[configObject.commandLineArg.slice(2)]
            break
          }
        }
      }
    } else if (source === 'environment variable' || source.name === 'envVar') {
      // handle environment variables
      if (configObject.envVar !== undefined) {
        if (isStringArray(configObject.envVar)) {
          for (const envVar of configObject.envVar) {
            if (process.env[envVar]) {
              value = process.env[envVar]
              break
            }
          }

          if (value !== undefined) {
            break
          }
        } else {
          if (process.env[configObject.envVar]) {
            value = process.env[configObject.envVar]
            break
          }
        }
      }
    } else if (source === 'deployConfig' || source === 'deploy config') {
      // handle deploy config

      if (deployConfig && getFromConfig(deployConfig, path) !== undefined) {
        value = getFromConfig(deployConfig, path)
        break
      }
    } else if (typeof source === 'object') {
      // handle custom type
      if (getFromConfig(source, path) !== undefined) {
        value = getFromConfig(source, path)
        break
      }
    }
  }

  // if no value was set try to use the default
  if (value === undefined && configObject.default !== undefined) {
    value = configObject.default
  }

  // if value is still not set make it null
  if (value === undefined) {
    value = null
  }

  // return the value or null
  return value
}

/**
 * Type cast strings into the correct type (string -> number, boolean)
 * @function typeCastEntry
 * @param {string} entryString - the string that will be parsed to the correct type
 * @return {(string|number|boolean)} - the config entry with the correct type
 */
function typeCastEntry (entryString) {
  if (entryString.match(/^\d+$/)) {
    // Number
    return parseInt(entryString)
  } else if (['true', 'false'].includes(entryString.toLowerCase())) {
    // Boolean
    return entryString.toLowerCase() === 'true'
  } else {
    // String
    return entryString
  }
}

/**
 * Check if the configResult is valid with the configObject's accepted values
 * @function checkEnum
 * @param {string} path - current path of the object being parsed delimited by a period
 * @param {string} configResult - outputted config string
 * @param {Object} configObject - schema object of config primitive
 * @return {string} config result after passing it through the pass.
 */
function checkEnum (path, configResult, configObject) {
  if (!configObject.values.includes(configResult)) {
    if (configObject.default !== undefined) {
      logger.warn('Waring: Trying to set config.' + path + ' and found invalid enum value. Setting to default: ' + configObject.default)
      logger.warn('Accepted values are: ' + configObject.values.join(', '))
      configResult = configObject.default
    } else {
      logger.error('Error: Trying to set config.' + path + ' and found invalid enum value and no default found. Set to null')
      logger.error('Accepted values are: ' + configObject.values.join(', '))
      configResult = null
    }
  }

  return configResult
}

/**
 * Check if a configObject is a primitive
 * All primitives have a .default property so it will fail if that property is undefined
 * @function isPrimitive
 * @param {Object} configObject - schema object of config primitive
 * @return {boolean} - boolean result of if it is a primitive
 */
function isPrimitive (configObject) {
  return typeof configObject.description !== 'object' && // If description is not a string it is another configured config item and not a primitive, return false
    (Object.keys(configObject).length === 0 ||
    configObject.default !== undefined ||
    configObject.commandLineArg !== undefined ||
    configObject.description !== undefined ||
    configObject.values !== undefined ||
    configObject.envVar !== undefined)
}

/**
 * Check if the configResult is a string array
 * @function isStringArray
 * @param {*} configResult - outputted config string
 * @return {boolean} - boolean result of it is a string array
 */
function isStringArray (configResult) {
  return Array.isArray(configResult) && (typeof configResult[0]) === 'string'
}
