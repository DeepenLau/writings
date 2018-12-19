const path = require('path')
const Compiler = require('./Compiler')
const WebpackOptionsApply = require('./WebpackOptionsApply')

let defaultOptions = {
  entry: './src/index.js',
  output: path.join(process.cwd(), "dist"),
  context: process.cwd()
}

const mypack = (options, callback) => {
  options = { ...defaultOptions, ...options }

  let compiler = new Compiler(options.context)
  compiler.options = options

  compiler.options = new WebpackOptionsApply().process(options, compiler)

  if (callback) {
    compiler.run(callback)
  }
  return compiler
}

module.exports = mypack
