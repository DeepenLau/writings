---
title: node.js中 Event Loop 的分类总结
date: 2017-3-26 15:16:40
tag: node.js
desc: 记录一下 macro-taks 和 micro-task 的分类
---

# node.js中 Event Loop 的分类总结

## Event Loop

`node.js` 中事件循环机制从整体上的告诉了我们所写的 JavaScript 代码的执行顺序

最近阅读了一篇文章，感觉写得不错，[传送门](http://www.jianshu.com/p/12b9f73c5a4f)

在理解了事件循环后，下面记录的就方便查阅了

所以根据这篇文章稍微分类总结下几个异步任务队列的执行顺序

## 分类

- macro-task 权重

  1. script

  2. setTimeout

  3. setInterval

  4. setImmediate

  5. I/O

  6. UI rendering


- micro-task 权重

  1. process.nextTick

  2. promise

  3. Object.observe(已废弃)

  4. MutationObserver(html5新特性)


## 总结

1. 每一个 `macro-task` 队列走完才会去走 一个 `micro-task` 队列

2. 每走完一个 `micro-task` 称为完成一轮 __事件循环__

3. 一个 `macro-task` 队列里面无论有几个任务，都是再全部走完该队列里面的任务之后，再去走 `micro-task`

4. 无论是 `macro-task` 队列 还是 `micro-task` 队列，每次循环结束，都会清空已经走完的队列

5. 同一种任务队列，遵循先进先出的原则，不同种的任务队列，按照上面的写的权重顺序执行