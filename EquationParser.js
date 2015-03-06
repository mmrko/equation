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
 *               /     |       \
 *            5*3   2+1*0.5    1%3
 *             |       |         \
 *             -       +          %
 *           /  \    /  \        / \
 *          5   3   2  1*0.5    1   3
 *                       |
 *                       *
 *                      / \
 *                     1  0.5
 *
 * where an operand node & its immediate children (sub-equations) form an Equation.
 *
 */

var Equation = require('./Equation');
var SO = Equation.SUPPORTED_OPERANDS;

function EquationParser() {}

/**
 * Checks if the parentheses of the given equation are balanced.
 * @param  {String}  equationStr
 * @return {Boolean}             False if inbalanced, otherwise true
 */
function hasBalancedParentheses (equationStr) {

  // Check for odd number of parentheses
  if(equationStr.replace(/[^\(\)]/g, '').split('').length % 2) {
    return false;
  }

  var parentheses = 0, i;
  for (i = equationStr.length; i--;) {
    if (equationStr[i] === ')') { parentheses--; }
    else if (equationStr[i] === '(') { parentheses++; }
    if (parentheses === 1) { return false; }
  }

  return true;
}

/**
 * Validates a given equation string by checking if it
 *   - is missing operands [ e.g. 1+1(2+2) ]
 *   - uses decimal point incorrectly [ e.g. +.- or ).( ]
 *   - has unbalanced parentheses [ e.g (1+1)+(2*5-1)) ]
 *   - has two or more consecutive operands [ e.g. 1++1 ]
 *   - contains characters that are not numbers, decimal points, parentheses or operands
 *
 * @param  {String} equationStr
 * @throws {Error}  Throws an Error if the input is invalid
 *
 * @todo  Check if parentheses are in balance
 */
function validateEquation(equationStr) {

  var invalidCharsRegexStr = '[^\\d\\.\\(\\)\\' + SO.ternary.join('\\') + SO.unary.join('') + ']';
  var consecutiveOperandsRegexStr = '[\\' + SO.ternary.join('\\') + ']{2,}';
  var invalidCharsRegex = new RegExp(invalidCharsRegexStr);
  var consecutiveOperandsRegex = new RegExp(consecutiveOperandsRegexStr);

  if (/\)\(/.test(equationStr)) {
    throw new Error('Missing an operand.');
  }

  if (/\D\.\D/.test(equationStr)) {
    throw new Error('Invalid use of the decimal point.');
  }

  if (!hasBalancedParentheses(equationStr)) {
    throw new Error('Parentheses are not in balance.');
  }

  if (consecutiveOperandsRegex.test(equationStr)) {
    throw new Error('Consecutive ternary operands detected.');
  }

  if (invalidCharsRegex.test(equationStr)) {
    throw new Error('The equation contains invalid characters. Supported operands: ' + SO);
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

  var repeatingCharsRegex = new RegExp('([\\.\\' + SO.ternary.join('\\') + SO.unary.join('') + '])(?=\\1+)', 'g');
  var trailingLeadingOperands = new RegExp('^[\\' + SO.ternary.join('\\') + ']+|[\\' + SO.ternary.join('\\') + SO.unary.join('') + ']+$', 'g');

  return equationStr
    .toLowerCase()
    // Strip whitespace
    .replace(/\s+/g, '')
    // Strip repeating operands and decimal points (e.g. 1+++2 => 1+2)
    .replace(repeatingCharsRegex, '')
    // Strip leading/trailing ternary and unary operands (+1+2+abs => 1+2)
    .replace(trailingLeadingOperands, '')
    // Pad decimal points with zeros (leading & trailing)
    .replace(/(\D)\.(\d)/g, function (m, p1, p2) { return p1 + '0.' + p2; })
    .replace(/(\d)\.(\D)/g, function (m, p1, p2) { return p1 + '.0' + p2; });

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

  // Loop through the characters from right to left and return false
  // if we hit an opening parentheses that matches the surrounding closing parentheses
  // before we have reached the last character
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
  if (!/\(|\)/.test(equationStr)) {
    return equationStr.split(operand);
  }

  var parentheses = 0;
  var subEquationStrings = [];
  var cBegin, cEnd, char;

  // Loop through the characters from right to left and split the
  // equation string into subequation string if the given operand
  // is not located within parentheses
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
 * consisting of one or more Equation instances.
 *
 * @param  {String} equationStr A string representation of an equation
 * @param  {Array} operands     An array of operands to process (defaults to SO)
 * @return {Equation}           An Equation instance
 */
function parseEquation(equationStr, operands) {

  equationStr = equationStr || '0';

  if (!isNaN(equationStr)) {
    return new Equation(equationStr);
  }

  if (hasSurroundingParens(equationStr)) {

    // Strip surrounding parentheses and call parseEquation again
    return parseEquation(equationStr.replace(/^\(|\)$/g, ''));

  }

  /* jshint validthis:true */

  var subEquationStrings, subequations, operand;

  operands = operands ? operands.slice() : SO.slice();

  // Try splitting the equation into sub-equations using each of the supported operands
  while ((operand = operands.shift()) !== undefined) {
    subEquationStrings = split(equationStr, operand);
    if (subEquationStrings.length > 1) { break; }
  }

  // Unary operands are one-sided assignments so drop split's first entry (which is '')
  if (Equation.isUnaryOperand(operand)) { subEquationStrings.shift(); }

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

  // Alias unary operands for faster matching: sqrt => s, abs => a
  equationStr = equationStr.replace(/(s)qrt|(a)bs/gi, '$1$2');

  // Sanitize
  if (!options.skipSanitize) { equationStr = sanitizeEquation(equationStr); }

  // Validate
  if (!options.skipValidate) { validateEquation(equationStr); }

  // Parse
  return parseEquation(equationStr);

};

module.exports = EquationParser;
