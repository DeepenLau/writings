const EntryOptionPlugin = require('./EntryOptionPlugin')
const GeneratePlugin = require('./GeneratePlugin')
class WebpackOptionsApply {
  constructor() {}
  process(options, compiler) {
    new EntryOptionPlugin().apply(compiler)
    compiler.hooks.entryOption.call(options.context, options.entry)

    new GeneratePlugin().apply(compiler)
    return options
  }
}

module.exports = WebpackOptionsApply