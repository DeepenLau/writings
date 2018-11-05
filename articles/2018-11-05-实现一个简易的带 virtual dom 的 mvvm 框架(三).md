---
title: 实现一个简易的带 virtual dom 的 mvvm 框架 (三)
date: 2018-11-05 11:30:54
tag: mvvm vdom
desc: 结合前面两篇，组合成一个带 virtual dom 的 mvvm
---

# 实现一个简易的带 virtual dom 的 mvvm 框架 (三)

> 有了前两篇的是的基础之后，下面就是开始二者结合起来
> 我们拷贝一份基于第一篇的代码过来，进行改造

## 分析流程

1. 编译模板的转成抽象语法树（ast）
2. 把 ast 转成 vdom
3. 新旧 vdom 进行 diff 得出 patches 补丁包
4. 给真实 dom 打上 patches 补丁包，更新视图

其中第一点编译模板的部分，在`Vue`源码里面的编译器其实是相当复杂的
因为是纯字符串的编译，除了需要提起需要东西，还要保持与浏览器一样的行为
在这里就尽量简化

## 改造 Compile.js

```js
// Compile.js

import { parse } from './parser/index.js'

export default class Compile {
  constructor(el, vm) {
    this.el = document.querySelector(el)
    this.vm = vm

    if (this.el) {
      // 1.把节点移入文档片段，在内存中操作
      let fragment = this.node2Fragment(this.el)
      // 2.开始编译
      let ast = parse(fragment.firstChild)

      // this.compile(fragment)
      // 3.编译完的文档片段 替换掉原来的 el 节点
      // this.el.parentNode.replaceChild(dom, this.el)
    }
  }

  node2Fragment(el) {
    let cloneEl = el.cloneNode(true)
    let fragment = document.createDocumentFragment()
    fragment.appendChild(cloneEl)
    return fragment
  }
}
```

这里我们部分改造了这个编译器，暂时的目标是在词法分析的基础上做句法分析从而生成一棵 AST

下面来看`parse`函数

```js
import { parseHTML } from './html-parser.js'

/**
 * 这个是要生成 AST 元素节点的函数，返回的是一个对象
 */
export function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: []
  }
}

export function parse(node) {
  // 存放父级的栈
  const stack = []
  // 最终的 AST
  let root
  // 当前父级
  let currentParent

  parseHTML(node, {
    end() {
      // 用来回退上一个父级
      stack.length -= 1
      currentParent = stack[stack.length - 1]
    },
    compileElement(tag, attrs) {
      // 遇到元素节点的时候
      let element = createASTElement(tag.toLowerCase(), attrs, currentParent)
      if (!root) {
        root = element
      }

      if (currentParent) {
        currentParent.children.push(element)
        element.parent = currentParent
      }

      currentParent = element
      stack.push(element)
    },

    compileText(text) {
      // 遇到文本节点的时候
      const children = currentParent.children
      children.push({
        type: 3,
        text
      })
    }
  })

  return root
}

// 把属性类数组转成对象形式
function makeAttrsMap(attrs) {
  let attrsMap = {}
  Array.from(attrs).forEach(attr => {
    attrsMap[attr.name] = attr.value
  })
  return attrsMap
}
```

这里`parse`函数的基本结构，后面我们慢慢往这里面加代码

主要就是通过调用`parseHTML`函数，一边解析标签一边返回所需要的信息来一步一步构建`AST`

下面来看`parseHTML`函数

```js
export function parseHTML(node, options) {
  // 目前只简单处理元素节点和文本节点
  // https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
  switch (node.nodeType) {
    case 1:
      options.compileElement(node.tagName.toLowerCase(), node.attributes, false)

      let childNodes = Array.from(node.childNodes)

      if (!childNodes.length) {
        // 子节点列表数组为空直接回退上一级父节点
        options.end()
      }

      childNodes.forEach((child, index) => {
        parseHTML(child, options)
        if (childNodes.length - 1 === index) {
          // 子节点个数遍历到最后一个调用 end 方法去回退 currentParent
          options.end()
        }
      })
      break
    case 3:
      options.compileText(node.textContent)
      break
    default:
      break
  }
}
```

在`Vue`里面编译模板用的纯字符串模板编译，过程是相当复杂的
有兴趣了解的可以看这里，解释得很完整了，推荐精读
[Vue 技术内幕 \| Vue 的编译器初探](http://hcysun.me/vue-design/art/80vue-compiler-start.html)

在这里我们用`dom`节点，简化流程操作

到这里我们就成功构建了`AST`

## 生成`virtual dom`

再改一下`Compile`的代码

```js
// Compile.js

import { parse } from './parser/index.js'
import { createVirtualDom } from './vdom/index.js'

export default class Compile {
  constructor(el, vm) {
    this.el = document.querySelector(el)
    this.vm = vm

    if (this.el) {
      // 1.把节点移入文档片段，在内存中操作
      let fragment = this.node2Fragment(this.el)
      // 2.开始编译
      let ast = parse(fragment.firstChild)

      let vdom = createVirtualDom(vm, ast)

      // this.compile(fragment)
      // 3.编译完的文档片段 替换掉原来的 el 节点
      // this.el.parentNode.replaceChild(dom, this.el)
    }
  }

  node2Fragment(el) {
    let cloneEl = el.cloneNode(true)
    let fragment = document.createDocumentFragment()
    fragment.appendChild(cloneEl)
    return fragment
  }
}
```

上面的部分主要是加了这句 `let vdom = createVirtualDom(vm, ast)`

下面来看看这个`createVirtualDom`函数

```js
// vdom/index.js

import { createElementVNode, createTextVNode } from './vnode.js'

export function createVirtualDom(vm, ast) {
  let root
  let vnode = createElementVNode(ast.tag, { ...ast.attrsMap }, [])
  if (!ast.parent) {
    root = vnode
  }

  if (ast.children && ast.children.length) {
    createChildVNode(vm, ast.children, vnode)
  }
  return root
}

function createChildVNode(vm, astChildren, parentVnode) {
  astChildren.forEach(astChild => {
    let vnode
    if (astChild.type === 1) {
      vnode = createElementVNode(astChild.tag, { ...astChild.attrsMap }, [])
    } else {
      vnode = createTextVNode(astChild.text)
    }

    parentVnode.children.push(vnode)

    if (astChild.children && astChild.children.length) {
      // 有子节点就递归
      createChildVNode(vm, astChild.children, vnode)
    }
  })
}
```

流程就是遍历`AST`，生成 `vdom`

关于`VNode`和上一篇写的一样

稍作修改

```js
// vdom/vnode.js

import { TEXT_REG } from '../constant.js'

export class VNode {
  constructor(type, tag, props, exp, text, children) {
    this.type = type
    this.tag = tag
    this.props = props
    this.attrs = {} // 存放经过编译取值之后的属性，便于 diff 的时候比较
    this.exp = exp
    this.text = text
    this.children = children
  }
}

export function createElementVNode(tag, props, children) {
  return new VNode(1, tag, props, undefined, undefined, children)
}

export function createTextVNode(text) {
  // 修正 lastIndex
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex
  TEXT_REG.lastIndex = 0
  if (TEXT_REG.test(text)) {
    // 含有 {{ }} 表达式的
    let exp = text
    return new VNode(3, undefined, undefined, exp, undefined, undefined)
  }
  return new VNode(3, undefined, undefined, undefined, text, undefined)
}
```

到这里我们就得到了“虚拟 dom”

```
VNode {type: 1, tag: "div", props: {…}, exp: undefined, text: undefined, …}
  children: Array(5)
    0: VNode {type: 3, tag: undefined, props: undefined, exp: undefined, text: "↵    ", …}
    1: VNode {type: 1, tag: "div", props: {…}, exp: undefined, text: undefined, …}
    2: VNode {type: 3, tag: undefined, props: undefined, exp: undefined, text: "↵    ", …}
    3: VNode {type: 1, tag: "span", props: {…}, exp: undefined, text: undefined, …}
    4: VNode {type: 3, tag: undefined, props: undefined, exp: undefined, text: "↵    {{ foo }}↵  ", …}
    length: 5
    __proto__: Array(0)
  exp: undefined
  props: {id: "app", :class: "foo"}
  tag: "div"
  text: undefined
  type: 1
  __proto__: Object
```

## 把`vdom`渲染到页面

到这里我们要把当前得到的`vdom`转化成真正`dom`的同时把数据绑定上去

```js
// vdom/render.js

import { getTextValue, getValue } from '../util.js'
import { bindRE } from '../constant.js'

export function renderToDom(vm, vnode) {
  let el = document.createElement(vnode.tag)

  for (let key in vnode.props) {
    let bindKey = key.match(bindRE)
    if (bindKey) {
      // 匹配属性上有绑定的值，正则是匹配 : 或者 v-bind
      let domKey = key.split(bindKey[0])[1]
      setAttr(el, domKey, getValue(vm, vnode.props[key]), vnode)
    } else {
      setAttr(el, key, vnode.props[key], vnode)
    }
  }

  vnode.children.forEach(childVnode => {
    let child
    if (childVnode.type === 1) {
      // 元素节点继续递归
      child = renderToDom(vm, childVnode)
    } else if (childVnode.exp) {
      // 文本节点带有表达式，去取值并创建文本节点，更新 vnode 的 text 值
      const text = getTextValue(vm, childVnode.exp)
      child = document.createTextNode(text)
      childVnode.text = text
    } else {
      // 普通文本节点
      child = document.createTextNode(childVnode.text)
    }
    el.appendChild(child)
  })

  return el
}

export function setAttr(node, key, value, vnode) {
  switch (key) {
    case 'value':
      if (
        (node.tagName,
        toUpperCase() === 'INPUT' || node.tagName,
        toUpperCase() === 'TEXTAREA')
      ) {
        node.value = value
      } else {
        node.setAttribute(key, value)
      }
      break
    case 'style':
      node.style.cssText = value
      break
    default:
      node.setAttribute(key, value)
      break
  }
  vnode.attrs[key] = value
}
```

```js
// constant.js

export const TEXT_REG = /\{\{([^}]+)\}\}/g // 匹配 {{}} 的内容

// 匹配以字符 : 或字符串 v-bind: 开头的字符串，主要用来检测一个标签的属性是否是绑定(v-bind)
export const bindRE = /^:|^v-bind:/
```

到通过`renderToDom`函数得到的返回值已经取值并且转化成了真实 dom

之后就是把这个真的 dom 替换掉原来页面上的模板节点

```js
// Complie.js

import { parse } from './simple-parser/index.js'
import { createVirtualDom } from './vdom/index.js'
import { renderToDom } from './vdom/render.js'

export default class Compile {
  constructor(el, vm) {
    this.el = document.querySelector(el)
    this.vm = vm

    if (this.el) {
      // 1.把节点移入文档片段，在内存中操作
      let fragment = this.node2Fragment(this.el)
      // 2.开始编译
      let ast = parse(fragment.firstChild)

      let vdom = createVirtualDom(vm, ast)

      let dom = renderToDom(vm, vdom)

      // 3.编译完的文档片段 替换掉原来的 el 节点
      this.el.parentNode.replaceChild(dom, this.el)
    }
  }

  node2Fragment(el) {
    let cloneEl = el.cloneNode(true)
    let fragment = document.createDocumentFragment()
    fragment.appendChild(cloneEl)
    return fragment
  }
}
```

到这里已经完成了 模板 --> AST --> 虚拟 dom --> 真实 dom --> 页面 的首次渲染过程了

## 添加 Watcher

> 下面开始我们要给有绑定的值添加`Watcher`，也就是把第一篇讲到的`Watcher`结合进来

先来分析一下这时候是在哪个时机添加`Watcher`实例呢？

其实无非就两个地方：

1. 设置有绑定的值的元素节点的时候
2. 文本节点带有表达式的时候

```js
export function renderToDom(vm, vnode) {
  let el = document.createElement(vnode.tag)

  for (let key in vnode.props) {
    let bindKey = key.match(bindRE)
    if (bindKey) {
      // 匹配属性上有绑定的值，正则是匹配 : 或者 v-bind
      let domKey = key.split(bindKey[0])[1]
      setAttr(el, domKey, getValue(vm, vnode.props[key]))

      // 这里加 Watcher
      new Watcher(vm, vnode.props[key], newValue => {
        console.log(newValue)
      })
    } else {
      setAttr(el, key, vnode.props[key])
    }
  }

  vnode.children.forEach(childVnode => {
    let child
    if (childVnode.type === 1) {
      // 元素节点继续递归
      child = renderToDom(vm, childVnode)
    } else if (childVnode.exp) {
      // 文本节点带有表达式，去取值并创建文本节点，更新 vnode 的 text 值
      const text = getTextValue(vm, childVnode.exp)
      child = document.createTextNode(text)
      childVnode.text = text

      // 这里加 Watcher
      new Watcher(vm, childVnode.exp, newValue => {
        console.log(newValue)
      })
    } else {
      // 普通文本节点
      child = document.createTextNode(childVnode.text)
    }
    el.appendChild(child)
  })

  return el
}
```

> 由于`<div :class="foo"></div>`这种形式的绑定值不带`{{ }}`符号的
> 所以`Watcher`里面的取值需要做下兼容，改动最小可以直接修改`getTextValue`函数

```js
// util.js

export function getTextValue(vm, expr) {
  // @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace
  // `{{ foo }} {{ aaa }}` => `bar aa`
  if (TEXT_REG.test(expr)) {
    return expr.replace(TEXT_REG, (...args) => {
      return getValue(vm, args[1].trim())
    })
  }
  return getValue(vm, expr)
}
```

到这里`Watcher`也添加完了

剩下最后一步，也就是处理 Watcher 的回调

其实在这两个回调里面，其实可以直接按照第一篇讲的那样直接修改`dom`节点

```js
// 元素节点
new Watcher(vm, vnode.props[key], newValue => {
  setAttr(el, domKey, newValue)
})
// 文本节点
new Watcher(vm, childVnode.exp, newValue => {
  child.textContent = newValue
})
```

但是这样做的话，我们就没有学习到“虚拟 dom”的流程了
“虚拟 dom”的好处在这里也不用多说，一搜一大堆
下面来走走“虚拟 dom”的流程

现在我们定义虚拟 dom 的更新策略是，当所有订阅者都被调用`update`函数之后，
我们再通过新旧`vdom`的对比，得出补丁包，最后统一更新，也就是走我们第二篇写的流程
而不是在如第一篇所写的那样在`update`函数的回调里面直接更新到 dom

所以现在需要解决一些问题

1. 在一个属性改变之后，需要一个标识来确定所有订阅已经调用`update`函数完毕
2. 缓存新旧`vnode`以便做 diff

第一个问题我们修改发布订阅类

```js
// Observer.js

/**
 * 发布订阅
 * 用来收集订阅者，数据变动触发notify，再调用订阅者的update方法
 */
export class Dep {
  constructor() {
    // 订阅者的数组
    this.subs = []
  }

  addSub(watcher) {
    // 添加订阅者
    this.subs.push(watcher)
  }

  notify() {
    let isDone = false
    this.subs.forEach((watcher, index) => {
      if (index === this.subs.length - 1) {
        // 调用到数组最后一个的时候设置为true
        isDone = true
      }
      watcher.update(isDone)
    })
  }
}
```

然后两个调用`new Watcher`的地方

```js
// vdom/render.js
// 元素节点
new Watcher(vm, vnode.props[key], (newValue, isDone) => {
  if (isDone) {
    doDiff(oldRootVnode, newRootVnode)
  }
})
// 带表达式的文本节点
new Watcher(vm, childVnode.exp, (newValue, isDone) => {
  childVnode.text = newValue
  if (isDone) {
    doDiff(oldRootVnode, newRootVnode)
  }
})
```

这样就确保了只有全部订阅者调用完`update`函数才开始进行统一的 `diff`

下面只需要缓存旧的`vdom`就可以了

```js
// vdom/render.js

// ...
let oldRootVnode
let newRootVnode
let rootEl

export function renderToDom(vm, vnode) {
  if (!newRootVnode) {
    newRootVnode = vnode
  }

  let el = document.createElement(vnode.tag)

  if (!rootEl) {
    rootEl = el
  }
  // ...
  // ...
  // ...
  // 简单的深拷贝一个旧的 vdom
  oldRootVnode = JSON.parse(JSON.stringify(vnode))
  return el
}
```

接下来就是`doDiff`函数

```js
// vdom/render.js
import diff from './diff.js'
import patch from './patch.js'

// ...
// ...
// ...

function doDiff(oldRootVnode, newRootVnode) {
  const patches = diff(oldRootVnode, newRootVnode)
  patch(rootEl, patches)
}
```

> 由于在本章前面我们把 `VNode`类加了一个 `attrs`属性用来存放取值之后的属性
> 所以在`diff`函数中相应的地方也改一下，其实就一个地方
> 其他不需要变动

```js
// vdom/diff.js

// 比较属性是否有更改
let attrs = diffAttr(oldNode.props, newNode.props)
// 改成
let attrs = diffAttr(oldNode.attrs, newNode.attrs)
```

大功告成！！

效果图和第一篇的时候是一样的

最后再简单做个代理就不用每次都访问`vm.$data.foo`
直接访问`vm.foo`就行

```js
// Mvvm.js

import Compile from './Compile.js'
import Observer from './Observer.js'

export default class Mvvm {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data

    // 数据劫持
    new Observer(this.$data)
    this.proxyData(this.$data)
    // 编译模板
    new Compile(this.$el, this)
  }

  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newValue) {
          data[key] = newValue
        }
      })
    })
  }
}
```

```html
<body>
  <div id="app" :class="foo">
    {{ foo }} {{ a }}
    <span>{{ a }}</span>
  </div>
  <script type="module" >
    import Mvvm from './Mvvm.js'

    let vm = new Mvvm({
      el: '#app',
      data: {
        foo: 'bar',
        a: 'cc'
      }
    })
    window.vm = vm
    setTimeout(() => {
      vm.foo = 'new bar'
    }, 2000)
    setTimeout(() => {
      vm.a = 'new a'
    }, 3000)
  </script>
</body>
```

## 总结

1. 本章我们把前两篇的内容做个一个整合，实现了一个简易的带`vdom`的`mvvm`框架
2. 写完本例发现应该还有性能更高的“虚拟 dom”和“真实 dom”的映射方式
3. 其实在写本例个过程中也延伸了很多其他知识点，比如正则表达式连续调用`test`的`lastIndex`的问题、`Vue`编译器的全部过程等等
4. 获益匪浅
