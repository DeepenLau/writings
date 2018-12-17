const fs = require('fs')

// 模拟 commonjs
function req(moduleName) {
  let content = fs.readFileSync(moduleName, 'utf8')

  /*
    function (exports, module, require, __dirname, __filename) {
      module.export = '其他模块的内容' // 上面的 content
      return module.exports
    }
  */
  let fn = new Function('exports', 'module', 'require', '__dirname', '__filename', content + '\n return module.exports')

  let module = {
    exports: {}
  }
  return fn(module.exports, module, req, __dirname, __filename)
}

let str = req('./b.js')
console.log(str)

