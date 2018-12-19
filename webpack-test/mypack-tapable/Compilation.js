const {
	Tapable,
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	AsyncSeriesHook
} = require("tapable")
const fs = require('fs')
const path = require('path')
const Template = require('./Template')

class Compilation extends Tapable {
  constructor(compiler) {
    super()
    this.hooks = {
      addEntry: new SyncHook(["entry", "name"]),
      finishModules: new SyncHook(["modules"]),
      seal: new SyncHook([]),
      buildModule: new SyncHook(["module"]),
			afterSeal: new AsyncSeriesHook([])
    }
    this.name = undefined
    this.template = new Template(compiler)
    this.modules = []
    this.compiler = compiler
  }

  finish() {
    console.log('模块构建 完成')
    const modules = this.modules
		this.hooks.finishModules.call(modules)
  }

  createModuleAssets() {
    console.log('把模块拼接模板')
    this.assets = this.template.render(this.modules)
    // console.log(this.assets)
    // 开始输出了
  }

  seal(callback) {
    console.log('开始封装，开始执行各种优化钩子，这里省略')
    this.hooks.seal.call()
    this.createModuleAssets()
    return callback()
  }

  addEntry(context, entry, name, callback){
    // TODO 添加模块依赖
    console.log('分析入口，构建模块依赖关系')
    this.hooks.addEntry.call(entry, name)
    this.name = name
    this._addModuleChain(context, entry, (module) => {
      this.modules.push(module)
    }, () => {
      console.log('分析完入口文件的所有模块了')
      return callback()
    })
  }

  _addModuleChain(context, dependency, onModule, callback) {
    let source = fs.readFileSync(path.join(context, dependency), 'utf8')

    function parseModules(source) {
      return source.replace(/require\(['"](.*?)['"]\)/g, function (...args) {
        let name = './' + path.join('./src', args[1])
        let content = fs.readFileSync(name, 'utf8')

        content = parseModules(content)

        onModule({ id: name, content })
        return `__mypack_require__('${name}')`
      })
    }

    source = parseModules(source)

    onModule({ id: dependency, content: source })

    callback()
  }
}

module.exports = Compilation