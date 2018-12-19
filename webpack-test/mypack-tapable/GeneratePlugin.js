const fs = require('fs')
const path = require('path')

class GeneratePlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('GeneratePlugin', (compilation) => {
      const options = compilation.compiler.options

      fs.readdir(options.output, err => {
        if (err) {
          fs.mkdirSync(options.output)
        }
      })

      fs.writeFileSync(path.join(options.output, compilation.name + '.js'), compilation.assets)
    })
  }
}

module.exports = GeneratePlugin