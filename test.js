#!/usr/bin/env node

'use strict';

var assert = require('assert');

var EquationParser = require('./EquationParser');
var equationParser = new EquationParser();

var parseEquationWithInvalidCharacters = equationParser.parseEquation.bind(equationParser, '1+c+2+b+3');
var parseEquationWithInvalidDecimal = equationParser.parseEquation.bind(equationParser, '1+.-2');
var parseEquationWithInvalidParens = equationParser.parseEquation.bind(equationParser, '1+(1-(1)))(');
var parseEquationSkipSanitization = equationParser.parseEquation.bind(equationParser, '1 + 1', { skipSanitize: true });
var parseEquationSkipValidate = equationParser.parseEquation.bind(equationParser, '1+1+z', { skipValidate: true });
var eq1 = equationParser.parseEquation('2*6+5-2%2-5^3-1+1/5-1');
var eq2 = equationParser.parseEquation('.5+2./.1');
var eq3 = equationParser.parseEquation(' 1    + 2+ 4   /2   ');
var eq4 = equationParser.parseEquation('1+++2**4//2-4..0--....5^^4');
var eq5 = equationParser.parseEquation('2*(1+1)');
var eq6 = equationParser.parseEquation('2^2^3');
var eq7 = equationParser.parseEquation('10%30%8');
var eq8 = equationParser.parseEquation('abs(-1)+sqrt(101-abs(-1))');
var eq9 = equationParser.parseEquation('*1+2-abs');

try {
  assert.throws(parseEquationWithInvalidCharacters, Error, 'should throw if equation contains invalid characters');
  assert.throws(parseEquationWithInvalidDecimal, Error, 'should throw if equation uses the decimal point incorrectly');
  assert.throws(parseEquationWithInvalidParens, Error, 'should throw if parentheses are not in balance');
  assert.throws(parseEquationSkipSanitization, Error, 'should throw if equation contains whitespace');
  assert.throws(parseEquationSkipValidate, Error, 'should not be able to compute an equation containing invalid characters');
  assert.equal(eq1.compute(), -109.8, 'should handle ternary operands');
  assert.equal(eq2.compute(), 20.5, 'should handle floats');
  assert.equal(eq3.compute(), 5, 'should handle whitespace input');
  assert.equal(eq4.compute(), 0.9375, 'should handle repeated operands and decimal points');
  assert.equal(eq5.compute(), 4, 'should handle parentheses');
  assert.equal(eq6.compute(), 256, 'should handle power of power');
  assert.equal(eq7.compute(), 4, 'should handle modulo of modulo');
  assert.equal(eq8.compute(), 11, 'should handle unary operands');
  assert.equal(eq9.compute(), 3, 'should handle leading/trailing operands');
  console.log('OK!');
} catch (e) {
  console.log(e.name + ':', e.message);
}
