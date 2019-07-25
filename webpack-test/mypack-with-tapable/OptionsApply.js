const SingleEntryPlugin = require('./SingleEntryPlugin')

class OptionsApply {
  constructor() {}

  process(options, compiler) {
    // 挂载插件的地方
    new SingleEntryPlugin(options).apply(compiler)
    return options
  }
}

module.exports = OptionsApply