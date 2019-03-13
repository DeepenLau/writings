---
title: 手写一个简易 Koa 框架
date: 2018-12-21 00:30:33
tag: koa node
desc: 学习了解 webpack 打包流程
---

# 手写一个简易 Koa 框架

## 原理
```js
function a(i) {
  if (i <= 3) {
    console.log(i)
    a(i+1)
    console.log(i)
  }
}
a(1)
// 1
// 2
// 3
// 3
// 2
// 1
```

## 前言

`Koa` 框架想必写过 `Node.js` 的人都不会陌生，而我比较感兴趣的它的 ***洋葱圈*** 模型的原理实现，
那么我们就来试一下实现一个简易的 `Koa` 框架来学习其中的原理

## 开始

首先我们开看看原版 `Koa` 是怎么用的
```js
const Koa = require('koa')
const app = new Koa()

app.use((ctx, next) => {
  ctx.body = 'hello koa'
})

app.listen(3000)
```
用法很简单，这样我们就可以快速启动了一个 web 服务，
在浏览器或者其他用户代理请求 http://localhost:3000/ 就可以访问看到返回了 hello koa

首先我们用原生 `Node.js` 来模拟一下上面的效果
```js
const http = require('http')

const app = http.createServer((req, res) => {
  res.end('hello world')
})

app.listen(3000)
```

下面我们也来封装一下，实现一个简单

