---
title: 手写一个 ES6 Promise（一）
date: 2018-11-13 15:31:07
tag: promise es6
desc: 实现一个符合 Promoses/A+ 规范的 ES6 Promise
---

# 手写一个 ES6 Promise（一）

上来先来一篇规范 [Promises/A+](https://promisesaplus.com)
中文版：[【翻译】Promises/A+规范-图灵社区](http://www.ituring.com.cn/article/66566)

ES6 的 `Promise` 其实也就是在 `Promises/A+` 规范的基础上进行扩展和定制化的
所以要实现一个 ES6 的 `Promise` 要了解规范，再进行扩展

## 从使用入手

一个简单的例子

```js
function a () {
  return new MyPromise((resolve, reject) => {
    resolve('a')
  })
}

a().then(res => {
  console.log(res) // => a
})
```

先来实现一个这样简单的`Promose`

依照规范，Promise有三个状态：
1. 等待态（pending）： 可以迁移至执行态或拒绝态
2. 执行态（fulfilled）也叫（成功态）：不能迁移至其他任何状态，并且有一个不可变的值
3. 拒绝态（rejected）也叫（失败态）：不能迁移至其他任何状态，并且有一个不可变的原因

> 这里的不可变指的是恒等（即可用 === 判断相等），而不是意味着更深层次的不可变（译者注：盖指当 value 或 reason 不是基本值时，只要求其引用地址相等，但属性值可被更改）。

还有一个 `then` 方法

> 而且也只有一个 `then` 方法，其他链式操作的方法（比如 `.catch`）和一些静态方法（例如 `Promise.reolve()`）也是自己扩展的

一个 promise 必须提供一个 then 方法以访问其当前值、终值（value）和据因（reason）。

```js
promise.then(onFulfilled, onRejected)
```
结合例子看到这里，其实就已经可以实现上面的例子代码的`Promise`实现了

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected
    this.value  // fulfilled 的值
    this.reason // rejected 的原因
    let resolve = value => {
      this.status = 'fulfilled'
      this.value = value
    }
    let reject = reason => {}
    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    executor(resolve, reject)
  }

  then(onFulfilled, onRejected) {
    if (this.status === 'fulfilled') {
      onFulfilled(this.value)
    }
  }
}
```
简单说明一下，就是在调用 `resolve` 方法的时候，把结果`a`传入`promise`实例内部缓存起来
并且修改状态为`fulfilled`
然后当调用`promise.then`方法的时候，调用`onFulfilled`函数（`then`方法的第一个参数），并且把刚才缓存的值`a`作为参数传入，所以就可以在打印出`a`

`rejected`态和`onRejected`函数也是一样的处理

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected
    this.value  // fulfilled 的值
    this.reason // rejected 的原因
    let resolve = value => {
      this.status = 'fulfilled'
      this.value = value
    }
    let reject = reason => {
      this.status = 'rejected'
      this.reason = reason
    }
    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    executor(resolve, reject)
  }

  then(onFulfilled, onRejected) {
    if (this.status === 'fulfilled') {
      onFulfilled(this.value)
    }

    if (this.status === 'rejected') {
      onRejected(this.reason)
    }
  }
}
```

所以现在调用`reject`函数也可以跑了

```js
function a () {
  return new MyPromise((resolve, reject) => {
    // resolve('a')
    reject('err')
  })
}

a().then(res => {
  console.log(res)
}, err => {
  console.log(err)
})

// => err
```

不过我们可能会这样子写

```js
function a () {
  return new MyPromise((resolve, reject) => {
    throw Error('onRejected 函数捕获不到这个错误')
  })
}
```

其实也就是在执行 `executor` 的时候报错，然后捕获错误，传递给 `reject` 函数，修改为 `rejected` 态并且缓存错误原因即可，在随后调用 `then` 方法的时候就会调用 `onRejected`函数
代码如下

```js
try {
  executor(resolve, reject)
} catch (e) {
  reject(e)
}
```

## 处理异步

现在我们加入一些常见用`Promise`处理异步的代码

比如这样：

```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  console.log(res)
}, err => {
  console.log(err)
})
```

我们会发现这样就不起作用了，原因在于我们调用 `then` 方法的时候，这个`promise`还处于`pending`态
也就是要在`then`方法里面添加一个条件分支

```js
then(onFulfilled, onRejected) {
  if (this.status === 'fulfilled') {
    onFulfilled(this.value)
  }

  if (this.status === 'rejected') {
    onRejected(this.reason)
  }

  if (this.status === 'pending') {
    // TODO
  }
}
```

那要在里面写什么呢？其实也不难理解

就是要把当前的 `onFulfilled` 函数，找个地方存起来，
当1秒之后（例子代码）调用 `resolve` 函数的时候就要把刚才缓存的函数调用一下

顺序就变成了：
调用`executor`传递`resolve`函数 --> **还没有**调用`resolve`函数 --> 调用`then`方法缓存`onFulfilled`函数 --> 调用`resolve`函数 --> 调用缓存的函数

而原本不加异步代码的顺序为：
调用`executor`传递`resolve`函数 --> 直接调用`resolve`函数 --> 调用`then`方法是已经处于`fulfilled`态 --> 直接调用`onFulfilled`

`reject`的逻辑也是一样

代码改成

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected
    this.value  // fulfilled 的值
    this.reason // rejected 的原因

    // 默认空函数
    this.onFulfilledCallback = () => {}
    this.onRejectedCallback = () => {}

    let resolve = value => {
      this.status = 'fulfilled'
      this.value = value
      this.onFulfilledCallback()
    }
    let reject = reason => {
      this.status = 'rejected'
      this.reason = reason
      this.onRejectedCallback()
    }
    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === 'fulfilled') {
      onFulfilled(this.value)
    }

    if (this.status === 'rejected') {
      onRejected(this.reason)
    }

    if (this.status === 'pending') {
      // this.onFulfilledCallback = onFulfilled 这样会无法传递 this.value值
      this.onFulfilledCallback = () => {
        onFulfilled(this.value)
      }

      this.onRejectedCallback = () => {
        onRejected(this.reason)
      }
    }
  }
}
```

但是这样写会有一个问题

规范里讲到

> 2.2.6 then 方法可以被同一个 promise 调用多次

也就是这样调用

```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

let p1 = a()

p1.then(res => {
  console.log(res)
})
p1.then(res => {
  console.log(res)
})

// => a
```

这样的同一个 `p1` 调用两次 `then` 最终只打印出了一个`a`
所以既然能被同一个 promise 调用多次，应该要打印出两个`a`

这里应该用一个**数组**存比较，当调用`resolve`函数的时候依次调用对应数组的每一项

```js
class MyPromise {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected
    this.value  // fulfilled 的值
    this.reason // rejected 的原因

    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    let resolve = value => {
      this.status = 'fulfilled'
      this.value = value
      this.onFulfilledCallbacks.forEach(cb => cb())
    }
    let reject = reason => {
      this.status = 'rejected'
      this.reason = reason
      this.onRejectedCallbacks.forEach(cb => cb())
    }
    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    if (this.status === 'fulfilled') {
      onFulfilled(this.value)
    }

    if (this.status === 'rejected') {
      onRejected(this.reason)
    }

    if (this.status === 'pending') {
      // this.onFulfilledCallback = onFulfilled 这样会无法传递 this.value值
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.value)
      })

      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason)
      })
    }
  }
}
```

这样就可以打印两个`a`了

## 链式调用

我们一般使用`Promise`也会使用链式调用，像这样
```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  console.log(res)
  return res
}).then(res => {
  console.log(res)
})
```

但是有`then`方法的应该是要是个`Promise`才对

这一点在规范里面也有提到

> 2.2.7 `then` 方法必须返回一个 `promise` 对象

```js
promise2 = promise1.then(onFulfilled, onRejected)
```

所以现在的 `then` 方法长这个样子

```js
then(onFulfilled, onRejected) {
  let promise2 = new MyPromise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      onFulfilled(this.value)
    }

    if (this.status === 'rejected') {
      onRejected(this.reason)
    }

    if (this.status === 'pending') {
      // this.onFulfilledCallback = onFulfilled 这样会无法传递 this.value值
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.value)
      })

      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason)
      })
    }
  })

  return promise2
}
```

我们再来看一下这段代码

```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  console.log(res)
  return res
}).then(res => {
  console.log(res)
})
```

在这里面的第一个`then`的`onFulfilled`函数 `return` 了一个 `resolve`函数传过来的值`a`
这个`a`是需要传递到第二`then`的`onFulfilled`函数的`res`形参中
所以第二`then`里面也应该打印出`a`

那怎么实现呢？其实也好实现

因为在`then`方法中返回的是一个新的`promise`对象，所以只要把上一个调用`onFulfilled`函数的返回值作为新`promise`的`resolve`函数的参数传过去就行

而这个返回值，在规范里面就叫做`x`

> 2.2.7.1 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：`[[Resolve]](promise2, x)`
> `[[Resolve]](promise2, x) `这个方法我们目前暂时不用理会，后面会讲到


所以，现在`then`方法变成这样

```js
then(onFulfilled, onRejected) {
  let promise2 = new MyPromise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      let x = onFulfilled(this.value)
      resolve(x)
    }

    if (this.status === 'rejected') {
      onRejected(this.reason)
    }

    if (this.status === 'pending') {
      // this.onFulfilledCallback = onFulfilled 这样会无法传递 this.value值
      this.onFulfilledCallbacks.push(() => {
        let x = onFulfilled(this.value)
        resolve(x)
      })

      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason)
      })
    }
  })

  return promise2
}
```

到这里我们会发现没有处理 `onRejected` 函数的返回值 `x`

我们也许有这样一个疑问：不就直接像`onFulfilled`那样写就好了吗？

```js
let x = onRejected(this.reason)
reject(x)
```

如果这样写我们可以看下有什么问题，大家自己把上面这段替换到`then`方法里面的对应位置
然后执行下面代码

```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      reject('err') // 这里改用 reject
    }, 1000)
  })
}

a().then(res => {
  return res
}, err => {
  // 就会这里得到 err
  console.log(err) // => err
  // 如果在这里把 err return
  return err
}).then(res => {
  console.log(res) // 不会走到这里
}, err => {
  console.log(err) // 会走到这里，得到 err
})
```

可以看到，在`a`函数里面改用 `reject('err')`，这会在`then`的时候直接走到`onRejected`函数，这没有问题

如果在第一个`then`的`onRejected`函数里面直接`return`得到的值`err`，则会传递到第二个`then`的`onRejected`函数

咋一看好像也没什么问题，那我们不引用我们写的`Promise`，在原生`ES6 Promise`环境下执行这段代码

```js
a().then(res => {
  return res
}, err => {
  // 就会这里得到 err
  console.log(err) // => err
  // 如果在这里把 err return
  return err
}).then(res => {
  console.log(res) // 会走到这里，得到 err
}, err => {
  console.log(err) // 不会走到这里
})
```

显而易见，区别在于最终会传递到第二个`then`的`onFulfilled`函数，而不是`onRejected`函数

也就是说，`onRejected`函数的返回值`x`，应该也是传递到`resolve`函数
```js
let x = onRejected(this.reason)
reject(x)

// 改成

let x = onRejected(this.reason)
resolve(x)
```

所以现在`then`函数长这个样子

```js
then(onFulfilled, onRejected) {
  let promise2 = new Promise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      let x = onFulfilled(this.value)
      resolve(x)
    }

    if (this.status === 'rejected') {
      let x = onRejected(this.reason)
      resolve(x)
    }

    if (this.status === 'pending') {
      this.onFulfilledCallbacks.push(() => {
        let x = onFulfilled(this.value)
        resolve(x)
      })

      this.onRejectedCallbacks.push(() => {
        let x = onRejected(this.reason)
        resolve(x)
      })
    }
  })
```

下面来看下其他例子，我们可能会写这样的代码

```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  throw Error('在 onFulfilled 函数抛出一个 error')
}, err => {
  throw Error('在 onRejected 函数抛出一个 error')
})

```
也就是说，我们可能在链式调用中的任何一处地方都有可能会报错，而捕获到的错误，都要传递给下一个`then`的`onRejected`函数

可以引用原生的`ES6 Promise`的话来看看结果

```js
function a () {
  // ES6 Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  throw Error('在 onFulfilled 函数抛出一个 error')
}, err => {
  throw Error('在 onRejected 函数抛出一个 error')
}).then(res => {
  console.log(res)
}, err => {
  console.log(err) // Error: 在 onFulfilled 函数抛出一个 error
})
```
```js
function a () {
  // ES6 Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('在 executor 中 reject')
    }, 1000)
  })
}

a().then(res => {
  throw Error('在 onFulfilled 函数抛出一个 error')
}, err => {
  throw Error('在 onRejected 函数抛出一个 error')
}).then(res => {
  console.log(res)
}, err => {
  console.log(err) // Error: 在 onRejected 函数抛出一个 error
})
```

可以看出两个结果都是在下一个的`then`的`onRejected`函数中捕获到错误
要实现也很简单，就是在`then`方法调用`onFulfilled`和`onRejected`的时候`try...catch`一下，然后在`catch`块里面调用`reject`同时把错误信息传递过去

所以现在 `then` 方法长这个样子

```js
then(onFulfilled, onRejected) {
  let promise2 = new MyPromise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      try {
        let x = onFulfilled(this.value)
        resolve(x)
      } catch (e) {
        reject(e)
      }
    }

    if (this.status === 'rejected') {
      try {
        let x = onRejected(this.reason)
        resolve(x)
      } catch(e) {
        reject(e)
      }
    }

    if (this.status === 'pending') {
      this.onFulfilledCallbacks.push(() => {
        try {
          let x = onFulfilled(this.value)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })

      this.onRejectedCallbacks.push(() => {
        try {
          let x = onRejected(this.reason)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    }
  })

  return promise2
}
```

下面我们再讲一个例子

```js
function a () {
  // ES6 Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a()
  .then()
  .then()
  .then(res => {
    console.log(res) // => a
  })
```

上面这段代码，在原生`ES6 Promise`的执行环境下，是可以正常打印出`a`的

这个叫**值的穿透**，若没有`onFulfilled`和`onRejected`的处理，则将值一直往下传递
也就是说，如果没有在调用`then`方法的时候传递`onFulfilled`或者`onRejected`函数，则会直接将值传递给后面的`then`方法

这个其实在规范里面也有提到

> 2.2.1 `onFulfilled` 和 `onRejected` 都是可选参数
> &nbsp;&nbsp;&nbsp;&nbsp; 2.2.1.1 如果 `onFulfilled` 不是函数，其必须被忽略
> &nbsp;&nbsp;&nbsp;&nbsp;  2.2.1.2 如果 `onRejected` 不是函数，其必须被忽略

所以在`then`方法的一开始，首先要对这两个函数做一些处理

```js
then(onFulfilled, onRejected) {

  // 判断 onFulfilled, onRejected 是否为函数，不是就重写为默认函数
  // onFulfilled 直接返回 value
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  // onRejected 直接抛出错误
  onRejected = typeof onRejected === 'function' ? onRejected : reason  => { throw reason }

  let promise2 = ...

  return promise2
}
```

到这里顺利完成一个简单的 `Promise`

## [[Resolve]](promise, x)

其实仔细一想，我们会发现，我们这样一直通过这些自测例子来写也不是一个好的办法
因为很多时候可能我们考虑的东西并不能面面俱到

好在在规范开头的一段介绍中，也就说了这个

> 本规范详细列出了 then 方法的执行过程，所有遵循 Promises/A+ 规范实现的 promise 均可以本标准作为参照基础来实施 then 方法。因而本规范是**十分稳定**的。尽管 Promise/A+ 组织有时可能会修订本规范，但主要是为了处理一些特殊的边界情况，且这些改动都是微小且向下兼容的。如果我们要进行大规模不兼容的更新，我们一定会在事先进行谨慎地考虑、详尽的探讨和严格的测试。

> 从历史上说，本规范实际上是把之前 Promise/A 规范 中的建议明确成为了行为标准：我们一方面扩展了原有规范约定俗成的行为，一方面删减了原规范的一些特例情况和有问题的部分。

也就是说，这个规范已经帮我们考虑很多的情况并且经过了严格的测试，我们只要能够依照规范描述的去写代码，就可以写出一个处理了各种情况的 `Promise`

前面我们提到，规范的 2.2.7.1 中有一个 [[Resolve]](promise2, x)

> 2.2.7.1 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：[[Resolve]](promise2, x)

而 2.2.7.2、 2.2.7.3、 2.2.7.4，其实我们已经通过暂时通过 `try...catch` 和 `resolve`、`reject` 函数实现了

但是其实关于这返回值`x`，其实规范中已经帮我们想好了，要通过这个 [[Resolve]](promise2, x) 函数来处理

也就是说，这个函数里面，其实就是用来处理各种情况的。那需要处理什么情况呢？规范里面也已经讲了

> 2.3
> 这种 thenable 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 Promise/A+ 协议的 then 方法即可；这同时也使遵循 Promise/A+ 规范的实现可以与那些不太规范但可用的实现能良好共存。

也就是说，我们实现的这个`Promise`，除了能够给我们自己使用，还要能够和其他的`Promise`类库兼容

比如这样的代码

```js
function a () {
  // 原生 ES6 Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ES6 Promise')
    }, 1000)
  })
}
function b () {
  // 自己实现的 Promise
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('MyPromise')
    }, 1000)
  })
}

a()
  .then(res => {
    return b()
  })
  .then(res => {
    console.log(res) // => MyPromise
  })
```

看起来好像很厉害，那么下面我们就来看看这个函数里面有什么奥秘

首先先把函数定义好，并且在与`x`相关的地方替换这个函数

```js
then(onFulfilled, onRejected) {

  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
  onRejected = typeof onRejected === 'function' ? onRejected : reason  => { throw reason }

  let promise2 = new MyPromise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      try {
        let x = onFulfilled(this.value)
        resolvePromise(promise2, x)
      } catch (e) {
        reject(e)
      }
    }

    if (this.status === 'rejected') {
      try {
        let x = onRejected(this.reason)
        resolvePromise(promise2, x)
      } catch(e) {
        reject(e)
      }
    }

    if (this.status === 'pending') {
      // this.onFulfilledCallback = onFulfilled 这样会无法传递 this.value值
      this.onFulfilledCallbacks.push(() => {
        try {
          let x = onFulfilled(this.value)
          resolvePromise(promise2, x)
        } catch (e) {
          reject(e)
        }
      })

      this.onRejectedCallbacks.push(() => {
        try {
          let x = onRejected(this.reason)
          resolvePromise(promise2, x)
        } catch (e) {
          reject(e)
        }
      })
    }
  })

  return promise2
}
```
```js
function resolvePromise (promise, x) {}
```

下面只需要专注于 `resolvePromise` 函数就可以了

规范中已经帮我们写好了这个函数里面的步骤
主要分三个大步骤

```js
function resolvePromise (promise, x) {
  // 2.3.1 promise 与 x 相等
  if (promise === x) {}

  // 2.3.2 x 为 Promise
  if (x instanceof MyPromise) {}

  // 2.3.3 x 为对象或者函数
  if (obj !== null && typeof obj === 'object' || typeof x === 'function') {}
}
```

先看 2.3.1

> 2.3.1 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise

也就是说，`promise === x` 的时候要抛出一个 `TypeError` 的错误，那错误的原因是什么呢？什么情况下能让`promise === x`呢？

其实，在`then`方法里面可以看到，当调用`resolvePromise`的时候，传递的第一个参数是`promise2`，也就是`then`方法的返回值
而 `x` 则是 `then`方法的第一个参数`onFulfilled`的返回值

也就是这样
```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}
let p1 = a()

let p2 = p1.then(res => {
  return p2
})
```

上面的代码在`ES6 Promise`下会报错：`Uncaught (in promise) TypeError: Chaining cycle detected for promise`

意思就是返回自己本身，会造成**循环引用自己**

这里可能有点绕，因为上面代码中，`p1.then()` 调用完后，返回的 `promise2` 是处于`pending`状态，
而这个`promise2`就赋值给了`let p2`，而1s之后，调用了`resolve`，也就调用了 `onFulfilledCallbacks` 里面事前存好的函数，也就是`p1.then()`的第一个参数`onFulfilled`函数，这个函数里面的返回值`x`就是`p2`，这个`p2`是前面`let p2`的`p2`，
所以这时候就是`promise2 === x`的情况，而这个`p2`又是处于`pending`状态，然后`p2`既不是一个新的`promise`，所以不会走构造函数里面的`resolve`使其变成`fulfilled`状态，也没有在其他任何地方对它进行`resolve`，所以会永远处于`pending`状态

那有人说那我再传个 `resolve` 函数进去不就行了吗？
```js
function resolvePromise (promise, x, resolve) {
  // 2.3.1 promise 与 x 相等
  if (promise === x) {
    resolve('xxx')
  }

  // 2.3.2 x 为 Promise
  if (x instanceof MyPromise) {}

  // 2.3.3 x 为对象或者函数
  if (obj !== null && typeof obj === 'object' || typeof x === 'function') {}
}
```
其实也不行的，因为这个`promise`，到这里还不知道这是我们自己的还是别人，不知道别人的实现里面有没有做这个处理，
所以在后面的 2.3.2 和 2.3.3 就已经有处理自己的`promise`和别人的`promise`，所以在这里只要老老实实跟着规范抛出个一个错误即可

```js
// 2.3.1 promise 与 x 相等
if (promise === x) {
  return reject(TypeError('循环引用了同一个 promise'))
}
// 由于需要把错误信息传到下一个 then 的 onRejected 函数中，所以我们干脆直接把 resolve 和 reject 函数都传进来
resolvePromise (promise, x, resolve, reject)
```

接下来看 2.3.2 x 为 Promise

> 2.3.2 如果 x 为 Promise ，则使 promise 接受 x 的状态 (注 3.4)
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.2.1 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.2.2 如果 x 处于执行态，用相同的值执行 promise
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.2.3 如果 x 处于拒绝态，用相同的据因拒绝 promise
>
> 3.4 总体来说，如果 x 符合当前实现，我们才认为它是真正的 promise 。这一规则允许那些特例实现接受符合已知要求的 Promises 状态

也就是说，到这里，我们则认为这个`x`是我们自己实现的`Promise`的实例

这里逻辑相对清晰

```js
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
```

下面看 2.3.3 x 为对象或者函数，这里也是最复杂的部分，顺便结合 2.3.4

> 2.3.3 x 为对象或者函数
>
> 2.3.3.1 把 x.then 赋值给 then
> 2.3.3.2 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
> 2.3.3.3 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.3.3.1 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.3.3.2 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
> &nbsp;&nbsp;&nbsp;&nbsp; 2.3.3.3.4 如果调用 then 方法抛出了异常 e：
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.3.3.3.4.1 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2.3.3.3.4.1 否则以 e 为据因拒绝 promise
> 2.3.3.4 如果 then 不是函数，以 x 为参数执行 promise
>
> 2.3.4 x 不为对象或者函数

代码大致如下

```js
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
```

接着运行这样的代码

```js
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}
function b () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('b')
    }, 1000)
  })
}
function c () {
  // ES6 Promise
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('c')
    }, 1000)
  })
}

a().then(res => {
  console.log(res)
  return b()
}).then(res => {
  console.log(res)
  return c()
}).then(res => {
  console.log(res)
})

// => a
// => b
// => c
```

结果是按顺序每隔1s打印出 `a` `b` `c`，和`ES6 Promise`的结合调用符合预期

那么到这里，我们基于一个`Promises/A+`规范的实现就完成了

## 扩展方法

接下来模拟`ES6 Promise`的一些其他方法

### `.catch`

最常用的 `.catch` 方法

```js
catch(onRejected) {
  return this.then(null, onRejected)
}

// 测试
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  console.log(res)
  throw Error('xxx')
}).catch(err => {
  console.log(err) // => Error: xxx
})
```

### `.finally` 方法

这个是 ES2018 引入的标准，用于指定不管 `Promise` 对象最后结果如何，都会执行

```js
class MyPromise {
  constructor(executor) {
    // ...
  }

  then(onFulfilled, onRejected) {
    // ...
  }

  catch(onRejected) {
    // ...
  }

  finally(onFinally) {
    return this.then(() => {
      onFinally()
    }, () => {
      onFinally()
    })
  }
}

function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}

a().then(res => {
  console.log(res)
  throw Error('xxx')
}).then(res => {

}).catch(err => {

}).finally(() => {
  console.log('finally')
})

// => a
// => finally
```

### `MyPromise.resolve()`

```js
class MyPromise {
  constructor(executor) {
    // ...
  }

  then(onFulfilled, onRejected) {
    // ...
  }

  catch(onRejected) {
    // ...
  }

  finally(onFinally) {
    // ...
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value))
  }
}

// 测试
MyPromise.resolve(1).then(res => {
  return res
}).then(res => {
  console.log(res)
})

// => ReferenceError: promise2 is not defined
```

我们会发现这里报了一个错误

其实是因为上面这个静态方法调用之后，里面的 `executor` 并不是异步执行的代码
导致在`then`方法里面需要使用到`promise2`的时候，这个`promise2`还没有被`return`出去

那怎么解决呢？其实规范里面也有提到解决办法

> 3.1
> 这里的平台代码指的是引擎、环境以及 promise 的实施代码。**实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。**这个事件队列可以采用“宏任务（macro-task）”机制或者“微任务（micro-task）”机制来实现。由于 promise 的实施代码本身就是平台代码（译者注：即都是 JavaScript），故代码自身在处理在处理程序时可能已经包含一个任务调度队列。

由于`ES6 Promise`的实现中，`Promise`是以微任务的形式进入任务队列的，而 [bluebird.js](https://github.com/petkaantonov/bluebird) 的这个库在浏览器使用的 [MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver) 来创建一个微任务，不兼容的话则会回退到使用`setTimeout`，在这里我们暂时先使用`setTimeout`简单实现一下

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

  // ...
  // ...
  // ...
}
```

现在再测试一下这一段代码，就可以成功打印出 `1` 了

```js
MyPromise.resolve(1).then(res => {
  return res
}).then(res => {
  console.log(res) // => 1
})
```

### `MyPromise.reject()`

这个和 `MyPromise.resolve()` 一样

```js

class MyPromise {
  constructor(executor) {
    // ...
  }

  then(onFulfilled, onRejected) {
    // ...
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    // ...
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }
}

// 测试
MyPromise.reject('err').catch(err => {
  console.log(err) // => 'err'
})

```

### `MyPromise.all()`

关键点已在注释中

```js
class MyPromise {
  constructor(executor) {
    // ...
  }

  then(onFulfilled, onRejected) {
    // ...
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    // ...
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
}

// 测试
function a () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}
function b () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('b')
      // reject('err b')
    }, 3000)
  })
}
function c () {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('c')
    }, 2000)
  })
}

MyPromise.all([a(), b(), c()]).then(res => {
  console.log(res) // [a, b, c]
}).catch(err => {
  console.log(err) // 其中一个改 reject 的话，走这里
})
```

### `MyPromise.race()`

```js
class MyPromise {
  constructor(executor) {
    // ...
  }

  then(onFulfilled, onRejected) {
    // ...
  }

  catch(onRejected) {
    return this.then(null, onRejected)
  }

  finally(onFinally) {
    // ...
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value))
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }

  static all (promises = []) {
    // ...
  }

  static race (promises = []) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        return reject('传入的参数应为一个数组')
      }
      let isDone = false
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
}

// 测试，自行调整前面 a b c 函数的状态
MyPromise.race([a(), b(), c()]).then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})
```

搞定！！

## 完整代码

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

module.exports = MyPromise
```

## 测试

最后可以使用 [promises-tests: Compliances tests for Promises/A+](https://github.com/promises-aplus/promises-tests) 这个测试套件来对自己写的这个 `Promise` 检测一下，暴露出一个 `deferred` 静态方法，并且以 `CommonJS` 模块方式导出即可

```js
static deferred() {
  var dfd = {}
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}


module.exports = MyPromise
```

## 总结

1. 学习了`Promise`的原理实现
2. 大致实现了一个`ES6 Promise`，三个原型方法和四个静态
3. 在使用测试套件测试的时候其实会遇到一些问题，只有通过不断阅读理解规范并且不断自测才能才能逐步发现问题，逐步修改
4. 估计还有很多细节性的判断尚未考虑周全，这里只有大致思路，细节再慢慢扣，比如使用 用 MutationObserver 把这个 Promise 改写成 micro-task
5. 还有没处理没有被 `Promise` 捕获的错误