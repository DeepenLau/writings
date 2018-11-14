---
title: 实现一个简易的带 virtual dom 的 mvvm 框架 (一)
date: 2018-10-28 11:30:54
tag: mvvm vdom
desc: 先实现一个不带 virtual dom 的 mvvm
---

# 实现一个简易的带 virtual dom 的 mvvm 框架 (一)

> 废话少说，开干

## 先实现一个不带 virtual dom 的 mvvm 

参考在 github 上比较多 star 的仓库

[GitHub - DMQ/mvvm: 剖析vue实现原理，自己动手实现mvvm](https://github.com/DMQ/mvvm)

参考这个仓库，去掉一些判断，尽量只保留最核心的代码

### 简单分析

![20181011095233.png](http://blog-deepen-static.oss-cn-shenzhen.aliyuncs.com/img/20181011095233.png)

从这张图可以看出整个 `Mvvm` 其实就分为三个部分
一个是 `Observer` 用来劫持数据
一个是 `Compile` 用来编译模板
一个是 `Watcher` 通过发布订阅模式来关联`Observer` 和 `Compile` 

## 从最简单的 html 开始

```html
<div id="app">
  {{ foo }}
</div>

<script type="module" src="./index.js"></script>
```

```js
// index.js

import Mvvm from './Mvvm.js'

let vm = new Mvvm({
  el: '#app',
  data: {
    foo: 'bar'
  }
})

window.vm = vm // 方便在控制台直接打印测试
```

```js
// Mvvm.js

import Compile from './Compile.js'
import Observer from './Observer.js'

export default class Mvvm {
  constructor (options) {
    this.$el = options.el
    this.$data = options.data

    // 数据劫持
    new Observer(this.$data)
    // 编译模板
    new Compile(this.$el, this)
  }
}
```

## 实现数据劫持 `Observer.js`

```js
export default class Observer {
  constructor (data) {
    this.observe(data)
  }

  observe (data) {
    if (!data || typeof data !== 'object') {
      return
    }
    
    Object.keys(data).forEach(key => {
      // 通过遍历 data 的属性，使用 Object.defineProperty 劫持
      this.defineReactive(data, key, data[key])
      // 深度劫持
      this.observe(data[key])
    })
  }

  defineReactive (data, key, value) {
    Object.defineProperty(data, key, {
      enmerable: true,
      configurable: true,
      get () {
        return value
      },
      set (newValue) {
        if (value === newValue) return
        value = newValue
      }
    })
  }
}
```

这样一个简单的`Observer.js`就完成了

## 实现数据模板编译 `Compile.js`


```js
import { TEXT_REG } from './constant.js'
import { getTextValue } from './util.js'

export default class Compile {
  constructor (el, vm) {
    this.el = document.querySelector(el)
    this.vm = vm

    if (this.el) {
      // 1.把节点移入文档片段，在内存中操作
      let fragment = this.node2Fragment(this.el)
      // 2.开始编译
      this.compile(fragment)
      // 3.编译完的文档片段 替换掉原来的 el 节点
      this.el.parentNode.replaceChild(fragment, this.el)
    }
  }

  isElementNode(node) {
    // 判断为元素节点
    return node.nodeType === 1
  }

  compile (fragment) {
    let childNodes = fragment.childNodes
    // Array.isArray(childNodes) => false，是类数组

    Array.from(childNodes).forEach(childNode => {
      // 判断每个节点的类型
      if (this.isElementNode(childNode)) {
        // 元素节点，编译元素
        this.compileElement(childNode)
      } else {
        // 文本节点，编译文本
        this.compileText(childNode)
      }
    })
  }

  compileElement (node) {
    // 本例只做 {{ foo }} 的文本节点处理，保留编译流程的大致思路
  }

  compileText (node) {
    let expr = node.textContent // 获取文本内容

    if (TEXT_REG.test(expr)) {
      // vue 文档
      // <span v-text="msg"></span>
      // <!-- 和下面的一样 -->
      // <span>{{msg}}</span>
      // v-text 指令
      callDirective('text', node, this.vm, expr)
    }
  }

  node2Fragment (el) {
    let cloneEl = el.cloneNode(true)
    let fragment = document.createDocumentFragment()
    fragment.appendChild(cloneEl)
    return fragment
  }
}

function callDirective(directive, node, vm, expr) {
  util[directive](node, vm, expr)
}

const util = {
  'text' (node, vm, expr) {
    node.textContent = getTextValue(vm, expr)
  }
}
```

模板的编译分三步走

1. 把节点移入文档片段`(document.createDocumentFragment)`，在内存中操作，性能比直接操作 dom 高
2. 开始编译，这里目前只分**元素节点**和**文本节点**
3. 编译完的文档片段 替换掉原来的 el 节点

> 由于文本节点也是走指令的编译方式，所以其实也就是调用 `v-text` 的编译

补充辅助方法

```js
// constant.js (常量)
export const TEXT_REG = /\{\{([^}]+)\}\}/g // 匹配 {{}} 的内容
```
```js
// util.js
import { TEXT_REG } from './constant.js'

export function getValue(vm, expr) {
  expr = expr.split('.') // [a,b,c]
  return expr.reduce((prev, next) => {
    return prev[next]
  }, vm.$data)
}

// 正则匹配 {{ }} 文本节点里面的值
export function getTextValue(vm, expr) {
  // @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace
  // `{{ foo }} {{ aaa }}` => `bar aa`
  return expr.replace(TEXT_REG, (...args) => {
    let key = args[1].trim()
    return vm.$data[key]
  })
}
```

到这里已经完成了 **数据劫持(Observer.js)** 和 **模板编译(Compile.js)**

下面实现 `Watcher` 来作为订阅者

## 实现 订阅者（也叫观察者）`Watcher.js`

```js
import { getTextValue } from './util.js'

// 观察者是给需要变化的**元素**增加观察者
// 新值和老值进行对比，发生变化就调用更新方法
// 在模板编译的时候调用
export default class Watcher {
  constructor (vm, expr, cb) {
    this.vm = vm
    this.expr = expr // 表达式 {{ foo }}
    this.cb = cb // 给外面用的回调函数

    // 先获取缓存一下老值
    this.value = this.get()
  }

  // 获取 data 里面响应的值
  get () {
    let value = getTextValue(this.vm, this.expr)
    return value
  }

  // update 方式是给 data 属性更新值的时候调用，也就是在 setter 里面
  update () {
    // 值已经改变之后，还没有更新到 dom
    let newValue = getTextValue(this.vm, this.expr)
    let oldValue = this.value
    // 新老指对比，不一样则调用 callback 把 newValue 传出去给调用指令的时候更新视图
    if (newValue != oldValue) {
      this.cb(newValue)
    }
  }
}
```

现在 `Watcher` 也完成了，注释里面写了 在模板编译的时候调用

也就是在编译`text`指令的时候调用

```js
// Observer.js

...

const util = {
  'text' (node, vm, expr) {
    // 给每一个 data 属性都加了一个 watcher 实例
    new Watcher(vm, expr, (newValue) => {
      // 数据有变化并且调用了 update 方法之后才会走到这个回调
      node.textContent = newValue
    })
    node.textContent = getTextValue(vm, expr)
  }
}

```

到这里的问题是，在哪里调用每个 `watcher` 实例的 `update` 方法？

答案就是在赋值的时候，也就是在劫持的 setter 里面

那为什么不在上面的指令方法赋值的时候呢？

那是因为目前只有一个指令，以后多个指令的话，就可能会有很多个赋值的地方，可能会散落在各个地方

但是无论在哪里复制，都会走 `setter` ，所以只需在在这里完成赋值之后调用 `update`方法 就可以了

现在问题又来了：如果有多个地方都绑定了同一个属性，怎么一个数据更新就触发所有地方都更新视图呢？

这里就需要一个发布订阅模式，先收集每个属性的所有订阅者(`watcher`实例，因为`watcher`实例，里面才有`update`方法)，然后在 `setter` 的时候通知所有的`watcher`实例去调用自己的`update`方法

```js
// Observer.js
export default class Observer {
  constructor (data) {
    this.observe(data)
  }

  observe (data) {
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive (data, key, value) {
    // 每个属性都有一个发布订阅实例，有自己的订阅者(watcher实例)数组
    const dep = new Dep()
    Object.defineProperty(data, key, {
      enmerable: true,
      configurable: true,
      get () {
        return value
      },
      set (newValue) {
        if (value === newValue) return
        value = newValue
        // 通知所有订阅者更新
        dep.notify()
      }
    })
  }
}

/**
 * 发布订阅
 * 用来收集订阅者，数据变动触发notify，再调用订阅者的update方法
 */
export class Dep {
  constructor () {
    // 订阅者的数组
    this.subs = []
  }

  addSub (watcher) {
    // 添加订阅者
    this.subs.push(watcher)
  }

  notify () {
    this.subs.forEach(watcher => watcher.update() )
  }
}
```

现在又有一个新问题，在什么时候给属性添加订阅者呢？
订阅者又要是当前 `watcher` 实例，一个属性可能会对应多个`watcher`实例
其实就是在编译模板的时候，拿绑定在模板的 `key` 去获取 `data` 上的 `value` 的时候添加订阅者
所以只要在取值的时候添加订阅者就可以了，也就是在 `getter` 的时候获取

```js
// Observer.js
...

defineReactive (data, key, value) {
  const dep = new Dep()
  Object.defineProperty(data, key, {
    enmerable: true,
    configurable: true,
    get () {
      // 现在在这里无法获取到 watcher 实例
      dep.addSub(watcher)
      return value
    },
    set (newValue) {
      if (value === newValue) return
      value = newValue
      dep.notify()
    }
  })
}

...
```

现在又有一个问题，如何传递 `watcher` 实例到 `getter` 里面呢？

在这里需要一个类似全局变量做跳板

可以在 `Watcher`类 里面定义一个 发布订阅`(Dep)`类 `target` 的静态属性，指向当前的 `watcher`实例

```js
// Watcher.js

import { getTextValue } from './util.js'
import { Dep } from './Observer.js'

// 观察者是给需要变化的**元素**增加观察者
// 新值和老值进行对比，发生变化就调用更新方法
// 在模板编译的时候调用
export default class Watcher {
  constructor (vm, expr, cb) {
    this.vm = vm
    this.expr = expr // 表达式 {{ foo }}
    this.cb = cb // 给外面用的回调函数

    // 先获取老值
    this.value = this.get()
  }

  get () {
    // 这里绑定当前的实例
    Dep.target = this
    let value = getTextValue(this.vm, this.expr)
    // 添加完到订阅数组之后，解绑，避免重复添加 watcher
    Dep.target = null
    return value
  }

  update () {
    let newValue = getTextValue(this.vm, this.expr)
    let oldValue = this.value
    if (newValue != oldValue) {
      this.cb(newValue)
    }
  }
}
```

当 `new Watcher()` 的时候，会调用实例方法 `get`, 然后就会这个方法里面去 `vm.$data` 里面获取了一次属性的值，所以会触发该属性的 `getter`, 这时候就可以在 `getter` 取 `Dep.target` 这个静态属性值，也就是当前 `watcher` 实例

```js
// Observer.js

export default class Observer {
  constructor (data) {
    this.observe(data)
  }

  observe (data) {
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive (data, key, value) {
    const dep = new Dep()
    Object.defineProperty(data, key, {
      enmerable: true,
      configurable: true,
      get () {
        // Dep.target 不为 null 才添加到订阅数组
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set (newValue) {
        if (value === newValue) return
        value = newValue
        dep.notify()
      }
    })
  }
}

export class Dep {
  constructor () {
    // 订阅者的数组
    this.subs = []
  }

  addSub (watcher) {
    // 添加订阅者
    this.subs.push(watcher)
  }

  notify () {
    this.subs.forEach(watcher => watcher.update() )
  }
}
```

自此已经完成一个简单的 mvvm 框架

```js
// 测试一下
// index.js

import Mvvm from './Mvvm.js'

let vm = new Mvvm({
  el: '#app',
  data: {
    foo: 'bar'
  }
})

// 2s 后修改 foo 的值
setTimeout(() => {
  vm.$data.foo = 'new bar'
}, 2000)
```
效果如下

![20181011144739.gif](http://blog-deepen-static.oss-cn-shenzhen.aliyuncs.com/img/20181011144739.gif)

# 补充

本例为了然后核心流程更加清晰直观而去除了一些判断，和一些必须要做操作，比如属性的类型判断，data属性代理到 vm 实例上等等
这些东西可以后续逐步完善的时候加上
比如实现 v-model 指令的双向绑定，事件的鉴定等等