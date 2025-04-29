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

### Properties of source-configs module

In addition to its constructor, source-configs exposes the following properties:

- `configs` *[Object]*: The resulting configs after running source-config's constructor.
- `commandLineArgs` *[Array]*: All command line arguments passed to your application, including those not listened for by your schema. Powered by [yargs-parser](https://www.npmjs.com/package/yargs-parser).
- `yargsParser` *[Function]*: The instance of [yargs-parser](https://www.npmjs.com/package/yargs-parser) that source-configs used to compile all command line arguments passed to your application.
- `printHelp` *[Function]*: A function which will generate a help menu describing the command line arguments defined in the schema. Useful for if you want to define a `-h` or `--help` command line argument to print all available supported command line arguments. Just print `console.log(config.printHelp())` to print that information to your users.
- `safelyPrintSchema` *[Function]*: A function which will print the fully post-processed schema to the console, but obscure any data that is marked as `secret`.
