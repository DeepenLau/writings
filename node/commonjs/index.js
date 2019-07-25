let fs = require('fs')
let path = require('path')
let vm = require('vm')
class Module {
  constructor (absPathname) {
    this.id = absPathname
    this.exports = {}
  }
}

Module.wrapper = [
  "(function(exports, module, require, __dirname, __filename){",
  "\n})"
]

Module._extensions = {
  '.js'(module) {
    let script = fs.readFileSync(module.id, 'utf8')
    let fnStr = Module.wrapper[0] + script + Module.wrapper[1]
    fn = vm.runInThisContext(fnStr)
    fn.call(module.exports, module.exports, module, req)
  },
  '.json'(module) {
    let json = fs.readFileSync(module.id, 'utf8')
    return module.exports = json
  }
}

Module._cache = {}

function tryModuleLoad (module) {
  // 获取后缀名
  let extension = path.extname(module.id)
  // 调用对应后缀名的模块方法
  Module._extensions[extension](module)
}

function req (modulePath) {
  // 获取当前模块的绝对路径
  let absPathname  = path.resolve(__dirname, modulePath)

  let extNames = Object.keys(Module._extensions)
  let oldAbsPathname = absPathname
  let index = 0
  function find(absPathname) {
    if (index >= extNames.length) {
      return absPathname
    }
    try {
      fs.accessSync(absPathname)
      return absPathname
    } catch (e) {
      // 取不到就拼接
      let ext = extNames[index++]
      let newPath = oldAbsPathname + ext
      return find(newPath)
    }
  }

  absPathname = find(absPathname)

  try {
    fs.accessSync(absPathname)
  } catch (e) {
    throw Error('找不到文件')
  }


  // 判断模块是否已经缓存
  if (Module._cache[absPathname]) {
    return Module._cache[absPathname].exports
  }
  // 创建模块
  let module = new Module(absPathname)
  // 尝试加载当前模块
  tryModuleLoad(module)
  // 缓存当前模块
  Module._cache[absPathname] = module
  // 默认返回 module.exports
  return module.exports
}
// let a = req('./a.json')
console.log(req('./a'))
// console.log(b)

// module.exports 和 exports 的区别
// module.exports = exports = {}
// module.exports 和 exports 引用的是同一个空间，但是 commonjs 模块默认导出的是 module.exports