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

  this.subequations = Array.isArray(subequations) ? subequations : [ subequations ];
  this.operand = operand;

}

/**
 * Computes the given equation recursively
 */
Equation.prototype.compute = function () {

  var operation = OPERATIONS[this.operand];

  var numbers = this.subequations.map(function (subequation) {
    return subequation instanceof Equation ? this.compute.call(subequation) : subequation;
  }, this);

  // power of power and modulo of modulo are computed from right to left
  if (this.operand === '^' || this.operand === '%') {
    return numbers.reduceRight(function (prev, current) {
      return operation.apply(null, [ current, prev ]);
    });
  }

  return numbers.reduce(function (prev, current) {
    return operation.apply(null, [ prev, current ]);
  });

};

module.exports = Equation;

/**
 * Supported operands
 *
 * @borrows Uses keys from OPERATIONS
 * @see     OPERATIONS
 */
module.exports.SUPPORTED_OPERANDS = Object.keys(OPERATIONS);
