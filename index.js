#!/usr/bin/env node

/**
 * Parses an equation given as a command-line argument
 * into an object and computes it. Prints the result into stdout.
 *
 * Usage:
 *   ./index.js 1+2-3*4/5%6^7
 */

'use strict';

var EquationParser = require('./EquationParser');

var equationParser = new EquationParser();
var equationStr = process.argv[2];

if (!equationStr) {
  return console.log('Usage: ./index.js 1+2-3*4/5%6^7');
}

try {
  var equation = equationParser.parseEquation(equationStr);
  var result = equation.compute();
  console.log('Result:', result);
} catch (e) {
  console.error(e.message);
}
