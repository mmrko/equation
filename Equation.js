'use strict';

/**
 * Operand operations (in order of precedence)
 */
var OPERATIONS = {
  '+': function (a, b) { return a + b; },
  '-': function (a, b) { return a - b; },
  '%': function (a, b) { return a % b; },
  '*': function (a, b) { return a * b; },
  '/': function (a, b) { return a / b; },
  '^': function (a, b) { return Math.pow(a, b); }
};

/**
 * Equation constructor
 *
 * @param {Array} subequations An array of numbers and/or Equation instances
 * @param {String} operand     Operand by which the subequations are accumulated
 */
function Equation(subequations, operand) {

  this.subequations = subequations;
  this.operand = operand;

}

/**
 * Computes the given equation recursively
 */
Equation.prototype.compute = function () {

  var operation = OPERATIONS[this.operand];

  return this.subequations.map(function (subequation) {
    return subequation instanceof Equation ? this.compute.call(subequation) : subequation;
  }, this).reduce(function (prev, current) {
    return operation.apply(null, [ prev, current ]);
  }.bind(this));

};

module.exports = Equation;

/**
 * Supported operands
 *
 * @borrows Uses keys from OPERATIONS
 * @see     OPERATIONS
 */
module.exports.SUPPORTED_OPERANDS = Object.keys(OPERATIONS);
