/**
 * Configuration module for color themes for CLI outputs.
 * @module cli-colors
 */

var colors = require('colors')

// Set application color themes
colors.setTheme({
  warn: 'yellow',
  error: 'red',
  success: 'green',
  info: 'blue',
  exit: 'bold'
})
