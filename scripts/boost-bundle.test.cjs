const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const fs = require('node:fs');
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
const webpack = require('webpack');
const cra = require('react-scripts/config/webpack.config')('production');

test('CRA production bundle exposes working visibility functions to browser imports', async () => {
  const outputPath = path.resolve('reports');
  const filename = `boost-bundle-check-${process.pid}.cjs`;
  const compiler = webpack({
    mode: 'production', target: 'web',
    entry: path.resolve('scripts/fixtures/boost-browser-entry.mjs'),
    output: { path: outputPath, filename, publicPath: '', library: { type: 'commonjs2' } },
    module: cra.module, resolve: cra.resolve, resolveLoader: cra.resolveLoader,
  });
  try {
    await new Promise((resolve, reject) => compiler.run((error, stats) => {
      if (error) return reject(error);
      if (stats.hasErrors()) return reject(new Error(stats.toString({ all: false, errors: true })));
      resolve();
    }));
    const sandbox = { module: { exports: {} } };
    vm.runInNewContext(fs.readFileSync(path.join(outputPath, filename), 'utf8'), sandbox);
    const visibility = sandbox.module.exports;
    assert.equal(typeof visibility.rankVans, 'function');
    assert.equal(typeof visibility.isBoostActive, 'function');
    const ranked = visibility.rankVans([{ id: 'expensive', price: 500 }, { id: 'cheap', price: 100 }], 'price-asc');
    assert.equal(ranked[0].id, 'cheap');
    assert.equal(visibility.isBoostActive({ status: 'sold' }), false);
  } finally {
    await new Promise((resolve) => compiler.close(resolve));
    if (fs.existsSync(path.join(outputPath, filename))) fs.unlinkSync(path.join(outputPath, filename));
  }
});
