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
  '^': function (a, b) { return Math.pow(a, b); },
  's': function (a) { return Math.sqrt(a); },
  'a': function (a) { return Math.abs(a); }
};

var SUPPORTED_OPERANDS = Object.keys(OPERATIONS);

Object.defineProperty(SUPPORTED_OPERANDS, 'unary', {
  value: SUPPORTED_OPERANDS.filter(function (operand) { return OPERATIONS[operand].length === 1; })
});
Object.defineProperty(SUPPORTED_OPERANDS, 'ternary', {
  value: SUPPORTED_OPERANDS.filter(function (operand) { return OPERATIONS[operand].length === 2; })
});
Object.defineProperty(SUPPORTED_OPERANDS, 'toString', {
  value: function () { return this.join(', '); }
});

/**
 * Equation constructor
 *
 * @param {Array}  subequations An array of numbers and/or Equation instances
 * @param {String} [operand]   Operand by which the subequations are accumulated
 */
function Equation(subequations, operand) {

  this.subequations = Array.isArray(subequations) ? subequations : [ subequations ];
  this.operand = operand;

}

function isUnaryOperand (operand) {
  return SUPPORTED_OPERANDS.unary.indexOf(operand) !== -1;
}

/**
 * Computes the given equation recursively
 */
Equation.prototype.compute = function () {

  var operand = this.operand;

  if (!operand) { return this.subequations[0]; }

  var operation = OPERATIONS[operand];

  var numbers = this.subequations.map(function (subequation) {
    return subequation instanceof Equation ? this.compute.call(subequation) : subequation;
  }, this);

  if (isUnaryOperand(operand)) {
    return operation(numbers[0]);
  }

  // power of power and modulo of modulo are computed from right to left
  if (operand === '^' || operand === '%') {
    return numbers.reduceRight(function (prev, current) {
      return operation(current, prev);
    });
  }

  return numbers.reduce(function (prev, current) {
    return operation(prev, current);
  });

};

module.exports = Equation;
module.exports.isUnaryOperand = isUnaryOperand;
module.exports.SUPPORTED_OPERANDS = SUPPORTED_OPERANDS;
