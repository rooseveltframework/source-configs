First declare `source-configs` as a dependency in your app.

Then create a config schema JSON object to tell `source-configs` what config values to listen for.

Here's a simple example declaring that our application will use a WebSocket with a configurable host, port, and protocol:

```javascript
const sourceConfigs = require('source-configs')
const schema = require({
  websocket: {
    host: {
      description: 'WebSocket host URL',
      default: 'localhost',
      commandLineArg: ['--websocket-host-url', '--ws-host', '-h'],
      envVar: ['WEBSOCKET_HOST_URL', 'WS_HOST']
    },
    port: {
      description: 'WebSocket port',
      default: 8081,
      commandLineArg: ['--ws-port', '-p'],
      envVar: 'WS_PORT'
    },
    protocol: {
      description: 'Which WebSocket protocol',
      values: ['ws', 'wss'],
      commandLineArg: '--ws-protocol',
      envVar: 'WS_PROTOCOL'
    },
    url: 'user-defined function'
  }
)

// define the user-defined function above
schema.websocket.url = (config) => config.protocol + '://' + config.host + ':' + config.port

// run source-configs against the schema
const config = sourceConfigs(schema)

// access one of the configs
console.log(config.websocket.port)
```

### Schema metadata

Schemas support the following metadata for each configurable property in order to create constraints if desired or add additional functionality:

- `description` *[String]*: Describe what this config will be used for.
- `default` *[any]*: Set a default value for this config. If not set, the default will be set to the config's name.
- `values` *[Array]*: Enumerated list of values that are valid. If not set, any value will be valid.
- `commandLineArg` *[String or Array of Strings]*: Command line argument(s) to listen for that will set this config. If not set, source-configs will not listen for command line arguments to set the value for this config.
- `envVar` *[String or Array of Strings]*: Environment variable(s) to listen for that will set this config. If not set, source-configs will not listen for an environment variable to set the value for this config.
- `secret` *[Boolean]*: Whether or not this value is sensitive information, like a password.

### User-defined functions

Additionally, a schema can be a function which has the parent config passed to it as the first argument. To do this create a key/value pair within the schema object:

- If the schema is stored in a `.js` file, set the key as the desired function name and the value as the function.
- If using a `.json` file to store the schema, set the key as the desired function name and the value as `'user-defined function'`. Once the `.json` file is required in, override the key's value with the desired function.

### Custom configuration

In addition to the above instantiation method, source-configs also accepts an optional configuration object that can be passed to the constructor as a second object like so:

```javascript
const sourceConfigs = require('source-configs')
const schema = require('./your-schema-js-file.json')

const config = sourceConfigs(schema, {
  logging: true,
  sources: [
    'command line',
    'environment variable',
    { custom: 'object' }
  ]
})
```
