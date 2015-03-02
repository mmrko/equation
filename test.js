#!/usr/bin/env node

'use strict';

var assert = require('assert');

var EquationParser = require('./EquationParser');
var equationParser = new EquationParser();

var parseEquationWithInvalidCharacters = equationParser.parseEquation.bind(equationParser, '1+a+2+b+3');
var parseEquationWithInvalidDot = equationParser.parseEquation.bind(equationParser, '1+.-2');
var eq1 = equationParser.parseEquation('2*6+5-2%2-5^3-1+1/5-1');
var eq2 = equationParser.parseEquation('.5+2./.1');
var eq3 = equationParser.parseEquation(' 1    + 2+ 4   /2   ');
var eq4 = equationParser.parseEquation('1+++2**4//2-4..0--....5^^4');
var eq5 = equationParser.parseEquation('2^2^3');

try {
  assert.throws(parseEquationWithInvalidCharacters, Error, 'should throw if equation contains characters');
  assert.throws(parseEquationWithInvalidDot, Error, 'should throw if equation uses dot incorrectly');
  assert.equal(eq1.compute(), -109.8, 'should handle computation using all supported operands');
  assert.equal(eq2.compute(), 20.5, 'should handle computation with floats');
  assert.equal(eq3.compute(), 5, 'should handle whitespace input');
  assert.equal(eq4.compute(), 0.9375, 'should handle input with repeating operands and decimal points');
  // @todo Implement power of power
  assert.equal(eq5.compute(), 256, 'should handle power of power');
  console.log('OK!');
} catch (e) {
  console.log(e.name + ':', e.message);
}
