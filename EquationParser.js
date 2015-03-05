'use strict';

/**
 * Parses a string-based equation into a tree of operands &
 * an array of numbers and/or Equation instances.
 *
 * For example, the equation 5*3-(2+1*0.5)-1%3 becomes
 *
 *               5*3-(2+1*0.5)-1%3
 *                     |
 *                     -
 *               /     \      \
 *            5*3   2+1*0.5   1%3
 *             |      |        |
 *             -      +        %
 *           /  \    / \      / \
 *         5*3  2  2  1*0.5  1   3
 *         |           |
 *         *           *
 *        / \         / \
 *       5   3       1  0.5
 *
 * where an operand node & its immediate children (sub-equations) form an Equation.
 *
 */

var Equation = require('./Equation');
var SUPPORTED_OPERANDS = Equation.SUPPORTED_OPERANDS;
var SUPPORTED_OPERANDS_REGEX = new RegExp('[\\' + SUPPORTED_OPERANDS.join('\\') + ']');

function EquationParser() {}

/**
 * Validates a given equation string by checking if it contains
 *   - characters that are not numbers, decimal points, operands or parentheses
 *   - two or more consecutive non-numerical characters (e.g. ++, *., /-)
 *
 * @param  {String} equationStr
 * @throws {Error}  Throws an Error if the input is invalid
 *
 * @todo  Check if parentheses are in balance
 */
function validateEquation(equationStr) {

  var regexStr = '[^\\d\\(\\)]{2,}|[^\\d\\.\\(\\)\\' + SUPPORTED_OPERANDS.join('\\') + ']';
  var validationRegex = new RegExp(regexStr);

  if (validationRegex.test(equationStr)) {
    throw new Error('The equation contains invalid characters. Supported operands: ' + SUPPORTED_OPERANDS.join(', '));
  }

}

/**
 * Sanitizes/normalizes the equation string:
 *   - convert to lowercase
 *   - strip whitespace
 *   - strip repeating operands
 *   - pad decimal points with leading/trailing zeros
 *
 * @param  {String} equationStr The equation
 * @return {String}             A sanitized equation
 */
function sanitizeEquation(equationStr) {

  var repeatingCharsRegex = new RegExp('([\\.\\' + SUPPORTED_OPERANDS.join('\\') + '])(?=\\1+)', 'g');

  return equationStr
    .toLowerCase()
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
 * Checks if a given equation string is surrounded by parentheses
 * @param  {String}  equationStr
 * @return {Boolean}             True if the equation string is surrounded by parentheses,
 *                               false otherwise
 */
function hasSurroundingParens (equationStr) {

  var length = equationStr.length;
  var parentheses = -1;
  var idx, char;

  if (equationStr[0] !== '(' || equationStr[length - 1] !== ')') { return false; }

  for (idx = length - 1; idx--;) {
    char = equationStr[idx];
    if (char === '(') { parentheses++; }
    else if (char === ')') { parentheses--; }
    if (!parentheses && idx) { return false; }
  }

  return true;
}

/**
 * Split the equation string by operand (parentheses aware).
 * Uses String.split() if the equation contains no parentheses.
 * @param  {String} equationStr  e.g. 1+1
 * @param  {String} operand      e.g. +
 * @return {Array}               An array of subequation strings
 */
function split(equationStr, operand) {

  // Return immediately if the given operand doesn't exist
  if (equationStr.indexOf(operand) === -1) { return [ equationStr ]; }

  // Use String.split() if the equation string contains no parentheses
  if (equationStr.indexOf('(') === -1 && equationStr.indexOf(')') === -1) {
    return equationStr.split(operand);
  }

  var parentheses = 0;
  var subEquationStrings = [];
  var cBegin, cEnd, char;

  for (cBegin = cEnd = equationStr.length; cBegin--;) {

    char = equationStr[cBegin];

    if (char === '(') { parentheses++; }
    else if (char === ')') { parentheses--; }
    else if (char === operand && !parentheses) {
      subEquationStrings.unshift(equationStr.substring(cBegin + 1, cEnd));
      cEnd = cBegin;
    }

  }

  subEquationStrings.unshift(equationStr.substring(0, cEnd));

  return subEquationStrings;
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

  if (!hasOperands(equationStr)) {
    var number = parseFloat(equationStr, 10);
    return new Equation(number);
  }

  if (hasSurroundingParens(equationStr)) {
    return parseEquation(equationStr.replace(/^\(|\)$/g, ''));
  }

  /* jshint validthis:true */

  var subEquationStrings, subequations, operand;

  operands = operands ? operands.slice() : SUPPORTED_OPERANDS.slice();

  // Try splitting the equation into sub-equations using each of the supported operands
  while ((operand = operands.shift()) !== undefined) {
    subEquationStrings = split(equationStr, operand);
    if (subEquationStrings.length > 1) { break; }
  }

  // Iterate over the sub-equations and call parseEquation recursively
  subequations = subEquationStrings.map(function (subEquationStr) {
    return parseEquation(subEquationStr, operands);
  });

  return new Equation(subequations, operand);

}

/**
 * An overload of parseEquation().
 * Sanitizes & validates the input before passing it to parseEquation().
 *
 * @param  {String}  equationStr             A string representation of an equation
 * @param  {Object}  [options]
 * @param  {Boolean} [options.skipSanitize]  Boolean to control input sanitization (default: false)
 * @param  {Boolean} [options.skipValidate]  Boolean to control input validation (default: false)
 * @return {Equation}                        An Equation instance
 *
 * @see  parseEquation()
 */
EquationParser.prototype.parseEquation = function (equationStr, options) {

  options = options || {};

  // Sanitize
  if (!options.skipSanitize) { equationStr = sanitizeEquation(equationStr); }

  // Validate
  if (!options.skipValidate) { validateEquation(equationStr); }

  // Parse
  return parseEquation.call(this, equationStr);

};

module.exports = EquationParser;
