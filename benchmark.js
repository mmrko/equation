#!/usr/bin/env node

var Benchmark = require('benchmark');
var EquationParser = require('./EquationParser');

/*jshint -W058 */
var suite = new Benchmark.Suite;

var equationParser = new EquationParser();
var inputs = {
  a: '2%3+5-8*3/2.0^1.05+10',
  b: 'sqrt(5^2)-(2/.5)-abs(-1.25)^2/1.5'
};

suite.add('EquationParser#parseEquation', function () {
  equationParser.parseEquation(inputs.a);
  equationParser.parseEquation(inputs.b);
})
.add('EquationParser#parseEquation w/o sanitization', function () {
  equationParser.parseEquation(inputs.a, { skipSanitize: true });
  equationParser.parseEquation(inputs.b, { skipSanitize: true });
})
.add('EquationParser#parseEquation w/o validation', function () {
  equationParser.parseEquation(inputs.a, { skipValidate: true });
  equationParser.parseEquation(inputs.b, { skipValidate: true });
})
.add('EquationParser#parseEquation w/o sanitization & validation', function () {
  equationParser.parseEquation(inputs.a, { skipSanitize: true, skipValidate: true });
  equationParser.parseEquation(inputs.b, { skipSanitize: true, skipValidate: true });
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function () {
  console.log('Fastest is', this.filter('fastest').pluck('name'));
})
.run({ async: true });
