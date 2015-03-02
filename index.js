#!/usr/bin/env node

/**
 * Parses an equation given as a command-line argument
 * into an object and computes it. Prints the result into stdout.
 *
 * Usage:
 *   ./index.js 1+2-3*4/5%6^7
 */

'use strict';

var equationStr = process.argv[2];

if (!equationStr) {
  return console.log('Usage: ./index.js 7+6-5*4.3/2^1.0');
}

var EquationParser = require('./EquationParser');

try {
  var equationParser = new EquationParser();
  var equation = equationParser.parseEquation(equationStr);
  var result = equation.compute();
  console.log('Result:', result);
} catch (e) {
  console.error(e.message);
}
