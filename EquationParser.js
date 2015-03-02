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
var SUPPORTED_OPERANDS_REGEX = new RegExp('[\\' + SUPPORTED_OPERANDS.join('\\') + ']', 'gi');

function EquationParser() {}

/**
 * Validates a given equation string by checking that it contains
 * only numbers (integers or zero-padded floats) and/or supported operands
 *
 * @param  {String} equationStr
 * @throws {Error}  Throws an Error if the input is invalid
 */
function validateEquation(equationStr) {

  var regexStr = '[^\\d]{2,}|[^\\d\\.\\' + SUPPORTED_OPERANDS.join('\\') + ']';
  var validationRegex = new RegExp(regexStr, 'gi');

  if (validationRegex.test(equationStr)) {
    throw new Error('The equation contains invalid characters. Supported operands: ' + SUPPORTED_OPERANDS.join(', '));
  }

}

/**
 * Sanitizes the equation string:
 *   - strip whitespace
 *   - pad decimal points with missing zeros
 *
 * @param  {String} equationStr The equation
 * @return {String}             A sanitized equation
 */
function sanitizeEquation(equationStr) {

  return equationStr
    // Strip whitespace
    .replace(/\s+/g, '')
    // Pad decimal points with zeros
    .replace(/(\D)\.(\d)/g, function (m, p1, p2) {
      return p1 + '0.' + p2;
    })
    .replace(/(\d)\.(\D)/g, function (m, p1, p2) {
      return p1 + '.0' + p2;
    });

}

/**
 * Checks if a given string contains operand characters
 *
 * @param  {String}  equationStr A string representation of an equation
 * @return {Boolean}             True if operand characters exist, otherwise false
 */
function hasOperands (equationStr) {
  SUPPORTED_OPERANDS_REGEX.lastIndex = 0;
  return SUPPORTED_OPERANDS_REGEX.test(equationStr);
}

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

    if (hasOperands(subEquationStr)) {
        return parseEquation.apply(this, [ subEquationStr, operands ]);
    }
    else {
        return parseFloat(subEquationStr, 10);
    }

  }, this);

  return new Equation(values, operand);

}

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

  // Sanitize
  equationStr = sanitizeEquation(equationStr);

  // Validate
  validateEquation(equationStr)

  return parseEquation.call(this, equationStr);

};

module.exports = EquationParser;
