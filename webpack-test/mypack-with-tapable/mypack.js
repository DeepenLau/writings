const path = require('path')
const Compiler = require('./Compiler')
const OptionsApply = require('./OptionsApply')

const defaultOptions = {
  entry: './src/index.js',
  output: path.join(process.cwd(), 'dist'),
  context: process.cwd()
}

const mypack = (options, callback) => {
  options = { ...defaultOptions, ...options }

  let compiler = new Compiler(options.context)
  compiler.options = options

  compiler.options = new OptionsApply().process(options, compiler)

  compiler.run(callback)

  return compiler
}

module.exports = mypack


/**

const mypack = require('./mypack-with-tapable')

compiler = mypack({})

compiler.run((err) => {

})

*/