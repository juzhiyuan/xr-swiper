const path = require('path')
const webpack = require('webpack')

const base = path.resolve(__dirname, '..')

module.exports = {
  bail: true,
  stats: {children: false},
  mode: 'development',

  entry: {
    'react-swipe': path.resolve(base, './src/index.js'),
    'examples-swipe': path.resolve(base, './examples/swipe/index.js'),
    'examples-photo-swipe': path.resolve(base, './examples/photo-swipe/index.js'),
  },

  output: {
    path: path.resolve(base, 'dist'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css?$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
    ],
  },

  devtool: 'cheap-eval-source-map',

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    contentBase: path.join(base, 'examples'),
    hot: true,
    host: '0.0.0.0',
    port: 8888,
  },
}
