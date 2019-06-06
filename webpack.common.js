/* eslint-env node */

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './src/app/app.js',
  plugins: [
    // Clean the build folder
    new CleanWebpackPlugin(),
    // Extract all CSS imports into this file
    new MiniCssExtractPlugin({
      filename: 'float.css'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // Loader to extract CSS into a file
          MiniCssExtractPlugin.loader,
          // Loader to parse CSS
          'css-loader'
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          // Loader to support javascript features to those which are not present
          // in current browsers
          loader: 'babel-loader',
          options: {
            presets: [
              [
                // Target all 'future' features which are not supported by current browsers
                "@babel/preset-env",
                {
                  // List of current browsers to be targetted
                  targets: "last 2 version, > 1%, Firefox ESR, not dead"
                }
              ]
            ]
          }
        }
      },
    ],
  },
  output: {
    // Outputh directory
    path: path.resolve(__dirname, 'dist'),
    // Output file location
    filename: 'float.js'
  }
};
