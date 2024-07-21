import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import nodeResolve from 'rollup-plugin-node-resolve';

let pkg = require('./package.json');

export default {
  entry: 'index.js',
  plugins: [
    babel(babelrc()),
    nodeResolve()
  ],
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'd3',
      sourceMap: true,
      globals: {
        'd3-selection': 'd3',
        'd3-dispatch': 'd3',
        'd3-shape': 'd3',
        'd3-drag': 'd3'
      }
    }
  ]
};
