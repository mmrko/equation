#!/usr/bin/env node

/**
 * Parses an equation given as a command-line argument
 * into an object and computes it. Prints the result into stdout.
 *
 * Usage:
 *   ./index.js "7+(6-5)*4.3/2^1.0 [--skip-sanitize] [--skip-validate]
 */

'use strict';

var equationStr = process.argv[2];

if (!equationStr) {
  return console.log('Usage: ./index.js "7+(6-5)*4.3/2^1.0 [--skip-sanitize] [--skip-validate]');
}

var EquationParser = require('./EquationParser');

var options = {
  skipSanitize: process.argv.indexOf('--skip-sanitize') !== -1,
  skipValidate: process.argv.indexOf('--skip-validate') !== -1
};

try {
  var equationParser = new EquationParser();
  var equation = equationParser.parseEquation(equationStr, options);
  var result = equation.compute();
  console.log('Result:', result);
} catch (e) {
  console.error(e.message);
}
