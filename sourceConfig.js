module.exports = {
  /**
   * Initialize the config object
   * @function init
   * @param {Object} options - options object
   * @param {Object} options.schema - schema for the config
   * @param {Object} options.commandLineArguments - Parsed command line arguments
   */
  init: function (options) {
    this.configs = parseObject('', options.schema, options.commandLineArguments)
  },
  configs: {}
}

/**
 * Recursive function to go through config schema and generate configuration
 * @function parseObject
 * @param {string} path - current path of the object being parsed delimited by a period
 * @param {Object} obj - current level of the config object
 * @param {Object} commandLineArgs - parsed commmand line arguments
 * @return {Object} generated config object
 */
function parseObject (path, obj, commandLineArgs) {
  let config = {}

  for (let key in obj) {
    let newPath = path === '' ? key : path + '.' + key

    // Check if a user defined function has been implemented before calling init. if not, notify the user on such.
    if (obj[key] === 'user defined function') {
      console.log((`❌  Error: Expected user defined function to be implemented in app level code for schema.${newPath}...`).error)
      console.log((`❌  Setting field to null`).error)
      config[key] = null
      continue
    } else if (typeof obj[key] === 'function') {
      config[key] = obj[key](config)
      continue
    }

    // Recurse if the current object is not a primitive (has 'desc', 'envVar', 'default' fields)
    if (!isPrimitive(obj[key])) {
      config[key] = parseObject(newPath, obj[key], commandLineArgs)
    } else {
      // Grab the config result from Command Line Args, Environment Variables, Deploy Config file, or defaults
      let configResult = checkConfig(newPath, obj[key], commandLineArgs)

      // If value is an enum, make sure it is valid
      if (obj[key].acceptedValues !== undefined) {
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
 * Try getting config item from 3 locations: env vars, deployment config, and defaults
 * @function checkConfig
 * @param {string} path - current path of the object being parsed delimited by a period
 * @param {Object} configObject - current level of the config object
 * @param {Object} commandLineArgs - parsed command line arguments
 * @return {*} - the value found for the config item
 */
function checkConfig (path, configObject, commandLineArgs) {
  const deployConfig = require('./deployConfig')

  if (commandLineArgs !== undefined && configObject.commandLineArg !== undefined && commandLineArgs[configObject.commandLineArg] !== undefined) {
    return commandLineArgs[configObject.commandLineArg]
  }

  // Try getting from Environment Variables first
  if (process.env[configObject.envVar]) {
    return processEnvVar(configObject, path)
  }

  // Then a deployment config file
  if (deployConfig.get(path) !== undefined) {
    return deployConfig.get(path)
  }

  // and if all else fails, return the default
  return configObject.default
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
  if (!configObject.acceptedValues.values.includes(configResult)) {
    if (configObject.acceptedValues.fallback !== undefined) {
      console.log(('⚠️  Waring: Trying to set config.' + path + ' and found invalid enum value. Setting to fallback: ' + configObject.acceptedValues.fallback).warn)
      console.log(('⚠️  Accepted values are: ' + configObject.acceptedValues.values.join(', ')).warn)
      configResult = configObject.acceptedValues.fallback
    } else {
      console.log(('❌  WARNING: Trying to set config.' + path + ' and found invalid enum value and no fallback found. Expect bugs').error)
      console.log(('❌  Accepted values are: ' + configObject.acceptedValues.values.join(', ')).error)
    }
  }

  return configResult
}

/**
 * Grab environment variable and optionally parse it
 * @function processEnvVar
 * @param {Object} configObject - schema object of config primitive
 * @param {string} path - current path of the object being parsed delimited by a period
 * @return {(string|Array<string>)} - result from environment variable
 */
function processEnvVar (configObject, path) {
  if (configObject.envVarParser !== undefined) {
    if ((typeof configObject.envVarParser) === 'string' && configObject.envVarParser !== 'user defined function') {
      return process.env[configObject.envVar].split(configObject.envVarParser)
    } else {
      if (configObject.envVarParser === 'user defined function') {
        console.log((`❌  Error: Expected user defined function to be implemented in app level code for schema.${path}.envVarParser...`).error)
        console.log(('❌  Passing unparsed env variable back.').error)
        return process.env[configObject.envVar]
      } else {
        let result = configObject.envVarParser(process.env[configObject.envVar])
        if (result !== null) return result
      }
    }
  } else {
    return process.env[configObject.envVar]
  }
}

/**
 * Check if a configObject is a primitive
 * All primitives have a .default property so it will fail if that property is undefined
 * @function isPrimitive
 * @param {Object} configObject - schema object of config primitive
 * @return {boolean} - boolean result of if it is a primitive
 */
function isPrimitive (configObject) {
  return configObject.default !== undefined
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
