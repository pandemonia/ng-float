/* eslint-env node */

const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Extend all the configuration from webpack.common.js ('smart' resolves duplicates)
module.exports = merge.smart(common, {
  // Setting this mode adds webpack's production defaults
  mode: 'development',
  // Inline source maps for browser debugging
  optimization: {
    usedExports: true,
  },
  devtool: 'inline-source-map',
  // Serve non-dynamic imports from this location
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    // Inject the dependencies into the following HTML file.
    // Used for developing the library in a standalone environment, with just the
    // required dependencies.
    new HtmlWebpackPlugin({
      template: './src/public/index.html'
    }),
    // Ensure that angular uses jQuery instead of jQlite
    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery'
    }),
  ]
});
