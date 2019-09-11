const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env) => {
  config = {
    entry: './src/index.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [
        '.tsx',
        '.ts',
        '.js'
      ]
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    }
  }

  if (env.production) {
    return Object.assign(config, {
      mode: 'production',
      optimization: {
        minimizer: [new UglifyJsPlugin()]
      }
    })
  } else {
    return Object.assign(config, {
      mode: 'development',
      devtool: 'inline-source-map',
      devServer: {
        contentBase: path.join(__dirname, 'dist'),
        disableHostCheck: true,
        watchContentBase: true,
        host: '0.0.0.0',
        port: 4000,
        hot: true
      }
    })
  }
}
