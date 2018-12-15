# source-configs
A Node.js module that provides structure to define app-level configuration schemas and automatically consume values via multiple sources in Node.js applications. This module was built and is maintained by the [Roosevelt web framework team](https://github.com/rooseveltframework/roosevelt), but it can be used independently of Roosevelt as well. 

Configs matching a given schema are sourced from the following locations in the following order of precedence:

- Command line argument set in the schema via `commandLineArg`.
- Environment variable set in the schema via `envVar`.
- Deployment config file declared via:
  - Command line argument: `--deploy-config` or `--dc`.
  - Environment variable: `DEPLOY_CONFIG`.
  - package.json as a `deployConfig` field.
- Default defined in the schema.

## Usage

First declare `source-configs` as a dependency in your app.

Then create a schema object.

A schema is an object that serves as a template for the desired final configuration consumed by your app.

Here's a simple example declaring that our application will use a WebSocket with a configurable host, port, and protocol: 

```js
{
  websocket: {
    host: {},
    port: {},
    protocol: {}
  }
}
```

### Schema metadata

Schemas support the following metadata for each configurable property in order to create constraints if desired or add additional functionality:

- `description` *[String]*: Describe what this config will be used for.
- `default` *[any]*: Set a default value for this config. If not set, the default is null.
- `values` *[Array]*: Enumerated list of values that are valid. If not set, any value will be valid.
- `commandLineArg` *[String]*: Command line argument to set this config. Will be converted to camelCase on the Node.js side. Example: the command line argument `--doThing` would be `doThing` on the Node.js side. If not set, source-configs will not listen for command line arguments to set the value for this config. [TODO: is the camelCaser really desirable?]
- `envVar` *[String]*: Environment variable to set this config. If not set, source-configs will not listen for an environment variable to set the value for this config.
- `envVarParser` *[Function]*: [TODO: simplify this] A function to parse environment variables or a string which will be used as a delimiter for simple delimiter split strings. This can only be implemented when writing the schema in a JS file or overwritten before being initialized.

[TODO: simplify this] Each configurable property can be a function which takes the parent scope config as a parameter to create strings based upon other config primitives.

Below is a more complex WebSocket config example leveraging all of the above metadata options:

```js
{
  websocket: {
    host: {
      description: 'WebSocket host URL',
      default: 'localhost',
      commandLineArg: '--ws-host',
      envVar: 'WS_HOST'
    },
    port: {
      description: 'WebSocket port',
      default: 8081,
      commandLineArg: '--ws-port',
      envVar: 'WS_PORT'
    },
    protocol: {
      description: 'Which WebSocket protocol',
      values: ['ws', 'wss'],
      commandLineArg: '--ws-protocol',
      envVar: 'WS_PROTOCOL'
    }
  }
}
```

### Use in your app

Here's an example usage of source-configs using the schema defined above:

[TODO: This example is too complicated. We should not require users to do this much boilerplate.]

```js
const sourceConfigs = require('source-configs')

// Grab command line arguments. yargs-parser is used in this example but the minimum requirement is
// a parser that converts command line arguments to a flat key-value map where the keys are camelCased
const commandLineArgs = require('yargs-parser')(process.argv.slice(2))

const config = sourceConfigs.init({ schema: require('./your-schema-js-file.js'), commandLineArguments: commandLineArgs })

// access one of the configs
console.log(config.websocket.port)
```

[TODO: this should be all that is necessary. Note the removal of init.]

```javascript
const sourceConfigs = require('source-configs')
const schema = require('./your-schema-js-file.js')
const config = sourceConfigs(schema)

// access one of the configs
console.log(config.websocket.port)
```

