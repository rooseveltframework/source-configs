# source-configs

[![Build Status](https://travis-ci.org/rooseveltframework/source-configs.svg?branch=master)](https://travis-ci.org/rooseveltframework/source-configs) [![codecov](https://codecov.io/gh/rooseveltframework/source-configs/branch/master/graph/badge.svg)](https://codecov.io/gh/rooseveltframework/source-configs) [![npm](https://img.shields.io/npm/v/source-configs.svg)](https://www.npmjs.com/package/source-configs)

A Node.js module that harvests app-level config values from command line arguments, environment variables, or config files based on a config schema you define within your app. This module was built and is maintained by the [Roosevelt web framework team](https://github.com/rooseveltframework/roosevelt), but it can be used independently of Roosevelt as well.

Configs matching a given schema are sourced from the following locations in the following order of precedence:

- Command line argument set in the schema via `commandLineArg`.
- Environment variable set in the schema via `envVar`.
- Deployment config file declared via:
  - Command line argument: `--deploy-config` or `--df`.
  - Environment variable: `DEPLOY_CONFIG`.
  - package.json as a `deployConfig` field.
- Default defined in the schema.

## Usage

First declare `source-configs` as a dependency in your app.

Then create a config schema JSON object to tell `source-configs` what config values to listen for.

Here's a simple example declaring that our application will use a WebSocket with a configurable host, port, and protocol:

```js
// your-schema-js-file.json
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
- `commandLineArg` *[String|Array<String>]*: Command line argument(s) to listen for that will set this config. If not set, source-configs will not listen for command line arguments to set the value for this config.
- `envVar` *[String|Array<String>]*: Environment variable(s) to listen for that will set this config. If not set, source-configs will not listen for an environment variable to set the value for this config.

Below is a more complex WebSocket config example leveraging all of the above metadata options:

```js
// your-schema-js-file.json
{
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
    }
  }
}
```

### Use in your app

Here's an example usage of source-configs using the schema defined above:

```javascript
const sourceConfigs = require('source-configs')
const schema = require('./your-schema-js-file.json')
const config = sourceConfigs(schema)

// access one of the configs
console.log(config.websocket.port)
```

### Properties of source-configs module

In addition to its constructor, source-configs exposes the following properties:

- `configs` *[Object]*: The resulting configs after running source-config's constructor.
- `commandLineArgs` *[Array]*: All command line arguments passed to your application, including those not listened for by your schema. Powered by [yargs-parser](https://www.npmjs.com/package/yargs-parser).
- `yargsParser` *[Function]*: The instance of [yargs-parser](https://www.npmjs.com/package/yargs-parser) that source-configs used to compile all command line arguments passed to your application.
