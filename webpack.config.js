var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var { TsConfigPathsPlugin, CheckerPlugin } = require('awesome-typescript-loader');

const config = {
  entry: './packages/main/src/index.ts',
  output: {
    filename: '[name].js',
    chunkFilename: '[name]-[chunkhash].js', 
  },
  output: {
    filename: '[name].bundle.js',
    "path": path.resolve('dist'),
  },
  devtool: 'inline-source-map',
  resolve: {
    modules: [
      // path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.ts', '.tsx', '.js', '.scss'],
    plugins: [
      new TsConfigPathsPlugin({ configFileName: './tsconfig.json' }),
    ]
  },
  module: {
    rules: [
      {
        test: /\.worker.ts$/,
        use: [
          { loader: 'worker-loader' },
          { loader: 'ts-loader' },
        ]
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        // exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }]
      },
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new HtmlWebpackPlugin({
      template: './packages/main/src/index.ejs'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource),
    }),
    new webpack.WatchIgnorePlugin([
      /\.js$/,
      /\.d\.ts$/
    ])
  ],
  devServer: {
    port: 4000
  }
};

module.exports = config;
