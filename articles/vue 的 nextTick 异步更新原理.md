---
title: Vue 的 nextTick 异步更新原理
date: 2019-01-18 17:51:44
tag: javascript vue
desc: 学习一下 Vue 的异步更新 dom 的策略
---

# Vue 的 nextTick 异步更新原理

> 学习一下 Vue 的异步更新 dom 的策略

## 用法

用过 Vue 的应该基本都知道 `Vue.nextTick()` 的用法
这里直接上[官方文档](https://cn.vuejs.org/v2/api/#Vue-nextTick)

Vue.nextTick( [callback, context] )

- 参数：
  - {Function} [callback]
  - {Object} [context]

- 用法：
  在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
  ```js
  // 修改数据
  vm.msg = 'Hello'
  // DOM 还没有更新
  Vue.nextTick(function () {
    // DOM 更新了
  })

  // 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
  Vue.nextTick()
    .then(function () {
      // DOM 更新了
    })
  ```
  > 2.1.0 起新增：如果没有提供回调且在支持 Promise 的环境中，则返回一个 Promise。请注意 Vue 不自带 Promise 的 polyfill，所以如果你的目标浏览器不原生支持 Promise (IE：你们都看我干嘛)，你得自己提供 polyfill。

## 开始

我们先来实现一个简单的**数据劫持**加**发布订阅**的迷你框架

首先我们先来劫持一下数据，这里用的是 `Object.defineProperty`

```js
// index.js
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
    Object.defineProperty(data, key, {
      get() {
        return value
      },
      set(val) {
        if (value === val) return
        value = val
      }
    })
  })
}

defineReactive(data)
```

添加一个**发布订阅类**
```js
// Dep.js
export default class Dep {
  constructor() {
    this.subs = []
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}
```
`Dep` 相对简单，`addSub` 方法用于在获取属性的时候，收集各个订阅者 `watcher` 实例
`notify` 方法用于通知该属性下的所有的订阅者 `watcher` 实例更新

接下来把 `Dep` 导入 `index.js` 使用
```js
// index.js
import Dep from './Dep.js'

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

defineReactive(data)
```

接下来定义一下 `Watcher` 类

```js
// Watcher.js
import Dep from './Dep.js'

let uid = 0

export default class Watcher {
  constructor(data, key) {
    Dep.target = this
    this.id = ++uid
    this.data = data
    this.value = data[key]
    this.key = key
    // 为了确保每个属性有自己独立的 Watcher ，需要把上一个 this 解绑
    Dep.target = null
  }

  update() {
    console.log(`watcher ${this.key} update id ${this.id}`)
    this.run()
  }

  run() {
    console.log(`更新 watcher id = ${this.id} 的 ${this.key} 属性到 dom 最新的值: ${this.data[this.key]}`)
  }
}
```
`update` 方法用来更新值，而 `run` 方法则用来更新 dom

修改一下 `index.js` 来看浏览器控制台打印的结果
```js
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
}

defineReactive(data)
compile(data)

data.foo = 'new foo1'
data.foo = 'new foo2'

```

在 `.html` 文件引入
```html
<script type="module" src="./index.js"></script>
```

输出
```
watcher foo update id:1 当前 update 的值是：new foo1
更新 watcher id = 1 的 foo 属性到 dom 最新的值: new foo1
watcher foo update id:1 当前 update 的值是：new foo2
更新 watcher id = 1 的 foo 属性到 dom 最新的值: new foo2
```

结果是在连续修改 `data.foo` 的值的时候，每一次都会走 `run` 方法去更新 dom

现在假设我们有一个点击事件，触发之后，有某一个值会被连续修改1000次，比如这样：
```js
function handleClick() {
  for (let i = 0; i < 1000; i++) {
    data.number++
  }
}
```
那么就会触发 dom 修改 1000 次，性能问题可想而知

那能不能解决呢？答案是肯定的

其实在上面的例子中，我们连续操作一千次，最终需要在 dom 上展示出来的其实也就只有左右一次而已
所以我们可以先把对应的 `watcher` 实例放到一个队列里面，等到下一个 `tick` 的时候再把队列里面的
实例全部拿出来触发 `run` 一遍，而这个队列里面，相同 id 的 `watcher` 实例只放入一个，所以最终
一个 `watcher` 只会更新一次 dom

那么什么是下一个 `tick` 呢？

## nextTick

当我们使用 `Vue` 提供的接口去更新数据的时候，这个更新不会立即生效，而是会被推入到一个队列里，
待到适当的时机，队列中的更新任务会被批量触发，而这个时机就是 `nextTick`。以此实现异步更新

但是这个 `nextTick` 具体是哪个时机呢？

根据 `Event Loop` 的机制，我们可以知道，每一次的循环都是这样的过程：

将**一个** `macro-task` 执行并出队 --> 将**一队** `micro-task` 执行并出队 --> 执行渲染操作，更新界面 --> 处理 `worker` 相关任务

我们先假设他是一个 `macro-task` ，比如在 `script` 脚本中用 `setTimeout` 处理：
```js
// task 是一个修改的操作函数
setTimeout(task, 0)
```

现在 `task` 被推入的是 `macro-task` 队列，但是因为 `script` 脚本本身是一个 `macro-task` ，所以本次执行完 `script` 脚本之后，下一步是去执行 `micro-task` 队列，接着就是去执行一次渲染页面，最后走下一轮循环。

可以发现，这一轮循环中，`task` 任务并没有被执行，而是需要等到下一轮循环才会被执行，
也就是说，在执行 `script` 脚本的这一轮循环中，白白浪费了一次渲染

那现在我们试试 `micro-task`，用 `Promise` 进行包装
```js
Promise.resolve().then((res) => task())
```
这样的话，我们就可以在结束 `script` 脚本之后就马上处理 `micro-task` 队列，
在 `task` 函数中修改好了 dom，接着就可以直接走渲染流程，不用等到下一轮循环，
所以没有浪费这一次渲染时机。

因此，我们把更新 dom 的时间点，应该尽可能靠近渲染的时机，也就是在 `micro-task` 中

当然了，由于存在设备的差异性，我们也不可能时时刻刻都保证使用 `micro-task` 队列，
所以在 Vue 中也是根据情况判断使用哪种队列的。

那些接下来我们先用 `setTimeout` 进行模拟

```js
// next-tick.js
let callbacks = []
let pending = false

export default function nextTick(cb) {
  callbacks.push(cb)

  if (!pending) {
    pending = true
    setTimeout(flushCallbacks, 0)
  }
}

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
```

nextTick 函数把传进来的回调放到一个队列里，用 pending 做一个标记位
flushCallbacks 函数就是把之前存到 callbacks 里面的函数复制一下，然后全部调用一次

那么怎么用呢？

我们需要在调用 `watcher` 实例 `update` 的时候，把实例存到一个叫**渲染队列**的地方，
而不是 `update` 之后马上 `run`。而且同一个 `id` 的 `watcher` 只能存进一个，
这样同一个属性的多次修改也只会提交最新的值给到 dom

```js
// Watcher.js
import Dep from './Dep.js'
import nextTick from './next-tick.js'

let has = {}
let queue = []
let waiting = false

export function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    has[id] = true
    queue.push(watcher)
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

function flushSchedulerQueue() {

  queue.forEach(watcher => {
    has[watcher.id] = null
    watcher.run()
  })

  waiting = false
}

let uid = 0

export default class Watcher {
  constructor(data, key) {
    Dep.target = this
    this.id = ++uid
    this.data = data
    this.value = data[key]
    this.key = key
    // 为了确保每个属性有自己独立的 Watcher ，需要把上一个 this 解绑
    Dep.target = null
  }

  update() {
    console.log(`watcher ${this.key} update id ${this.id}`)
    queueWatcher(this)
  }

  run() {
    console.log(`更新 watcher id = ${this.id} 的 ${this.key} 属性到 dom 最新的值: ${this.data[this.key]}`)
  }
}
```

`waiting` 会等待当前队列清空完了，再走下一次的 `tick`
这里用 `has[id] = true` 的形式来保存已经存在 `watcher` `id` 会比遍历数组高效
`queueWatcher` 就是用来存去重后的 `watcher` 实例
`flushSchedulerQueue` 是传给 `nextTick` 存到 `callbacks` 的函数
最终在 `flushCallbacks` 中，执行 `callbacks` 里的所有 `flushSchedulerQueue` 函数，
也就是执行所有在**渲染队列**中 `watcher` 的更新 dom 的方法

因为 `nextTick` 是开放出去的 `api`，所有 `watcher` 中的 `flushSchedulerQueue` 就是 `nextTick(cb)` 的 `cb` 回调函数
比如
```js
Vue.nextTick(() => {
  // 用户自己的操作
  // 这个回调函数也是一个 类似 watcher 实例的 flushSchedulerQueue 函数
})
```

现在我们就可以测试一下了，再次回到浏览器刷新
```
watcher foo update id:1 当前 update 的值是：new foo1
watcher foo update id:1 当前 update 的值是：new foo2
更新 watcher id = 1 的 foo 属性到 dom 最新的值: new foo2
```

可以看到，我们执行两次 `data.foo` 的值修改，走了两次 `update` 方法，但只走了一次 `run` 方法，
并且直接获取到最后一次的赋值 `new foo2`，符合预期。

搞定！