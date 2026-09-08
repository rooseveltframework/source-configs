## 2.0.1

- Implemented a better fix for the bug that caused the config returned by a `transform` function to be discarded, so a transform that builds a new config now works as well as one that mutates the config it was given. A transform that returns nothing continues to work as before.

## 2.0.0

- Breaking: Moved the `commandLineArgs`, `yargsParser`, `printHelp`, and `safelyPrintSchema` properties off of the source-configs module and onto the config that source-configs returns, along with the new `unknownConfigs` property. The `configs` property is gone entirely, since the config is what source-configs returns. Hanging these off the module meant that when more than one library sourced configs in the same process, whichever sourced last overwrote what the others left there.
- Breaking: Dropped support for Node 22.0 through 22.4. Node 22.5 or later is now required.
- Added detection of misspelled configs: when a custom source object supplies a config the schema doesn't define, source-configs now warns and suggests the configs it most closely resembles. Can be disabled with the new `suggestions` config. The findings are also exposed via the new `unknownConfigs` property.
- Fixed a bug that caused the config returned by a `transform` function to be discarded when the function returned a new object instead of mutating the one it was given.
- Fixed a bug that caused a crash when a custom config source set a config along the path to a deeper one to `null`.
- Fixed a bug that prevented `printHelp` from printing a config's `description`. Previously only the undocumented `desc` spelling was printed. Both now work, with `description` taking precedence.
- Fixed a bug that prevented negative numbers and decimals from being typecast, e.g. `-3` and `1.5` were left as strings.
- Fixed a bug that prevented the strings in an array from being typecast unless every entry in the array was a string.
- Fixed a typo in the warning printed when an enum is set to an invalid value.
- Updated dependencies.

## 1.0.2

- Issued an additional fix for the previous bug that prevented environment variables from being set to empty strings, which should be considered valid, truthy values. Previously there were still scenarios where they were erroneously considered invalid, falsey values.
- Updated dependencies.

## 1.0.1

- Fixed a bug that prevented environment variables from being set to empty strings, which should be considered valid, truthy values. Previously they were erroneously considered invalid, falsey values.
- Updated dependencies.

## 1.0.0

- Breaking: Changed default behavior for configs with no default value to populate the config value's name instead of `null` by default.
- Breaking: Removed deployConfig feature.
- Added new `secret` schema metadata feature to declare certain configs (e.g. passwords or API keys) sensitive.
- Added `safelyPrintSchema` method to return schema with `secret` configs redacted.
- Updated dependencies.

## 0.3.6

- Various dependencies updated.
  - Migrated colors to @colors/colors

## 0.3.5

- Added a function to make it easy for developers to add a `-h` or `--help` command to their applications that will print a summary of supported command line options.
- Dropped support for Node 12 and below.
- Various dependencies updated.

## 0.3.4

- Fixed a bug with command line args. https://github.com/rooseveltframework/source-configs/issues/198
- Various dependencies updated.

## 0.3.3

- Fixed a bug where disabling the logger didn't disable all logs.
- Various dependencies updated.

## 0.3.2

- Fixed a bug where config value doesn't source properly.
- Various dependencies updated.

## 0.3.1

- Fixed broken push to npm.
- Ensured each usage loads config in isolation.
- Various dependencies updated.

## 0.3.0

- Altered the source-configs usage in such a way that an optional configuration param can be passed which includes the following options:
  - `logging`: Ability to enable/disable logging (Roosevelt will celebrate!)
  - `transform`: A function that will get called after building the config from the schema but before returning it. Useful for handling various edge cases that the schema cannot on its own.
  - `sources`: An array of sources in priority order. Can be a combination of built-in sources and custom ones (with object supplied). Notably this also allows built-ins to be omitted entirely if desired.
- This config object is completely optional and when not passed source-configs will behave exactly the same as it did before, so this should not break any apps currently using it.
- Added full test coverage.
- Suppress logs during tests.
- Various dependencies updated.
- CI overhauled.

## 0.2.1

- Fixed bug where certain reserved words would break source-configs.
- Various dependencies updated.

## 0.2.0

- Changed `deployFile` to `deployConfigFile` and fixed associated typo in the README.
- Various dependencies updated.

## 0.1.2

- Updated roosevelt-logger, which fixes some downstream bugs.
- Various other dependencies updated.
- CI improvements.

## 0.1.1

- Fixed main filename for npm package.
- Various dependencies updated.

## 0.1.0

- Initial version.

