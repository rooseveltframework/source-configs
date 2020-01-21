# Changelog

## Next version

- Put your changes here...

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

