let factories = {}

// 模块名字， 依赖， 工厂函数
function define(moduleName, dependencies, factory) {
  factory.dependencies = dependencies
  factories[moduleName] = factory
}

function require(modules, callback) {
  let result = modules.map((moduleName) => {
    let factory = factories[moduleName]
    let dependencies = factory.dependencies
    let exports
    require(dependencies, function() {
      // 把当前模块的依赖的执行结果传递给当前模块的回调函数，有几个依赖就有几个参数（arguments）
      exports = factory.apply(null, arguments)
    })
    return exports
  })
  callback.apply(null, result)
}

define('name', [], function() {
  return '啦啦啦'
})

define('sex', [], function(name) {
  return '男'
})

define('age', ['name', 'sex'], function(name, sex) {
  return name + sex + '10'
})

require(['name', 'age'], function(name, age) {
  console.log(name, age)
})