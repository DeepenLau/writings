const SingleEntryPlugin = require('./SingleEntryPlugin')

class EntryOptionPlugin {
  apply(compiler) {
    compiler.hooks.entryOption.tap('EntryOptionPlugin', (context, entry) => {
      new SingleEntryPlugin(context, entry, 'main').apply(compiler)
      return true
    })
  }
}

module.exports = EntryOptionPlugin
