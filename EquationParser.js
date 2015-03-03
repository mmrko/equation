'use strict';

/**
 * Parses a string-based equation into a tree of operands &
 * an array of numbers and/or Equation instances.
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
 * 
 * where an operand node & its immediate children (sub-equations) form an Equation.
 * 
 */

var Equation = require('./Equation');
var SUPPORTED_OPERANDS = Equation.SUPPORTED_OPERANDS;
var SUPPORTED_OPERANDS_REGEX = new RegExp('[\\' + SUPPORTED_OPERANDS.join('\\') + ']', 'gi');

function EquationParser() {}

/**
 * Validates a given equation string by checking if it contains
 *   - characters that are not numbers, decimal points or operands
 *   - two or more consecutive non-numerical characters (e.g. ++, *., /-)
 *
 * @param  {String} equationStr
 * @throws {Error}  Throws an Error if the input is invalid
 * @todo Horribly slow. We can do better (simplify)
 */
function validateEquation(equationStr) {

  var regexStr = '\\D{2,}|[^\\d\.\\' + SUPPORTED_OPERANDS.join('\\') + ']';
  var validationRegex = new RegExp(regexStr, 'gi');

  if (validationRegex.test(equationStr)) {
    throw new Error('The equation contains invalid characters. Supported operands: ' + SUPPORTED_OPERANDS.join(', '));
  }

}

/**
 * Sanitizes the equation string:
 *   - strip whitespace
 *   - strip repeating operands
 *   - pad decimal points with leading/trailing zeros
 *
 * @param  {String} equationStr The equation
 * @return {String}             A sanitized equation
 */
function sanitizeEquation(equationStr) {

  var repeatingCharsRegex = new RegExp('([\\.\\' + SUPPORTED_OPERANDS.join('\\') + '])(?=\\1+)', 'gi');

  return equationStr
    // Strip whitespace
    .replace(/\s+/g, '')
    // Strip repeating operands and decimal points (e.g. 1+++2 => 1+2)
    .replace(repeatingCharsRegex, '')
    // Pad decimal points with zeros (leading & trailing)
    .replace(/(\D)\.(\d)/g, function (m, p1, p2) { return p1 + '0.' + p2; })
    .replace(/(\d)\.(\D)/g, function (m, p1, p2) { return p1 + '.0' + p2; });

}

/**
 * Checks if a given string contains any of the supported operands
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
 * consisting of numbers and/or other Equation instances.
 *
 * @param  {String} equationStr A string representation of an equation
 * @param  {Array} operands     An array of operands to process (defaults to SUPPORTED_OPERANDS)
 * @return {Equation}           An Equation instance
 */
function parseEquation(equationStr, operands) {

  /* jshint validthis:true */

  var subEquationStrings, subequations, operand;

  operands = operands ? operands.slice() : SUPPORTED_OPERANDS.slice();

  // Try splitting the equation into sub-equations using each of the supported operands
  while ((operand = operands.shift()) !== undefined) {
    subEquationStrings = equationStr.split(operand);
    if (subEquationStrings.length > 1) { break; }
  }

  // Iterate over the sub-equations and call parseEquation recursively if the sub-equation contains operands
  subequations = subEquationStrings.map(function (subEquationStr) {

    if (hasOperands(subEquationStr)) {
        return parseEquation.apply(this, [ subEquationStr, operands ]);
    }
    else {
        return parseFloat(subEquationStr, 10);
    }

  }, this);

  return new Equation(subequations, operand);

}

/**
 * An overload of parseEquation().
 * Sanitizes & validates the input before passing it to parseEquation().
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

  // Parse
  return parseEquation.call(this, equationStr);

};

module.exports = EquationParser;
