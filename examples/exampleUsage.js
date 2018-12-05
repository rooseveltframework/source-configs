// Load in sourceConfig and an example schema
const sourceConfig = require('source-configs')
const schema = require('./exampleschema.json')

// go get command line arguments. using yargs-parser in this example
const commandLineArguments = require('yargs-parser')(process.argv.slice(2))

// Setup user defined functions
schema.time.format = function (config) {
  return config.hour + ':' + config.minute
}

// initialize sourceConfig and generate the actual config object
sourceConfig.init({
  schema,
  commandLineArguments
})

// access an element of the array
console.log('Time: ' + sourceConfig.configs.time.format)
