const path = require('path')
const BannerPlugin = require('webpack').BannerPlugin
const pkg = require('./package.json')

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    library: 'MediaStylePalette',
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: path.join(__dirname, 'dist'),
    filename: 'media-style-palette.min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new BannerPlugin(`${pkg.name} - ${pkg.description}
--------
@version ${pkg.version}
@homepage: ${pkg.homepage}
@license ${pkg.license}
@author ${pkg.author}
`)
  ],
  devtool: 'source-map'
}
