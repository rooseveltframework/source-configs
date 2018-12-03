# source-configs
Provides structure to define app-level configuration schemas and automatically consume values via multiple sources in Node.js applications.

## Priority basis

SourceConfigs will examine the 4 following locations and will fallback to the one below it if it doesn't find the config value

* Command line arguments set in the schema under commandLineArg
* Environment variable set in the schema as envVar
* Deployment config file declared in the package.json as a `deployConfig` field, as a command line argument of `--deploy-file` or `--df`, or an environment variable of `SC_DEPLOY_FILE`.
* Default defined in the schema

## Schema layout:

To setup config for a schema, you can set up a declarative JS object as follows in a JS file:

```js
module.exports = {
  websocket: {
    host: {
      envVar: 'WS_HOST',
      desc: 'Web Socket host url',
      default: 'localhost'
    },
    port: {
      envVar: 'WS_PORT',
      desc: 'Web Socket port',
      default: 8081
    },
    protocol: {
      envVar: 'WS_PROTOCOL',
      default: 'ws',
      acceptedValues: {
        values: ['ws', 'wss'],
        fallback: 'ws'
      },
      desc: 'protocol for web sockets'
    }
  }
}
```

A base object (primitive) in the object should have the three properties:

* envVar: environment variable name
* default: default value
* desc: description

As well, you can have the following optional properties:

* acceptedValues: a object to be used to define enumerations with a values field containing an array of accepted values and a fallback field which will be used if the config option is invalid
* envVarParser: a function to parse environment variables or a string which will be used as a delimiter for simple delimiter split strings

Also, a primitive can be a function which takes the parent scope config as a parameter to create strings based upon other config primitives.

## Usage

Here's an example usage of the module using the schema defined above

```js
const schema = require('./configSchema.js')
const sourceConfigs = require('sourceConfigs')

// Initialize the config
sourceConfigs.init({ schema: schema })

const config = sourceConfigs.configs

console.log(config.websocket.port) // Prints out 8081 if no env variables or deploy config file.
```