## API

- `logging` *[Boolean]*: Whether or not source-configs will log to console. Default: `true`.

- `sources` *[Array of Strings]*: An array of sources that can be a mix of built-in sources and custom source objects in order of priority.
  - Built-in sources can be referenced in multiple ways:
    - Command line: `"command line"` or `"commandLineArg"`.
    - Environment variable: `"environment variable"` or `"envVar"`.

Default:

```javascript
[
  'command line',
  'environment variable'
]
```

Supply an object to add custom sources:

```javascript
[
  'command line',
  'environment variable',
  { custom: 'object' }
]
```

- `suggestions` *[Boolean]*: Whether or not source-configs will warn about configs supplied by a custom source object that your schema doesn't define, suggesting the configs a misspelling most likely meant. Default: `true`.

  - For example, given a schema that defines `timeout`, supplying `timout` in a custom source object will log:

  ```
  Warning: Trying to set config.timout, but the schema does not define that config. Did you mean: timeout?
  ```

  - Only custom source objects are checked. Command line arguments and environment variables are not, because they routinely contain values that have nothing to do with your schema, so an unrecognized one there isn't evidence of a misspelling.

- `transform(config, commandLineArgs)` *[Function]*: A function that can be used to mutate your config after it has been parsed and sourced but before it gets returned by source-configs.
  - `config` *[Object]*: The config after being parsed by source-configs.
  - `commandLineArgs` *[Object]*: CLI flags as parsed by [yargs-parser](https://www.npmjs.com/package/yargs-parser).

Example:
```javascript
const sourceConfigs = require('source-configs')
const schema = require('./your-schema-js-file.json')

const config = sourceConfigs(schema, {
  transform: (config, commandLineArgs) => {
    // check for a cli flag that wouldn't normally translate into a config
    if (commandLineArgs.switchPort === true) {
      config.websocket.port = 43711
    }
    return config // return the config when done
  }
})

// access that config configs
console.log(config.websocket.port) // prints 43711
```

### Properties of the config

In addition to the configs your schema declares, the config source-configs returns carries the following properties:

- `commandLineArgs` *[Array]*: All command line arguments passed to your application, including those not listened for by your schema. Powered by [yargs-parser](https://www.npmjs.com/package/yargs-parser).
- `yargsParser` *[Function]*: The instance of [yargs-parser](https://www.npmjs.com/package/yargs-parser) that source-configs used to compile all command line arguments passed to your application.
- `printHelp` *[Function]*: A function which will generate a help menu describing the command line arguments defined in the schema. Useful for if you want to define a `-h` or `--help` command line argument to print all available supported command line arguments. Just print `console.log(config.printHelp())` to print that information to your users.
- `safelyPrintSchema` *[Function]*: A function which will print the fully post-processed schema to the console, but obscure any data that is marked as `secret`.
- `unknownConfigs` *[Array]*: The configs supplied by a custom source object that the schema doesn't define, each one an object with a `path` *[String]* and a `suggestions` *[Array of Strings]* listing the configs it most closely resembles, closest first. Empty when `suggestions` is set to `false`. These are non-enumerable, so they stay out of your config's own keys when it is iterated or serialized. If your schema declares a config by one of those names, the config you asked for wins and that property is not set.
