// Keep full guide bodies out of the homepage's initial JavaScript bundle.
// Read static metadata from the source AST so summaries cannot drift from it.
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('@babel/parser');
const source = fs.readFileSync(path.join(__dirname, '../src/constants/guides.js'), 'utf8');
const ast = parse(source, { sourceType: 'module' });
const guides = ast.program.body.find((node) => node.type === 'ExportNamedDeclaration'
  && node.declaration?.declarations?.[0]?.id.name === 'GUIDES')?.declaration.declarations[0].init;
if (guides?.type !== 'ObjectExpression') throw new Error('GUIDES must be a static object');
const key = (node) => node.key.name || node.key.value;
const result = {};
for (const language of guides.properties) {
  result[key(language)] = {};
  for (const guide of language.value.properties) {
    const summary = {};
    for (const name of ['title', 'description', 'heroImage']) {
      const value = guide.value.properties.find((field) => key(field) === name)?.value;
      if (value?.type !== 'StringLiteral') throw new Error(`Guide metadata must be a string: ${name}`);
      summary[name] = value.value;
    }
    result[key(language)][key(guide)] = summary;
  }
}
const output = JSON.stringify(result, null, 2) + '\n';
const target = path.join(__dirname, '../src/data/seo/guide-summaries.json');
if (process.argv.includes('--check')) {
  if (fs.readFileSync(target, 'utf8') !== output) throw new Error('Guide summaries are out of date');
} else fs.writeFileSync(target, output);
