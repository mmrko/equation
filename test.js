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
var eq5 = equationParser.parseEquation.bind(equationParser, '2*(1+1)');
var eq6 = equationParser.parseEquation('2^2^3');
var eq7 = equationParser.parseEquation('10%30%8');
var eq8 = equationParser.parseEquation.bind(equationParser, 'abs(-1)');
var eq9 = equationParser.parseEquation('*1+2-');

try {
  assert.throws(parseEquationWithInvalidCharacters, Error, 'should throw if equation contains characters');
  assert.throws(parseEquationWithInvalidDot, Error, 'should throw if equation uses dot incorrectly');
  assert.equal(eq1.compute(), -109.8, 'should handle supported operands');
  assert.equal(eq2.compute(), 20.5, 'should handle floats');
  assert.equal(eq3.compute(), 5, 'should handle whitespace input');
  assert.equal(eq4.compute(), 0.9375, 'should handle input with repeating operands and decimal points');
  // @todo Implement support for parentheses
  assert.doesNotThrow(eq5, Error, 'should handle parentheses');
  // @todo Implement support for power of power
  assert.equal(eq6.compute(), 256, 'should handle power of power');
  // @todo Implement support for modulo of modulo
  assert.equal(eq7.compute(), 4, 'should handle modulo of modulo');
  // @todo Implement support for unary operands
  assert.doesNotThrow(eq8, Error, 'should handle unary operands');
  // @todo Implement support for handling leading/trailing operands
  assert.equal(eq9.compute(), 3, 'should handle leading/trailing operands');
  console.log('OK!');
} catch (e) {
  console.log(e.name + ':', e.message);
}
