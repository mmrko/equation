'use strict';

/**
 * Parses a string-based equation into a tree of operands & numbers/Equation instances.
 *
 * For example, the equation 5*3-2+1-3 becomes:
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
var SUPPORTED_OPERANDS = Equation.SUPPORTED_OPERANDS;

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

  operands = operands ? operands.slice() : SUPPORTED_OPERANDS.slice();

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
        return parseFloat(subEquationStr, 10);
    }

  }, this);

  return new Equation(values, operand);

}

/**
 * Validates a given equation string by checking that it
 * contains only numbers and/or supported operands
 *
 * @param  {String} equationStr
 * @throws {Error}  Throws an Error if the input is invalid
 *
 * @todo Check for invalid use of operands (e.g. 1++2)
 */
EquationParser.prototype.validateEquation = function(equationStr) {

  var regexStr = '[^\\d]{3,}|[^\\d\\.\\' + SUPPORTED_OPERANDS.join('\\') + ']';
  var validationRegex = new RegExp(regexStr, 'gi');

  if (validationRegex.test(equationStr)) {

    throw new Error('The equation contains invalid characters. Supported operands: ' + SUPPORTED_OPERANDS.join(', '));
  }

};

/**
 * Checks if a given string contains characters that are nor numbers or dots (that is, operands)
 *
 * @param  {String}  equationStr A string representation of an equation
 * @return {Boolean}             True if non-numerical characters exist, otherwise false
 */
EquationParser.prototype.hasOperands = function (equationStr) {
  return /[^\d\.]/.test(equationStr);
};

/**
 * An overload of parseEquation().
 * Strips whitespace & validates the input before passing it to parseEquation().
 *
 * @param  {String}  equationStr A string representation of an equation
 * @return {Equation}            An Equation instance
 *
 * @see  parseEquation()
 */
EquationParser.prototype.parseEquation = function (equationStr) {

  // Strip whitespace
  equationStr = equationStr.replace(/\s+/g, '');

  this.validateEquation(equationStr)

  return parseEquation.call(this, equationStr);

};

module.exports = EquationParser;
