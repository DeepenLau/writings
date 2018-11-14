---
title: 微信 iOS 客户端签名问题与 window.location.href 和 返回按钮 的不得不说的故事
date: 2017-11-02 11:20:30
tag: spa wechat
desc: 记录一下做微信公众号网页开发时的坑
---

# 微信 iOS 客户端签名问题与 window.location.href 和 返回按钮 的不得不说的故事

> 接上回，在解决了不同平台的微信签名地址的问题之后，又一个跟浏览器相关且会影响签名地址的坑

## 描述

- 现象一：
  1. 打开页面 `/a` （签名成功）
  2. 通过前端路由跳转：`/a` --> `/b` （签名成功）
  3. 通过 `window.location.href` 跳转到 `/c` （签名成功）
  4. 点客户端上返回按钮，返回到 `/b` (没有重新请求签名信息，但能用)
  5. 再点客户端上返回按钮，返回到 `/a` （签名失败：`config:invalid signature`）
  6. 刷新之后成功

- 现象二：
  1. 打开页面 `/a` （签名成功）
  2. 通过前端路由跳转：`/a` --> `/b` （签名成功）
  3. 通过 `window.location.href` 跳转到 `/c` （签名成功）
  4. 在 `/c` 点刷新 （签名成功）
  5. 点客户端上返回按钮，返回到 `/b` (重新请求签名信息，签名成功)
  6. 再点客户端上返回按钮，返回到 `/a` 签名成功）

- 现象三：
  1. 打开页面 `/a` （签名成功）
  2. 通过前端路由跳转：`/a` --> `/b` （签名成功）
  3. 通过 `window.location.href` 跳转到 `/c` （签名成功）
  4. 在 `/c` 页面调用一下 jssdk ，例如右上角分享给朋友（无论分享成功还是点取消分享都可以）
  5. 点客户端上返回按钮，返回到 `/b` (重新请求签名信息，签名成功)
  6. 再点客户端上返回按钮，返回到 `/a` 签名成功）


现象二和现象三均签名成功，暂时不管，我们来看看现象一

出现 `config:invalid signature` 的情况，按照微信文档排除其他情况之后，基本确定就是签名地址的问题

也就是说，返回到 `/a` 的 url 和当前 landing url 不一致

在之前的解决办法中，是在 `index.html` 中声明一个全局的 `signUrl` 当做 `landing url` ，给 iOS 路由切换之后拿到 `window.signUrl` 去进行签名，安卓则在路由改变后重新拼接 `window.signUrl` 再拿去签名。这样的做法其实基于在同一个 index.html 中进行，但是在通过 `window.location.href` 跳转之后再点返回，涉及到的是一个 `html5` 的一个特性: [Back-Forward Cache](https://developer.mozilla.org/zh-CN/Firefox/Releases/1.5/Using_Firefox_1.5_caching)

> 更多资料可自行搜索或者参考[这个](http://www.cnblogs.com/AeroJin/p/4783408.html)（感谢前辈）

**简单来讲，`window.location.href` 跳出去的的 index.html 和 点返回后的 index.html 不是一个 index.html**

由于点返回后的 index.html 是从缓存中取的，js 代码也不会再执行，所以无法更新 `signUrl`，所以点返回后的 index.html 里面的 signUrl 仍然是 `/a`，但是 `landing url` 应该是 `/b`

于是乎，在 index.html 里面加一段以下代码看看点返回后的 signUrl 是什么
```js
  window.addEventListener('pageshow', function () {
    alert(signUrl) // --> `/a`
  })
```

果然，在 `/c` 返回到 `/b` 的时候，弹出来的 signUrl 是 `/a`，而当前的 `landing url` 应该要是 `/b` 才对，
所以当再返回到 `/a` 的时候，signUrl 就永远是错的，只有刷新之后才能更新 `landing url`

## 解决办法

> 说了一堆，还不是要给个解决办法

解决办法也不麻烦，在 `onpageshow` 或者 `onpagehide` 的时候更新一下 `signUrl` 就可以了

> pageshow 和 pagehide 兼容性还很不错，[传送门](https://caniuse.com/#search=pageshow)

```js
  window.addEventListener('pageshow', function () {
    signUrl = window.location.href
  })
```

## 现象二&现象三

我们可以通过下面的代码来看一下这两个现象发生了什么事

```js
  alert('重新执行了 index.html 的 js 代码')
  window.addEventListener('pageshow', function () {
    alert('pageshow')
  })
```

#### 结果

在两个现象的第5步，在 `/c` 返回到 `/b` 的之后，上面的两个 alert 都弹了出来，说明重新执行了 js 代码，也就更新了 signUrl ，所以签名依旧成功。

诡异的是，抓了一下包看，在 `/c` 返回到 `/b` 的时候，没有重新请求那个 index.html，index.html 应该还是在缓存中取的，但是却能重新执行 js 代码，至于为什么，我也不知道，尚未深究，知道了可以告诉下我，谢谢