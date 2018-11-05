---
title: 实现一个简易的带 virtual dom 的 mvvm 框架 (二)
date: 2018-10-31 15:04:01
tag: mvvm vdom
desc: 实现一个 virtual dom
---

# 实现一个简易的带 virtual dom 的 mvvm 框架 (二)

> 上一篇实现了一个简易版的 mvvm 框架，接下来实现一个 `virtual dom`

`virtual dom`组成的树可以叫 `vdom tree`, 是由多个 `virtual node` 组合而成
也就是说解决的根本在于设计这个`vnode`

而在 `Vue` 里面的 `vdom` 设计是参考 [snabbdom](https://github.com/snabbdom/snabbdom)

在此基础上进行定制化的设计

下面我们按照自己的思路实现一个简单的 `virtual dom`

## 以一个例子开始

平时我们在`Vue`里面写`render`函数的时候，会这样写

```js
render () {
  return createElement(
    // {String | Object | Function}
    'div',

    // {Object}
    // 一个包含模板相关属性的数据对象
    // 你可以在 template 中使用这些特性。可选参数。
    { class: 'div' },

    // {String | Array}
    // 子虚拟节点 (VNodes)，由 `createElement()` 构建而成，
    // 也可以使用字符串来生成“文本虚拟节点”。可选参数。
    [
      '先写一些文字',
      createElement('h1', '一则头条'))
    ]
  )
}
```

最终返回的是一个 “虚拟节点 (Virtual Node)” 也常简写它为“VNode”。“虚拟 DOM”是我们对由 Vue 组件树建立起来的整个 VNode 树的称呼。

下面我们来简化一下，以完成我们这个简单的目标

```js
// index.js

import { createElementVNode, createTextVNode } from './vnode.js'

let virtualDom1 = createElementVNode('ul', { class: 'list' }, [
  createElementVNode('li', { class: 'item' }, [createTextVNode('a')]),
  createElementVNode('li', { class: 'item' }, [createTextVNode('b')]),
  createElementVNode('li', { class: 'item' }, [createTextVNode('c')])
])
```
`createElementVNode`用来创建元素类型的虚拟节点
`createTextVNode`用来创建文本类型的元素节点

```js
// vnode.js

export class VNode {
  constructor(type, tag, props, exp, text, children) {
    this.type = type
    this.tag = tag
    this.props = props
    this.exp = exp
    this.text = text
    this.children = children
  }
}

export function createElementVNode(tag, props, children) {
  return new VNode(1, tag, props, undefined, undefined, children)
}

export function createTextVNode(text) {
  return new VNode(3, undefined, undefined, undefined, text, undefined)
}
```
可以看到`VNode`其实就是一个对象
元素节默认 `type` 为 1，文本节点默认 `type` 为 3，并且各自节点不需要的属性默认设置为 `undefined`
其中 文本节点 的 `exp` 属性是用来放表达式的，例如{{foo}}，目前不涉及，所以默认`undefined`
参考资料：[Node.nodeType - Web API 接口 \| MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType)

> 顺便提一下，其实在 Vue 编译的过程中，会有**包含有表达式**的文本节点(自定义的 type 为2)和**纯文本**节点(自定义的 type 为3)的区分
> 但是在这里我们把文本节点简化为统一的 3

到这里我们就完成一个“vdom tree”

## 把“虚拟 dom”渲染成“真实dom”

```js
// vnode.js 加一下下面代码

export function renderToDom (vnode) {
  let el = document.createElement(vnode.tag)
  for (let key in vnode.props) {
    setAttr(el, key, vnode.props[key])
  }
  vnode.children.forEach(child => {
    child = (child.type === 1) ? renderToDom(child) : document.createTextNode(child.text)
    el.appendChild(child)
  })
  return el
}

function setAttr(node, key, value) {
  switch (key) {
    // 文本框做一下处理
    case 'value':
      if (node.tagName,toUpperCase() === 'INPUT' || node.tagName,toUpperCase() === 'TEXTAREA') {
        node.value = value
      } else {
        node.setAttribute(key, value)
      }
      break
    // 行内样式
    case 'style':
      node.style.cssText = value
      break
    default:
      node.setAttribute(key, value)
      break
  }
}
```

最后再插入到页面

```js
// index.js

let dom = renderToDom(virtualDom1)

document.getElementById('root').appendChild(dom)
```

```html
<div id="root"></div>
<script type="module" src="./index.js"></script>
```

到这里，就完成把一个 vdom 渲染成了一个真实dom

## 两个 vdom 进行 diff

接下来就开始模拟数据更新并且重新渲染的页面上的流程

大致流程;

1. 数据修改后产生一个新的 vdom tree
2. 和旧 vdom 的进行 diff，也就是对比找出不同点，然后生成补丁包(patches)
3. 最后把补丁包打在真实dom上，完成更新视图

```js
// index.js

import { createElementVNode, createTextVNode, renderToDom } from './vnode.js'
import { diff } from './diff.js'
import { patch } from './patch.js'

let virtualDom1 = createElementVNode('ul', { class: 'list' }, [
  createElementVNode('li', { class: 'item' }, [createTextVNode('a')]),
  createElementVNode('li', { class: 'item' }, [createTextVNode('b')]),
  createElementVNode('li', { class: 'item' }, [createTextVNode('c')])
])


let dom = renderToDom(virtualDom1)

document.getElementById('root').appendChild(dom)

setTimeout(() => {
  // 1. 数据修改后产生一个新的 vdom tree
  let virtualDom2 = createElementVNode('ul', { class: 'new-list' }, [
    createElementVNode('li', { class: 'item' }, [createTextVNode('1')]),
    createElementVNode('li', { class: 'item' }, [createTextVNode('b')]),
    createElementVNode('li', { class: 'item' }, [createTextVNode('c')])
  ])

  // 2. 和旧 vdom 的进行 diff，也就是对比找出不同点，然后生成补丁包(patches)
  let patches = diff(virtualDom1, virtualDom2)

  // 3. 最后把补丁包打在真实dom上，完成更新视图
  patch(dom, patches)
}, 2000)
```

从代码上可知，新的 vdom 有两个改变的地方:

1. ul 的 class 变为了 new-list
2. 第一个 li 下的文本节点变为了 'new a'

下面关于的 patches 的结构解析

由于在这里我们采用常用的深度优先遍历两个 vdom ，所以 patches 设计应该是一个对象，并且 key 应该为遍历的顺序

这么说可能不够直观，那就上图说明

![20181030152311.png](http://p8rgie9qn.bkt.clouddn.com/img/20181030152311.png)

图上红色就是遍历的顺序，也就是每个节点的位置，也是就 patches 的 key

下面来写这个`diff`方法

```js
// diff.js

// 补丁包的几个类型
const ATTRS = 'ATTRS'     // 属性改了
const TEXT = 'TEXT'       // 文本改了
const REMOVE = 'REMOVE'   // 节点删除了
const REPLACE = 'REPLACE' // 节点替换了
let Index = 0 // 全局的 index，避免子节点递归遍历的顺序混乱

export default function diff (oldVnode, newVnode) {
  Index = 0 // 每次diff都复位这个全局的 Index
  let patches = {}
  let index = 0
  // 递归树，比较后的结果放到补丁包中
  walk(oldVnode, newVnode, index, patches)
  return patches
}


function walk(oldNode, newNode, index, patches) {
  let currentPatch = []
  if (!newNode) {
    // 删除节点了
    currentPatch.push({ type: REMOVE, index })
  } else if (isString(oldNode.text) && isString(newNode.text)) {
    // 字符串节点
    if (oldNode.text !== newNode.text) {
      // 不一样
      currentPatch.push({ type: TEXT, text: newNode.text })
    }
  } else if (oldNode.type === newNode.type) { // 节点类型相同
    // 比较属性是否有更改
    let attrs = diffAttr(oldNode.props, newNode.props)
    // 有更改再往 currentPatch 里面放
    if (Object.keys(attrs).length > 0) {
      currentPatch.push({ type: ATTRS, attrs })
    }
    // 有子节点遍历子节点
    diffChildren(oldNode.children, newNode.children, patches)
  } else {
    // 说明节点被替换
    currentPatch.push({ type: REPLACE, newNode })
  }
  if (currentPatch.length > 0) { // 有补丁再放
    // 放入大补丁包
    patches[index] = currentPatch
  }
}

function diffAttr(oldAttrs, newAttrs) {
  let patch = {}
  // 判断老属性
  for (let key in oldAttrs) {
    if (oldAttrs[key] !== newAttrs[key]) {
      patch[key] = newAttrs[key] // 有可能 undefined（新节点中删除了旧节点的属性）
    }
  }
  // 新增属性
  for (let key in newAttrs) {
    // 老节点没有新节点的属性，说明是新增的
    if (!oldAttrs.hasOwnProperty(key)) {
      patch[key] = newAttrs[key]
    }
  }
  return patch
}

function isString(node) {
  return Object.prototype.toString.call(node) == '[object String]'
}

function diffChildren(oldChildren, newChildren, patches) {
  oldChildren.forEach((child, idx) => {
    // index 每次递增，应该基于一个全局的序号来遍历
    walk(child, newChildren[idx], ++Index, patches)
  })
}

```

基本注释在代码上了

现在出来的 patches 长这个样子

```
{0: Array(1), 2: Array(1)}
  0: [{…}]
  2: [{…}]
```

也就对应了上面的图的数字，第0个和第2个节点发生了改变

我们会发现每个 key 后面的值都是一个数组，这是因为一个节点可能会同时存在修改多种类型的，这个取决于补丁包的自定义类型

```
0: Array(1)
  0:
    attrs: {class: "new-list"}
    type: "ATTRS"

2: Array(1)
  0:
    text: "new a"
    type: "TEXT"
```
这是最终补丁包的内容

## 给真实dom打补丁，更新视图

到这里我们来到了最后一步，就是把补丁包应用到视图上

也就是执行以下代码

```js
// index.js

setTimeout(() => {
  // ...
  patch(dom, patches)
}, 2000)
```

可见`patch`函数接收两个参数，dom，和 patches 补丁包

```js
// patch.js

import { setAttr, renderToDom } from './vnode.js'

let allPatches
let index = 0

export function patch(node, patches) {
  index = 0
  allPatches = patches
  walk(node)
}

function walk(node) {
  let currentPatch = allPatches[index++]
  let childNodes = node.childNodes
  // 深度优先遍历子节点，遍历完了再走下面
  childNodes.forEach(child => walk(child))
  // 顺序从最深的节点开始打补丁，index 最大的那个开始
  if (currentPatch) {
    doPatch(node, currentPatch)
  }
}

function doPatch(node, patches) {
  patches.forEach(patch => {
    switch (patch.type) {
      case 'ATTRS':
        for (let key in patch.attrs) {
          let value = patch.attrs[key]
          if (value) {
            setAttr(node, key, value)
          } else {
            node.removeAttribute(key)
          }
        }
        break;
      case 'TEXT':
        node.textContent = patch.text
        break
      case 'REMOVE':
        node.parentNode.removeChild(node)
        break
      case 'REPLACE':
        // patch.newNode 可能是虚拟 dom，如果是，则用 render 转成真实 dom，否则就是文本节点，最后替换到真实 dom
        let vnode = patch.newNode
        let newNode = (vnode.type === 1) ? renderToDom(vnode) : document.createTextNode(vnode.text)
        node.parentNode.replaceChild(newNode, node)
        break

      default:
        break;
    }
  })
}

```

### 大功告成！！

![20181030163642.gif](http://p8rgie9qn.bkt.clouddn.com/img/20181030163642.gif)

## 总结

1. 目前这个还只是一个小雏形，有很多问题没有解决，也没有任何的算法优化
2. 通过这个例子可以把一些基本 virtual dom 流程跑通