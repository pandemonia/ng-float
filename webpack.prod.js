/* eslint-env node */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// Extend all the configuration from webpack.common.js ('smart' resolves duplicates)
module.exports = merge.smart(common, {
  // Setting this mode adds webpack's production defaults
  mode: 'production',
  optimization: {
    minimizer: [
      // Minifier for JS files
      new TerserPlugin(),
      // Minifier for CSS files
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  // List of externals which are required to be already present in the target
  // browser as these libraries are listed as dependencies. The keys are the
  // imports used in this library, and the values are the expected global variables
  // indicating that the dependency has been met
  externals: {
    'lodash': '_',
    'angular': 'angular',
    'jquery-ui/ui/widgets/draggable': '$.ui.draggable',
    'jquery-ui/ui/widgets/resizable': '$.ui.resizable',
    'jquery-ui/themes/base/draggable.css': '$.ui.draggable',
    'jquery-ui/themes/base/resizable.css': '$.ui.resizable'
  }
});
