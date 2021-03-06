/**
 * Extractor function for a CallExpression type value node.
 * A call expression looks like `bar()`
 * This will return `bar` as the value to indicate its existence,
 * since we can not execute the function bar in a static environment.
 *
 * @param - value - AST Value object with type `CallExpression`
 * @returns - The extracted value converted to correct type.
 */
export default function extractValueFromCallExpression(value) {
  // eslint-disable-next-line global-require
  const getValue = require('./index.js').default;
  return getValue(value.callee);
}
