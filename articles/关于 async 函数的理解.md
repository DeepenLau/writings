---
title: 关于 async 函数的理解
date: 2018-12-11 15:05:55
tag: javascript
desc: 看到一道面试题而写的
---

# 关于 async 函数的理解

> 写这一篇文章的目的在于看到[这篇文章](https://juejin.im/post/5c0dcf70518825765548502b)觉得挺有意思，所以写下这个已表看法。
> 这个是[原文](https://segmentfault.com/a/1190000017224799)

所谓的争论起源于一道面试题

```js
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(function() {
  console.log('setTimeout')
}, 0)

async1()

new Promise(function(resolve) {
  console.log('promise1')
  resolve()
}).then(function() {
  console.log('promise2')
})

console.log('script end')
```

我认为这其中的关键的点在于 `async` 函数中的 `await` 后面的代码何时执行

所以我按照自己的理解写下了自己的答案

```js
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

但是放到 chrome (71.0.3578.80)下面跑一下，结果和我的想有点出入

```js
script start
async1 start
async2
promise1
script end
promise2
async1 end
setTimeout
```

先说明我的答案的思路其实是这样的，因为 `async` 函数返回的是一个 `promise`，再加上原文里面的解释，所以但是我认为 `async` 函数可以用改写成以下代码

```js
function async1() {
  console.log('2 async1 start')
  return Promise.resolve(async2()).then(res => {
    console.log('6 async1 end')
  })
}
function async2() {
  console.log('3 async2')
}
console.log('1 script start')
setTimeout(function() {
  console.log('8 setTimeout')
}, 0)
async1()
new Promise(function(resolve) {
  console.log('4 promise1')
  resolve()
}).then(function() {
  console.log('7 promise2')
})
console.log('5 script end')
```

所以上述结果就是这样

```js
1 script start
2 async1 start
3 async2
4 promise1
5 script end
6 async1 end
7 promise2
8 setTimeout
```

区别就在于 `promise2` 和 `async1 end` 的顺序，我的答案是 先 `async1 end` 后 `promise2`，当时浏览器的答案却与我相反。本着 希望自己学习理解的东西能清楚地表达出来的精神，开始了 打破砂锅问到底的 搜寻资料之旅。

## 开始爬坑

首先在评论区找到这篇文章 [更快的异步函数和 Promise](https://v8.js.cn/blog/fast-async/)，发布时间是 2018-11-12，算是比较新的，
英语原文 [https://v8.dev/blog/fast-async](https://v8.dev/blog/fast-async)

这里面其实大概讲的是 `async` 函数的实现和优化发展和 `promise` 之间的联系

里面有一句话，和一个 demo

> 从 Node.js 8（V8 v6.2 / Chrome 62）开始已经完全支持异步函数，并且从 Node.js 10（V8 v6.8 / Chrome 68）开始已经完全支持异步迭代器和生成器！

![](https://user-gold-cdn.xitu.io/2018/12/11/1679c0cedfd5909b)

按照文章里面的说法，在Node.js 8（V8 v6.2 / Chrome 62）中

```js
// wrong
after:await
tick:a
tick:b
```

这样的顺序是一个 bug，并不是规范，而 Node.js 10（V8 v6.8 / Chrome 68）实现了正确的行为

```js
// correct
tick:a
tick:b
after:await
```

然后我使用的 chrome 71 跑了一些，确实是如上所说，`after:await` 在最后打印

然后经过下面的一轮解释，结论就是因为

> 在每个 `await` (in ES2017) 引擎必须创建两个额外的 Promise（即使右侧已经是一个 Promise）并且它需要至少三个 microtask 队列 ticks

到这里，按照我的理解，就是一个 `await p;` 需要创建两个 额外的 `promise`，`p` 本身是一个 `promise`，所以一行 `await p;`就有三个 `promise`, 而 `console.log('after:await')`是在 `await p;` 的三个 `promise` 后执行的
所以我认为可以改写成以下代码来模拟执行

```js
const p = Promise.resolve();

(async () => {
  // p 就是原来 await 右侧的执行结果
  return p
    .then(() => {
      // 额外创建的第一个 promise
    })
    .then(() => {
      // 额外创建的第二个 promise
    })
    .then(() => {
      // 这里是原来 await p; 后面的代码
      console.log('after:await')
    })
})()

p.then(() => console.log('tick:a'))
 .then(() => console.log('tick:b'))
```

输出结果

```js
tick:a
tick:b
after:await
```

那如果我把原代码扩展一下，变成这样呢

```js
const p = Promise.resolve();

(async () => {
  await p
  console.log('after:await')
})()

p.then(() => console.log('tick:a'))
 .then(() => console.log('tick:b'))
 .then(() => console.log('tick:c'))
 .then(() => console.log('tick:d'))
```

根据我理解的 `event loop` 机制和上面的小结，应该可以改写成

```js
const p = Promise.resolve();

(async () => {
  // p 就是原来 await 右侧的执行结果
  return p
    .then(() => {
      // 额外创建的第一个 promise
    })
    .then(() => {
      // 额外创建的第二个 promise
    })
    .then(() => {
      // 这里是原来 await p; 后面的代码
      console.log('after:await')
    })
})()

p.then(() => console.log('tick:a'))
 .then(() => console.log('tick:b'))
 .then(() => console.log('tick:c'))
 .then(() => console.log('tick:d'))
```

可以发现都是打印同样的答案，符合预期

```js
tick:a
tick:b
after:await
tick:c
tick:d
```

有的人可能不太理解为什么 `after:await` 会插在中间，可以参考这篇文章：[理解 promise--一个问题引发的思考](https://segmentfault.com/a/1190000016935513)

但是！

在**原贴**评论下方有大佬指出说在最新的规范里这样的实现是错的，并且在 chrome 73 已经实现

那么我们就把原题在 chrome 73 下的控制台跑一下，打开我的 chrome canary 浏览器

```js
script start
async1 start
async2
promise1
script end

async1 end // 先
promise2   // 后

setTimeout
```

可以看到，结果和在 chrome 71 的时候是不同的，然后我惊奇地发现这个和我最开始的改写的答案是一致的，
到这里我还以为最新的规范和我的想法是一致的。

我们接着往那篇文章下面看

下面大概就是说，这样一个 `await` 要额外创建出两个 `promise` 开销很大，所以就进行了优化之旅
而最终优化的结果就是

> 如果传递给 `await` 的值已经是一个 `Promise` ，那么这种优化避免了再次创建 `Promise` 包装器，
> 在这种情况，我们从最少三个 microtick 到只有一个 microtick
> 这种行为类似于 Node.js 8 所做的，但是现在它不再是一个 bug
> 它现在是一个正在标准化的优化

也就是说，当初认为在 Node.js 8（V8 v6.2 / Chrome 62）的 await 行为是一个 bug 的行为，经过优化，变成不在是一个 bug，而是一个正在标准化的优化。
那经过优化，目前最新规范的 `await` 行为其实就是和 Node.js 8（V8 v6.2 / Chrome 62 的时候一样，也就是如下代码的结果一样，但是性能却更高

```js
const p = Promise.resolve();

(async () => {
  await p; console.log('after:await')
})()

p.then(() => console.log('tick:a'))
 .then(() => console.log('tick:b'))

// 这样的结果反而才是正确的
// 在 chrome 73 下也是这样的结果，说明 chrome 73 确实已经实现了
after:await
tick:a
tick:b
```

虽然行为倒退了和 Chrome 62 的时候一样，但却是经过优化使得性能提升的做的改动
而在 Node.js 中，也在未来的 Node 12 中采取了这样的实现

也就是应该是可以改写成

```js
const p = Promise.resolve();

(async () => {
  return p.then(() => {
    console.log('after:await')
  })
})()

p.then(() => console.log('tick:a'))
 .then(() => console.log('tick:b'))

// 结果
after:await
tick:a
tick:b
```

## 回到最初

现在回到原来的题，我认为我的改写是有误的，经过一番探索之后
我认为按照 `await` (in ES2017) 的实现，可以改写成下面这样

```js
function async1(){
  console.log('2 async1 start')
  return async2()
    .then(() => {

    }).then(() => {

    }).then(() => {
      console.log('6 async1 end')
    })
}
function async2(){
  console.log('3 async2')
  // 这个函数返回一个 promise，如果不返回 promise，则应该在 async1 函数里面给 async2 函数的执行结果包一层 Promise
  return Promise.resolve(undefined)
}
console.log('1 script start')
setTimeout(function(){
  console.log('8 setTimeout')
},0)
async1()
new Promise(function(resolve){
  console.log('4 promise1')
  resolve();
}).then(function(){
  console.log('7 promise2')
})
console.log('5 script end')

// 结果
1 script start
2 async1 start
3 async2
4 promise1
5 script end
7 promise2
6 async1 end
8 setTimeout
```

可以看到 6 和 7 的顺序反了，符合 `async` 函数在旧规范下的行为

而根据优化后的新规范，可以改写成

```js
function async1(){
  console.log('2 async1 start')
  return async2().then(() => {
    console.log('6 async1 end')
  })
}
function async2(){
  console.log('3 async2')
  // 这个函数返回一个 promise，如果不返回 promise，则应该在 async1 函数里面给 async2 函数的执行结果包一层 Promise
  return Promise.resolve(undefined)
}
console.log('1 script start')
setTimeout(function(){
  console.log('8 setTimeout')
},0)
async1()
new Promise(function(resolve){
  console.log('4 promise1')
  resolve();
}).then(function(){
  console.log('7 promise2')
})
console.log('5 script end')

// 结果
1 script start
2 async1 start
3 async2
4 promise1
5 script end
6 async1 end
7 promise2
8 setTimeout
```

可以看到 6 和 7 的顺序正确，符合 `async` 函数在新规范下的行为

## 总结

在文章的末尾总结是

> 由于两个重要的优化，我们使异步函数更快：
>
> 1. 删除两个额外的 microtick
> 2. 和去除了 throwaway promise

> 此补丁尚未合并到 ECMAScript 规范中。一旦我们确保此改变不会破坏网络，我们的计划就是马上执行

而我认为

1. 理解 `async` 的执行机制对 自己加深这门语言是有一定积极作用的
2. 但是在实际工作中，其实纠结这种顺序大部分时候没什么必要的
3. 当成学习的心态去 了解一下当前 JavaScript 的发展之路也是一个不错的出发点
4. 当然了，这是一道面试题，理解了，对大家有好处
5. 以上的所有改写都是为了方便我自己理解而改写的，和 `async` 的具体实现还是不同的