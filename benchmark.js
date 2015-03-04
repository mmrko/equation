#!/usr/bin/env node

var Benchmark = require('benchmark');
var EquationParser = require('./EquationParser');

/*jshint -W058 */
var suite = new Benchmark.Suite;

var equationParser = new EquationParser();
var input = '2%3+5-8*3/2.0^1.05+10';

suite.add('EquationParser#parseEquation', function () {
  var eq = equationParser.parseEquation(input);
})
.add('EquationParser#parseEquation w/o sanitization', function () {
  var eq = equationParser.parseEquation(input, { skipSanitize: true });
})
.add('EquationParser#parseEquation w/o validation', function () {
  var eq = equationParser.parseEquation(input, { skipValidate: true });
})
.add('EquationParser#parseEquation w/o sanitization & validation', function () {
  var eq = equationParser.parseEquation(input, { skipSanitize: true, skipValidate: true });
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function () {
  console.log('Fastest is', this.filter('fastest').pluck('name'));
})
.run({ async: true });
