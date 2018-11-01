/* eslint-env node */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Extend all the configuration from webpack.common.js ('smart' resolves duplicates)
module.exports = merge.smart(common, {
  // Setting this mode adds webpack's production defaults
  mode: 'production',
  optimization: {
    minimizer: [
      // Minifier for JS files
      new UglifyJsPlugin({}),
      // Minifier for CSS files
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  // List of javascript externals which are required to be already present in the
  // target browser as these libraries are listed as dependencies
  externals: {
    'lodash': '_',
    'angular': 'angular',
    'jquery-ui/ui/widgets/draggable': '$.ui.draggable',
    'jquery-ui/ui/widgets/resizable': '$.ui.resizable',
  },
  plugins: [
    // Similar to above but for CSS - ignore all jquery-ui CSS imports as they
    // will be already present in the browser
    new webpack.IgnorePlugin(/^jquery-ui.*\.css$/),
  ]
});
