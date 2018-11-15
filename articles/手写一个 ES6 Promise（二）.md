---
title: 手写一个 ES6 Promise（二）
date: 2018-11-15 16:25:23
tag: promise es6
desc: 让自己写的 Promise 变成 micro-task
---

# 手写一个 ES6 Promise（二）

上一篇讲到我们已经实现了一个符合 Promises/A+ 规范的 `Promise`，
虽然说在规范里面提到说 `Promise` 这个事件队列既可以采用宏任务机制也可以采用微任务机制，
但是原生 `ES6 Promise` 的实现中是采用微任务机制的，那我们就尝试来实现一下

## 回顾

我复制一下上一次的代码

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected
    this.value  // fulfilled 的值
    this.reason // rejected 的原因

    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    let resolve = value => {
      // 规范 3.1
      // 确保 resolve 异步执行
      setTimeout(() => {
        if (this.status === 'pending') {
          this.status = 'fulfilled'
          this.value = value
          this.onFulfilledCallbacks.forEach(cb => cb())
        }
      })
    }

    let reject = reason => {
      // 规范 3.1
      // 确保 reject 异步执行
      setTimeout(() => {
        if (this.status === 'pending') {
          this.status = 'rejected'
          this.reason = reason
          this.onRejectedCallbacks.forEach(cb => cb())
        }
      })
    }

    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason  => { throw reason }

    let promise2 = new MyPromise((resolve, reject) => {

      if (this.status === 'fulfilled') {
        // 包一层 setTimeout 进入 macro-task
        // TODO 用 MutationObserver 改写成 micro-task
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch(e) {
            reject(e)
          }
        })
      }

      if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          // pending 状态下，本身 onFulfilled 就已经是异步执行，所以这里不需要异步
          // 规范上说 应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行
          // 也就是说 onFulfilled 里面包含异步代码，onFulfilled 里面的 resolve 函数要 onFulfilled 异步代码完成后再在下一轮事件循环中再执行
          // 所以要在 构造函数中把 resolve 函数也确保异步执行。onRejected 和 reject 函数同理，看上面 constructor 函数
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })

        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })

    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    return this.then(() => {
      onFinally()
    }, () => {
      onFinally()
    })
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }

  static all (promises = []) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject('传入的参数应为一个数组')
      }

      let results = []
      let count = 0
      promises.forEach((promise, index) => {
        promise.then(res => {
          // 这里不能用 results.push，要传入的位置和结果的位置一致
          results[index] = res
          // 使用 count 变量来记录当前已经 resolved 的个数
          count++
          if (count === promises.length) {
            resolve(results)
          }
        }).catch(err => {
          reject(err)
        })
      })
    })
  }

  static race(promises = []) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject('传入的参数应为一个数组')
      }
      let isDone = false
      // Promise.race([p1, p2, p3])里面哪个结果获得的快，就返回那个结果，不管结果本身是成功状态还是失败状态。
      promises.forEach(promise => {
        promise.then(res => {
          if (isDone) return
          resolve(res)
        }).catch(err => {
          if (isDone) return
          reject(err)
        }).finally(() => {
          isDone = true
        })
      })
    })
  }

  // 给测试套件使用的
  static deferred() {
    let dfd = {}
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
  }
}

function resolvePromise (promise, x, resolve, reject) {
  // 2.3.1 promise 与 x 相等
  if (promise === x) {
    return reject(TypeError('循环引用了同一个 promise'))
  }

  // 2.3.2 x 为 Promise
  if (x instanceof MyPromise) {
    if (x.status === 'pending') {
      x.then(value => {
        resolvePromise(promise, value, resolve, reject)
      }, reject)
    }

    if (x.status === 'fulfilled') {
      resolve(x.value)
    }

    if (x.status === 'rejected') {
      reject(x.reason)
    }

    return

  }

  // 2.3.3  x 为对象或者函数
  if ((x !== null && typeof x === 'object') || typeof x === 'function') {
    let then
    let called = false // // 2.3.3.3.3 结合下面看 called = true 的位置

    try {
      then = x.then // 2.3.3.1
    } catch (e) {
      return reject(e) // 2.3.3.2
    }

    if (typeof then === 'function') { // 2.3.3.3
      try {
        then.call(x, (y) => { // 2.3.3.3.1
          if (called) return
          called = true
          resolvePromise(promise, y, resolve, reject)
        }, (r) => { // // 2.3.3.3.2
          if (called) return
          called = true
          reject(r)
        })
      } catch (e) { // 2.3.3.3.4
        if (called) return // 2.3.3.3.4.1
        called = true
        reject(e) // // 2.3.3.3.4.2
      }
    } else { // 2.3.3.4
      resolve(x)
    }
  } else { // 2.3.4 x 不为对象或者函数
    resolve(x)
  }
}
```

然后我们运行一下下面的代码

```js
setTimeout(() => {
  console.log(3)
})
new MyPromise(resolve => {
  console.log(1)
  resolve()
}).then(() => {
  console.log(2)
})

// => 1
// => 3
// => 2
```
可以看到上面顺序是 1 3 2

如果用原生 `ES6 Promise` 的话
```js
setTimeout(() => {
  console.log(3)
})
new Promise(resolve => {
  console.log(1)
  resolve()
}).then(() => {
  console.log(2)
})

// => 1
// => 2
// => 3
```
这样顺序则是 1 2 3

要怎么实现这样的顺序呢？

## 实现

我们知道在浏览器环境可以使用 `MutationObserver`,
而在 `NodeJS` 环境中可以使用 `process.nextTick`

先来说说 `MutationObserver`，[这里是介绍](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)，或者网上很多资料，这里不废话。

最基本实现也不是很复杂，就是创建一个 `dom` 对其进行监听，然后在回调函数里调用我们传去函数，然后修改一下这个 `dom` 来触发回调函数的执行

```js
const schedule = (() => {
  const div = document.createElement('div')
  const opts = { attributes: true }

  return function (fn) {
    var o = new MutationObserver(() => {
      fn()
    })
    o.observe(div, opts)
    div.classList.toggle('foo')
  }
})()
```

然后替换上面的 `setTimeout`

```js
...
let resolve = value => {
  // 规范 3.1
  // 确保 resolve 异步执行
  schedule(() => {
    if (this.status === 'pending') {
      this.status = 'fulfilled'
      this.value = value
      this.onFulfilledCallbacks.forEach(cb => cb())
    }
  })
}

let reject = reason => {
  // 规范 3.1
  // 确保 reject 异步执行
  schedule(() => {
    if (this.status === 'pending') {
      this.status = 'rejected'
      this.reason = reason
      this.onRejectedCallbacks.forEach(cb => cb())
    }
  })
}
...
...
if (this.status === 'fulfilled') {
  schedule(() => {
    try {
      let x = onFulfilled(this.value)
      resolvePromise(promise2, x, resolve, reject)
    } catch (e) {
      reject(e)
    }
  })
}

if (this.status === 'rejected') {
  schedule(() => {
    try {
      let x = onRejected(this.reason)
      resolvePromise(promise2, x, resolve, reject)
    } catch (e) {
      reject(e)
    }
  })
}

...
```

然后就会发现，其实就已经好了，再调用一下测试的代码

```js
setTimeout(() => {
  console.log(3)
})
new MyPromise(resolve => {
  console.log(1)
  resolve()
}).then(() => {
  console.log(2)
})

// 顺利打印
// => 1
// => 2
// => 3
```

很简单吧！

我们看一下 `bluebird.js` 是怎么实现并且优化的，[传送门](https://github.com/petkaantonov/bluebird/blob/master/src/schedule.js)

提取出来就是长了这个样子

```js
var schedule = (function() {
  // Using 2 mutation observers to batch multiple updates into one.
  var div = document.createElement('div')
  var opts = { attributes: true }
  var toggleScheduled = false

  var div2 = document.createElement('div')
  var o2 = new MutationObserver(function() {
    div.classList.toggle('foo')
    toggleScheduled = false
  })
  o2.observe(div2, opts)

  var scheduleToggle = function() {
    if (toggleScheduled) return
    toggleScheduled = true
    div2.classList.toggle('foo')
  }

  return function schedule(fn) {
    var o = new MutationObserver(function() {
      o.disconnect()
      fn()
    })
    o.observe(div, opts)
    scheduleToggle()
  }
})()
```

可以看到注释写的优化的点就是利用创建两个 `MutationObserver` 来批量更新

现在在浏览器环境下就有实现了把自己的 `Promise` 采用微任务机制

在 `Node` 环境更加简单，本身自带的 `process.nextTick` 方法就是微任务机制
所以，同样替换 `setTimeout` 即可

```js
// 其他的替换的地方也一样
process.nextTick(() => {
  if (this.status === 'pending') {
    this.status = 'fulfilled'
    this.value = value
    this.onFulfilledCallbacks.forEach(cb => cb())
  }
})
```

下面只要做一下环境判断，就可以把我们的 `Promise` 同时用在浏览器环境下和 `Node` 环境下

```js
function classString(obj) {
    return {}.toString.call(obj);
}

const isNode = typeof process !== "undefined" &&
    classString(process).toLowerCase() === "[object process]";

let schedule

if (isNode) {
  schedule = process.nextTick
} else {
  schedule = (function() {
    // Using 2 mutation observers to batch multiple updates into one.
    var div = document.createElement('div')
    var opts = { attributes: true }
    var toggleScheduled = false

    var div2 = document.createElement('div')
    var o2 = new MutationObserver(function() {
      div.classList.toggle('foo')
      toggleScheduled = false
    })
    o2.observe(div2, opts)

    var scheduleToggle = function() {
      if (toggleScheduled) return
      toggleScheduled = true
      div2.classList.toggle('foo')
    }

    return function schedule(fn) {
      var o = new MutationObserver(function() {
        o.disconnect()
        fn()
      })
      o.observe(div, opts)
      scheduleToggle()

    }
  })()
}
```

## 最终代码

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected
    this.value // fulfilled 的值
    this.reason // rejected 的原因

    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    let resolve = value => {
      // 规范 3.1
      // 确保 resolve 异步执行
      schedule(() => {
        if (this.status === 'pending') {
          this.status = 'fulfilled'
          this.value = value
          this.onFulfilledCallbacks.forEach(cb => cb())
        }
      })
    }

    let reject = reason => {
      // 规范 3.1
      // 确保 reject 异步执行
      schedule(() => {
        if (this.status === 'pending') {
          this.status = 'rejected'
          this.reason = reason
          this.onRejectedCallbacks.forEach(cb => cb())
        }
      })
    }

    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        schedule(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === 'rejected') {
        schedule(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          // pending 状态下，本身 onFulfilled 就已经是异步执行，所以这里不需要异步
          // 规范上说 应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行
          // 也就是说 onFulfilled 里面包含异步代码，onFulfilled 里面的 resolve 函数要 onFulfilled 异步代码完成后再在下一轮事件循环中再执行
          // 所以要在 构造函数中把 resolve 函数也确保异步执行。onRejected 和 reject 函数同理，看上面 constructor 函数
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })

        this.onRejectedCallbacks.push(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })

    return promise2
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    return this.then(
      () => {
        onFinally()
      },
      () => {
        onFinally()
      }
    )
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }

  static all(promises = []) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject('传入的参数应为一个数组')
      }

      let results = []
      let count = 0
      promises.forEach((promise, index) => {
        promise
          .then(res => {
            // 这里不能用 results.push，要传入的位置和结果的位置一致
            results[index] = res
            // 使用 count 变量来记录当前已经 resolved 的个数
            count++
            if (count === promises.length) {
              resolve(results)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    })
  }

  static race(promises = []) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject('传入的参数应为一个数组')
      }
      let isDone = false
      // Promise.race([p1, p2, p3])里面哪个结果获得的快，就返回那个结果，不管结果本身是成功状态还是失败状态。
      promises.forEach(promise => {
        promise
          .then(res => {
            if (isDone) return
            resolve(res)
          })
          .catch(err => {
            if (isDone) return
            reject(err)
          })
          .finally(() => {
            isDone = true
          })
      })
    })
  }

  // 给测试套件使用的
  static deferred() {
    let dfd = {}
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 2.3.1 promise 与 x 相等
  if (promise === x) {
    return reject(TypeError('循环引用了同一个 promise'))
  }

  // 2.3.2 x 为 Promise
  if (x instanceof MyPromise) {
    if (x.status === 'pending') {
      x.then(value => {
        resolvePromise(promise, value, resolve, reject)
      }, reject)
    }

    if (x.status === 'fulfilled') {
      resolve(x.value)
    }

    if (x.status === 'rejected') {
      reject(x.reason)
    }

    return
  }

  // 2.3.3  x 为对象或者函数
  if ((x !== null && typeof x === 'object') || typeof x === 'function') {
    let then
    let called = false // // 2.3.3.3.3 结合下面看 called = true 的位置

    try {
      then = x.then // 2.3.3.1
    } catch (e) {
      return reject(e) // 2.3.3.2
    }

    if (typeof then === 'function') {
      // 2.3.3.3
      try {
        then.call(
          x,
          y => {
            // 2.3.3.3.1
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          r => {
            // // 2.3.3.3.2
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (e) {
        // 2.3.3.3.4
        if (called) return // 2.3.3.3.4.1
        called = true
        reject(e) // // 2.3.3.3.4.2
      }
    } else {
      // 2.3.3.4
      resolve(x)
    }
  } else {
    // 2.3.4 x 不为对象或者函数
    resolve(x)
  }
}


function classString(obj) {
  return {}.toString.call(obj);
}

const isNode = typeof process !== "undefined" &&
  classString(process).toLowerCase() === "[object process]";

let schedule

if (isNode) {
  schedule = process.nextTick
} else {
  schedule = (function() {
    // Using 2 mutation observers to batch multiple updates into one.
    var div = document.createElement('div')
    var opts = { attributes: true }
    var toggleScheduled = false

    var div2 = document.createElement('div')
    var o2 = new MutationObserver(function() {
      div.classList.toggle('foo')
      toggleScheduled = false
    })
    o2.observe(div2, opts)

    var scheduleToggle = function() {
      if (toggleScheduled) return
      toggleScheduled = true
      div2.classList.toggle('foo')
    }

    return function schedule(fn) {
      var o = new MutationObserver(function() {
        o.disconnect()
        fn()
      })
      o.observe(div, opts)
      scheduleToggle()

    }
  })()
}

if (typeof module !== 'undefined') module.exports = MyPromise
```

## 总结

- 本章我们就学习了如何把自己的 `Promise` 实现成微任务机制
- 其实还有其他大神通过各种 hack 的方式实现了一套 [`setImmediate`](https://github.com/YuzuJS/setImmediate)，有兴趣可以了解一下