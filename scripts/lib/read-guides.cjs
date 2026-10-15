const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('@babel/parser');

// Parse data, never execute the module or import browser dependencies.
function readGuides() {
  const source = fs.readFileSync(path.join(__dirname, '../../src/constants/guides.js'), 'utf8');
  const ast = parse(source, { sourceType: 'module' });
  const root = ast.program.body.find((node) => node.type === 'ExportNamedDeclaration'
    && node.declaration?.declarations?.[0]?.id.name === 'GUIDES')?.declaration.declarations[0].init;
  function value(node) {
    if (['StringLiteral', 'NumericLiteral', 'BooleanLiteral'].includes(node?.type)) return node.value;
    if (node?.type === 'NullLiteral') return null;
    if (node?.type === 'TemplateLiteral' && !node.expressions.length) return node.quasis[0].value.cooked;
    if (node?.type === 'ArrayExpression') return node.elements.map(value);
    if (node?.type === 'ObjectExpression') return Object.fromEntries(node.properties.map((field) => {
      if (field.type !== 'ObjectProperty' || field.computed) throw new Error('GUIDES must contain static properties');
      return [field.key.name || field.key.value, value(field.value)];
    }));
    throw new Error(`GUIDES must contain static data, received ${node?.type}`);
  }
  return value(root);
}
module.exports = readGuides;
