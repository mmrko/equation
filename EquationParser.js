'use strict';

/**
 * Represents a string-based equation as a tree of values & operands.
 * For example,
 *
 *            5*3-2+1-3
 *                |
 *                +
 *             /     \
 *          5*3-2    1-3
 *            |       |
 *            -       -
 *          /   \    / \
 *        5*3    2  1   3
 *         |
 *         *
 *        / \
 *       5   3
 */

var Equation = require('./Equation');

function EquationParser() {}

/**
 * Parses the string representation of an equation into an Equation instance
 * consisting of integers and/or other Equation instances
 * @param  {String} equationStr A string representation of an equation
 * @param  {Array} operands     A string array of operands to process
 * @return {Equation}           An Equation instance
 */
function parseEquation(equationStr, operands) {

  /* jshint validthis:true */

  var subEquations, operand, values;

  operands = operands ? operands.slice() : Equation.SUPPORTED_OPERANDS.slice();

  // Split the equation string into strings of sub-equations
  while ((operand = operands.shift()) !== undefined) {
    subEquations = equationStr.split(operand);
    if (subEquations.length > 1) { break; }
  }

  // Iterate over the sub-equations and call parseEquation recursively if the sub-equation contains operands
  values = subEquations.map(function (subEquationStr) {

    if (this.hasOperands(subEquationStr)) {
        return parseEquation.apply(this, [ subEquationStr, operands ]);
    }
    else {
        return parseInt(subEquationStr, 10);
    }

  }, this);

  return new Equation(values, operand);

}

/**
 * Checks if a given string contains any non-numerical characters
 * @param  {String}  equationStr A string representation of an equation
 * @return {Boolean}             True if non-numerical characters exist, otherwise false
 */
EquationParser.prototype.hasOperands = function (equationStr) {
  return /[^\d]/.test(equationStr);
};

/**
 * Strips input for whitespace before passing it to the private implementation of parseEquation
 * @param  {String}  equationStr A string representation of an equation
 * @return {Equation}            An Equation instance
 *
 * @todo  Implement a more thorough sanitization
 */
EquationParser.prototype.parseEquation = function (equationStr) {

  // Strip whitespace
  equationStr = equationStr.replace(/\s+/g, '');

  return parseEquation.call(this, equationStr);

};

module.exports = EquationParser;
