# source-configs
A Node.js module that provides structure to define app-level configuration schemas and automatically consume values via multiple sources in Node.js applications. This module was built and is maintained by the [Roosevelt web framework team](https://github.com/rooseveltframework/roosevelt), but it can be used independently of Roosevelt as well. 

## Install

Declare `source-configs` as a dependency in your app.

## Usage

### Basic schema

Create a JS file that exports an object that defines your schema as in this example:

```js
module.exports = {
  websocket: {
    host: {},
    port: {},
    protocol: {}
  }
}
```

In the above example, we are declaring that our application will use a WebSocket with a configurable host, port, and protocol.

### Config property metadata

Next we can define some metadata for each configurable property in order to create constraints if desired or add additional functionality. source-configs offers the following property attributes:

- `description` *[String]*: A place to explain what this configuration variable will be used for.
- `default` *[any]*: Default value. Will be set to null if not set otherwise defined.
- `values` *[Array]*: Enumerated list of values that are valid. If not set, any value will be valid.
- `commandLineArg` *[TODO]*
- `envVar` *[String]*: The name of an environment variable that can set this configuration variable. If not set, source-configs will not listen for an environment variable to set the value for this variable.

- `envVarParser` *[Function]*: A function to parse environment variables or a string which will be used as a delimiter for simple delimiter split strings. This can only be implemented when writing the schema in a JS file or overwritten before being initialized. [TODO: Examples.]

Also, each configurable property can be a function which takes the parent scope config as a parameter to create strings based upon other config primitives. [TODO: Example.]

### Example with config property metadata

```js
module.exports = {
  websocket: {
    host: {
      description: 'WebSocket host URL',
      default: 'localhost',
      envVar: 'WS_HOST'
    },
    port: {
      description: 'WebSocket port',
      default: 8081,
      envVar: 'WS_PORT'
    },
    protocol: {
      description: 'Which WebSocket protocol',
      description: 'ws',
      acceptedValues: ['ws', 'wss'],
      envVar: 'WS_PROTOCOL'
    }
  }
}
```

### Use in your app

Here's an example usage of source-configs using the schema defined above:

```js
const sourceConfigs = require('source-configs')
const config = sourceConfigs.init({ schema: require('./your-schema-js-file.js') })

// access one of the configs
console.log(config.websocket.port)
```

## Where configs are sourced from 

Configs matching the schema are sourced from the following locations in the following order of precedence:

- Command line argument set in the schema under `commandLineArg`.
- Environment variable set in the schema under `envVar`.
- Deployment config file declared via:
  - Command line argument: `--deploy-config` or `--dc`.
  - Environment variable: `SC_DEPLOY_CONFIG`.
  - package.json as a `deployConfig` field.
- Default defined in the schema.