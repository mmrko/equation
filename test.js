#!/usr/bin/env node

'use strict';

var assert = require('assert');

var EquationParser = require('./EquationParser');
var equationParser = new EquationParser();

var eq1 = equationParser.parseEquation('2*6+5-2%2-5^3-1+1/5-1');
var eq2 = equationParser.parseEquation(' 1    + 2+ 4   /2   ');

assert.equal(eq1.compute(), -109.8, 'should handle computation');
assert.equal(eq2.compute(), 5, 'should handle whitespaced input');