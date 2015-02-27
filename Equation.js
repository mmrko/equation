'use strict';

/**
 * Equation constructor
 *
 * @param {Array} values   An array of integers and/or other Equation instances
 * @param {String} operand Operand by which the values are accumulated
 */
function Equation(values, operand) {

  this.values = values;
  this.operand = operand;

}

/**
 * Operand operations
 */
Equation.prototype.operations = {
  '^': function (a, b) { return Math.pow(a, b); },
  '%': function (a, b) { return a % b; },
  '/': function (a, b) { return a / b; },
  '*': function (a, b) { return a * b; },
  '-': function (a, b) { return a - b; },
  '+': function (a, b) { return a + b; }
};

Equation.prototype.getOperation = function () {
  return this.operations[this.operand];
};

/**
 * Computes the given equation recursively
 */
Equation.prototype.compute = function () {

  var operation = this.getOperation();

  return this.values.map(function (value) {
    return value instanceof Equation ? this.compute.call(value) : value;
  }, this).reduce(function (prev, current) {
    return operation.apply(null, [ prev, current ]);
  }.bind(this));

};

module.exports = Equation;

/**
 * Supported operands
 */
module.exports.SUPPORTED_OPERANDS = [ '+', '-', '*', '/' , '%', '^' ];
