import Dep from './Dep.js'
import Watcher from './Watcher.js'

const data = {
  foo: 'foo',
  bar: 'bar'
}

function defineReactive(data) {

  Object.keys(data).forEach(key => {
    let value = data[key]
    if (typeof value !== null && typeof value === 'object') {
      return defineReactive(data[key])
    }
    const dep = new Dep()
    Object.defineProperty(data, key, {
      get() {
        // Dep.target 在 Watcher 类中定义，用来传递当前 watcher 实例
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(val) {
        if (value === val) return
        value = val
        dep.notify()
      }
    })
  })
}

function compile(data) {
  // 假装编译了模板
  // 有一个地方绑定了 foo
  new Watcher(data, 'foo')
  new Watcher(data, 'foo')
  new Watcher(data, 'bar')
}

defineReactive(data)
compile(data)

data.foo = 'new foo1'
data.foo = 'new foo2'
data.bar = 'new bar1'
