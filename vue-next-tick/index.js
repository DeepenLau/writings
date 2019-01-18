import Watcher from './Watcher.js'
import Dep from './Dep.js'

const data = {
  foo: 'foo',
  bar: 'bar'
}


function defineReactive(data) {
  for (let key in data) {
    let value = data[key]

    if (typeof value !== null && typeof value === 'object') {
      return defineReactive(data[key])
    }
    const dep = new Dep()
    Object.defineProperty(data, key, {
      get() {
        dep.addSub(Dep.target)
        return value
      },
      set(val) {
        if (value === val) return
        value = val
        dep.notify()
      }
    })
  }
}

function compile(data) {
  // 假装编译了模板
  // 有两个地方绑定了 foo
  new Watcher(data, 'foo')
  // new Watcher(data, 'foo')
  // 有一个地方绑定 bar
  new Watcher(data, 'bar')
}

defineReactive(data)
compile(data)

data.foo = 'foo1'
data.foo = 'foo2'
data.foo = 'foo3'
data.bar = 'bar1'

