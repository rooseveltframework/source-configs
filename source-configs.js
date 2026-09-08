const Logger = require('roosevelt-logger')
const yargsParser = require('yargs-parser')
let logger

function sourceConfigs (schema, config) {
  // ensure config is an object
  config = config || {}

  // set default source priority when unset
  config.sources = config.sources || [
    'command line',
    'environment variable'
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

  // build the configuration
  let configs = parseObject('', schema, commandLineArgs, config.sources)

  // warn about configs supplied by a custom source object that the schema doesn't define, e.g. misspellings
  const unknownConfigs = config.suggestions === false ? [] : findUnknownConfigs(schema, config.sources)
  for (const unknown of unknownConfigs) {
    if (unknown.suggestions.length) logger.warn('Warning: Trying to set config.' + unknown.path + ', but the schema does not define that config. Did you mean: ' + unknown.suggestions.join(', ') + '?')
    else logger.warn('Warning: Trying to set config.' + unknown.path + ', but the schema does not define that config.')
  }

  // run transformation on config if function is in use
  if (config.transform && typeof config.transform === 'function') {
    const transformed = config.transform(configs, commandLineArgs)
    if (transformed !== undefined) {
      configs = transformed
    }
  }

  const printHelp = function () {
    let menu = 'Options:\n'
    for (const configName in schema) {
      const item = schema[configName]
      if (item.commandLineArg !== undefined) {
        let line = '  '
        if (isNameList(item.commandLineArg)) {
          const args = item.commandLineArg.slice()
          args.sort((a, b) => {
            return a.length - b.length
          })
          line += args[0]
          for (const arg of args.slice(1)) {
            line += ', ' + arg
          }
        } else {
          line += item.commandLineArg
        }
        if (line.length < 30) {
          line += ' '.repeat(30 - line.length)
        }
        // description is the documented name for this, but desc has always worked here, so both are accepted
        const description = typeof item.description === 'string' ? item.description : item.desc
        if (description !== undefined) {
          line += description
        }
        if (item.default !== undefined) {
          line += ` (default: ${item.default})`
        }
        menu += line + '\n'
      }
    }
    return menu
  }

  const safelyPrintSchema = function () {
    const postProcessedConfig = {}
    for (const key in configs) {
      const val = configs[key]
      if (schema[key]?.secret) postProcessedConfig[key] = '********'
      else postProcessedConfig[key] = val
    }
    return postProcessedConfig
  }

  // expose the features on the config this call produced, so that two libraries sourcing configs in the same process each keep their own
  // they are non-enumerable so that they stay out of the config's own keys when it is iterated or serialized
  const features = { commandLineArgs, yargsParser, printHelp, safelyPrintSchema, unknownConfigs }
  if (typeof configs === 'object' && configs !== null) {
    for (const name in features) {
      // a schema is free to name a config after one of these, and the config it asked for wins
      if (!Object.hasOwn(configs, name)) {
        Object.defineProperty(configs, name, { value: features[name], writable: true, configurable: true })
      }
    }
  }

  return configs
}

/**
 * method to grab items a from configuration object
 * @module getFromConfig
 */
function getFromConfig (data, path) {
  let pointer = data
  const sections = path.split('.')
  let i = 0
  while (i < sections.length) {
    // a value that isn't an object has nothing deeper to walk into, so this source doesn't supply the config
    // null is the case worth spelling out: reading a property off it throws rather than coming back undefined
    if (pointer === null || typeof pointer !== 'object') return undefined
    pointer = pointer[sections[i]]
    if (pointer === undefined) break
    i++
  }
  return pointer
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

    // Check if a user-defined function has been implemented before calling init. if not, notify the user on such.
    if (obj[key] === 'user defined function' || obj[key] === 'user-defined function') {
      logger.error(`Error: Expected user-defined function to be implemented in app level code for schema.${newPath}...`)
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
      // Grab the config result from Command Line Args, Environment Variables, or defaults
      let configResult = checkConfig(newPath, obj[key], commandLineArgs, sources)

      // If value is an enum, make sure it is valid
      if (obj[key].values !== undefined) {
        configResult = checkEnum(newPath, configResult, obj[key])
      }

      // Typecast the strings in an array, e.g. ['2', 'false'] -> [2, false], leaving entries that are not strings as they are
      if (Array.isArray(configResult)) {
        configResult = configResult.map(arrayEntry => typeof arrayEntry === 'string' ? typeCastEntry(arrayEntry) : arrayEntry)
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
  for (const source of sources) {
    // handle command line args
    if (source === 'command line' || source.name === 'commandLineArg') {
      if (commandLineArgs !== undefined && configObject.commandLineArg !== undefined) {
        if (isNameList(configObject.commandLineArg)) {
          const parsedArgs = yargsParser(configObject.commandLineArg)

          for (const arg in parsedArgs) {
            if (arg !== '_') {
              if (commandLineArgs[arg] !== undefined) {
                value = commandLineArgs[arg]
                break
              }
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
        if (isNameList(configObject.envVar)) {
          for (const envVar of configObject.envVar) {
            if (Object.hasOwn(process.env, envVar)) {
              value = process.env[envVar]
              break
            }
          }

          if (value !== undefined) {
            break
          }
        } else {
          if (Object.hasOwn(process.env, configObject.envVar)) {
            value = process.env[configObject.envVar]
            break
          }
        }
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

  // if value is still not set make it the config's name
  if (value === undefined) {
    value = path
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
  if (entryString.match(/^-?\d+(\.\d+)?$/)) {
    // Number, including negatives and decimals
    return Number(entryString)
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
      logger.warn('Warning: Trying to set config.' + path + ' and found invalid enum value. Setting to default: ' + configObject.default)
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
 * Find configs supplied by custom source objects that the schema does not define
 * Built-in sources are skipped: command line args and environment variables include values that have nothing to do with the schema, so an unrecognized one there is not evidence of a typo
 * @function findUnknownConfigs
 * @param {Object} schema - the config schema
 * @param {Array} sources - list of sources to check from
 * @return {Array} - list of {path, suggestions} objects, one per unrecognized config
 */
function findUnknownConfigs (schema, sources) {
  const unknownConfigs = []
  const seen = new Set()

  for (const source of sources) {
    // skip the built-in sources, including the object form that merely names one
    if (typeof source !== 'object' || source === null || Array.isArray(source)) continue
    if (source.name === 'commandLineArg' || source.name === 'envVar') continue

    walkSource('', schema, source, unknownConfigs, seen)
  }

  return unknownConfigs
}

/**
 * Recursive function to walk a custom source object alongside the schema looking for configs the schema does not define
 * @function walkSource
 * @param {string} path - current path of the object being walked delimited by a period
 * @param {Object} schemaObject - current level of the schema
 * @param {Object} sourceObject - current level of the source object
 * @param {Array} unknownConfigs - list the unrecognized configs are collected into
 * @param {Set} seen - paths already collected, so a config supplied by several sources is only reported once
 */
function walkSource (path, schemaObject, sourceObject, unknownConfigs, seen) {
  for (const key in sourceObject) {
    // an undefined value sets nothing, so it is not worth mentioning
    if (sourceObject[key] === undefined) continue

    const newPath = path === '' ? key : path + '.' + key

    if (!Object.hasOwn(schemaObject, key)) {
      if (seen.has(newPath)) continue
      seen.add(newPath)
      unknownConfigs.push({ path: newPath, suggestions: suggestConfigs(key, Object.keys(schemaObject)) })
      continue
    }

    const schemaEntry = schemaObject[key]

    // user-defined functions and primitives have no keys of their own to compare against
    // that includes primitives whose default is an object: those are pass-through values the schema does not enumerate, so anything inside one is valid
    if (typeof schemaEntry !== 'object' || schemaEntry === null || isPrimitive(schemaEntry)) continue

    if (typeof sourceObject[key] === 'object' && sourceObject[key] !== null && !Array.isArray(sourceObject[key])) {
      walkSource(newPath, schemaEntry, sourceObject[key], unknownConfigs, seen)
    }
  }
}

/**
 * Find the configs a misspelling most likely meant
 * @function suggestConfigs
 * @param {string} name - the unrecognized config name
 * @param {Array} candidates - the config names the schema defines at that level
 * @return {Array} - up to 3 candidates, closest first
 */
function suggestConfigs (name, candidates) {
  return candidates
    .map(candidate => {
      return { candidate, distance: levenshteinDistance(name.toLowerCase(), candidate.toLowerCase()) }
    })
    // the longer the words, the more typos they can absorb before the resemblance is a coincidence
    .filter(({ candidate, distance }) => distance <= Math.max(1, Math.floor(Math.max(name.length, candidate.length) / 3)))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({ candidate }) => candidate)
}

/**
 * Calculate the Levenshtein distance between two strings: how many single character insertions, deletions, or substitutions it takes to turn one into the other
 * @function levenshteinDistance
 * @param {string} a - first string
 * @param {string} b - second string
 * @return {number} - the edit distance between the two strings
 */
function levenshteinDistance (a, b) {
  if (a === b) return 0

  // only the previous row of the distance matrix is needed to calculate the next one, so just those two rows are kept
  let previousRow = []
  let currentRow = []
  for (let i = 0; i <= b.length; i++) previousRow[i] = i

  for (let i = 1; i <= a.length; i++) {
    currentRow[0] = i
    for (let j = 1; j <= b.length; j++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1
      currentRow[j] = Math.min(
        previousRow[j] + 1, // deletion
        currentRow[j - 1] + 1, // insertion
        previousRow[j - 1] + substitutionCost // substitution
      )
    }
    const swap = previousRow
    previousRow = currentRow
    currentRow = swap
  }

  return previousRow[b.length]
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
    typeof configObject.desc !== 'object' && // same goes for desc, the alias of description
    (Object.keys(configObject).length === 0 ||
    configObject.default !== undefined ||
    configObject.commandLineArg !== undefined ||
    configObject.description !== undefined ||
    configObject.desc !== undefined ||
    configObject.values !== undefined ||
    configObject.envVar !== undefined)
}

/**
 * Check if a schema's commandLineArg or envVar lists several names rather than naming one
 * Only the first entry is examined, which is enough for a list the schema's author wrote by hand
 * @function isNameList
 * @param {*} schemaValue - the commandLineArg or envVar a schema supplied
 * @return {boolean} - boolean result of if it is a list of names
 */
function isNameList (schemaValue) {
  return Array.isArray(schemaValue) && (typeof schemaValue[0]) === 'string'
}

module.exports = sourceConfigs
