---
title: 循环 + 顺序 + 重发 + 延迟的Promise
date: 2017-11-23 15:34:30
tag: es6 promise
desc: 关于 promise 的骚操作
---

# 循环 + 顺序 + 重发 + 延迟 的 Promise

> 最近接到一个需求：希望能循环 执行 promise ，成功了一个自动执行下一个 promise，失败了重新执行上一次，重试有两次机会，两次都失败，退出进程

说干就干

查了一下原生的 ES6 Promise ，发现并没有这种顺序执行的机制，那就自己研究一下

## 循环 + 顺序

期望的调用方式

```js
const p1 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      console.log('p1')
      resolve('p1')
    }, 3000) // 3s
  })
}

const p2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      console.log('p2')
      resolve('p2')
    }, 2000) // 2s
  })
}

const p3 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      console.log('p3')
      resolve('p3')
    }, 1000) // 1s
  })
}

let PromiseTasks = [p1, p2, p3]

function sequenceTasks (tasks) {
  // ...
}

const main = () => {
  return sequenceTasks(PromiseTasks)
}

main()

// 期望结果:
// 3秒后          --> p1
// 5(3+2)秒后     --> p2
// 6(3+2+1)秒后   --> p3
```

接下来就是处理这个 sequenceTasks 的时候了

第一版：

```js

function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  return tasks[0]()
          .then(pushValue)
          .then(tasks[1])
          .then(pushValue)
          .then(tasks[2])
          .then(pushValue)
}

```

使用这种写法的话那么随着 PromiseTasks 中元素数量的增加，我们也需要不断增加手动对 then 方法的调用，要是 PromiseTasks 中的元素是不确定的，那就很麻烦了

第二版：用 for 循环改造一下

```js
function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  let promise = Promise.resolve()
  // 开始的地方
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i]
    promise = promise.then(task).then(pushValue)
  }
  return promise
}
```

使用for循环的时候，每次调用 Promise#then 方法都会返回一个新的 promise 对象。

因此类似 promise = promise.then(task).then(pushValue); 的代码就是通过不断对promise进行处理，不断的覆盖 promise 变量的值，以达到对promise对象的累积处理效果。

但是这种方法需要 promise 这个临时变量，从代码质量上来说显得不那么简洁。

如果将这种循环写法改用 Array.prototype.reduce 的话，那么代码就会变得聪明多了。

第三版：用 Array.prototype.reduce 循环改造一下

> [点击学习 MDN 的 reduce](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
> [点击学习凹凸实验室的 reduce](https://aotu.io/notes/2016/04/14/js-reduce/index.html)

```js

function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

```

Array.prototype.reduce 的第二个参数用来设置盛放计算结果的初始值。在这个例子中， Promise.resolve() 会赋值给 promise ，此时的 task 为 request.comment 。

在reduce中第一个参数中被 return 的值，则会被赋值为下次循环时的 promise 。也就是说，通过返回由 then 创建的新的promise对象，就实现了和for循环类似的 Promise chain 了。

> **需要注意的一点是，和 Promise.all 等不同，这个函数接收的参数是一个函数的数组。**
> **为什么传给这个函数的不是一个promise对象的数组呢？这是因为promise对象创建的时候，p1,p2,p3 中的异步代码（例如 XHR）已经开始执行了，因此再对这些promise对象进行顺序处理的话就不能正常工作了。**

以上是基于全部走 resolve 的时候，所以现在要实现一个走 reject 的话，需要重新调用自己，类似重发的机制

## 循环 + 顺序 + 重发

```js

const p1 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      console.log('p1')
      resolve('p1')
    }, 3000) // 3s
  })
}

const p2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      // 用 0 ~ 9 的随机数来模拟失败
      if (~~(Math.random() * 10) >= 5) {
        console.log('错误p2')
        reject(Error('错误'))
        return
      }
      console.log('p2')
      resolve('p2')
    }, 2000) // 2s
  }).catch(() => {
    return p2()
  })
}

const p3 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      console.log('p3')
      resolve('p3')
    }, 1000) // 1s
  })
}

let PromiseTasks = [p1, p2, p3]

function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

const main = () => {
  return sequenceTasks(PromiseTasks)
}

main()

// 结果：
// p1
// 错误p2
// 错误p2
// 错误p2
// p2
// p3
```

从结果看来，对于失败的 p2 来说，是 p2 的 catch 中递归调用自己，就可以实现重发的效果，由于上面设置概率，所以无限重发 p2，直至成功。

因为每一个异步请求失败了可能要重发的逻辑也不一样，所以只要在自己本身  catch 做重发处理就好

那这样我们可以简化一下那几个 p1,p2,p3

```js

let count = 1
const p = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      // 用 0 ~ 9 的随机数来模拟失败
      if (~~(Math.random() * 10) >= 5) {
        console.log(`错误p${count}`)
        reject(Error(`错误p${count}`))
        return
      }
      console.log(`成功p${count}`)
      resolve(`成功p${count}`)
      count++
    }, 3000) // 3s
  }).catch(() => {
    return p()
  })
}

let PromiseTasks = []
for (let i = 1; i < 5; i++) {
  PromiseTasks.push(p)
}

function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

const main = () => {
  return sequenceTasks(PromiseTasks)
}

main()

// 结果：每一个 promise 失败了都会无限重发，直到成功

```

根据需求，失败需要限制一个最大次数

```js

let count = 1
const p = () => {
  let maxRetry = 2
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      // 用 0 ~ 9 的随机数来模拟失败
      if (~~(Math.random() * 10) >= 5) {
        console.log(`错误p${count}`)
        reject(Error(`错误p${count}`))
        return
      }
      console.log(`成功p${count}`)
      resolve(`成功p${count}`)
      count++
    }, 3000) // 3s
  }).catch((err) => {
    console.log(maxRetry)
    if (maxRetry <= 0) {
      return Promise.reject(err)
    }
    maxRetry--
    return p()
  })
}

// 结果：maxRetry 打印出来永远是 2

```
这样的结果就不符合预期了，因为在 catch 里面调用 `p()` 的时候，maxRetry 永远会被初始化为 2，所以我们有两个方法去解决这个问题

```js
// 方法一：把 maxRetry 放到函数外面，在 p 函数里面每次成功都重置

let count = 1
let maxRetry = 2
const p = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // setTimeout 模拟异步
      // 用 0 ~ 9 的随机数来模拟失败
      if (~~(Math.random() * 10) >= 5) {
        console.log(`错误p${count}`)
        reject(Error(`错误p${count}`))
        return
      }
      console.log(`成功p${count}`)
      resolve(`成功p${count}`)
      count++
      maxRetry = 2
    }, 3000) // 3s
  }).catch((err) => {
    console.log(maxRetry)
    if (maxRetry <= 0) {
      return Promise.reject(err)
    }
    maxRetry--
    return p()
  })
}

// 方法二：在 p 里面再声明一个函数

let count = 1

const p = () => {
  let maxRetry = 2

  return asyncFunc()

  function asyncFunc () {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // setTimeout 模拟异步
        // 用 0 ~ 9 的随机数来模拟失败
        if (~~(Math.random() * 10) >= 5) {
          console.log(`错误p${count}`)
          reject(Error(`错误p${count}`))
          return
        }
        console.log(`成功p${count}`)
        resolve(`成功p${count}`)
        count++
      }, 3000) // 3s
    }).catch((err) => {
      console.log(maxRetry)
      if (maxRetry <= 0) {
        return Promise.reject(err)
      }
      maxRetry--
      return asyncFunc()
    })
  }
}

```
方法一是把 maxRetry 放到全局进行统一控制，需要注意重置时机

方法二是把 maxRetry 放到 `p` 函数里面单独控制

到这里我们就实现可以 ***循环 + 顺序 + 重发*** 的函数

```js
// 完整代码

let count = 1

const p = () => {
  let maxRetry = 2

  return asyncFunc()

  function asyncFunc () {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // setTimeout 模拟异步
        // 用 0 ~ 9 的随机数来模拟失败
        if (~~(Math.random() * 10) >= 5) {
          console.log(`错误p${count}`)
          reject(Error(`错误p${count}`))
          return
        }
        console.log(`成功p${count}`)
        resolve(`成功p${count}`)
        count++
      }, 3000) // 3s
    }).catch((err) => {
      console.log(`p${count}的剩余重发次数：${maxRetry}`)
      if (maxRetry <= 0) {
        return Promise.reject(err)
      }
      maxRetry--
      return asyncFunc()
    })
  }
}

let PromiseTasks = []
for (let i = 1; i < 5; i++) {
  PromiseTasks.push(p)
}

function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  return tasks.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

const main = () => {
  return sequenceTasks(PromiseTasks)
}

main().then(results => {
  console.log(results)
}).catch(err => {
  console.log(err)
})
```


## 小结

为了实现顺序处理，我们也对从过程风格的编码方式到自定义顺序处理函数的方式等实现方式进行了介绍，也再次强调了在Promise领域我们应遵循将处理按照函数进行划分的基本原则。

在Promise中如果还使用了Promise chain将多个处理连接起来的话，那么还可能使源代码中的一条语句变得很长。

这时候如果我们回想一下这些编程的基本原则进行函数拆分的话，代码整体结构会变得非常清晰。

此外,Promise的构造函数以及 then 都是高阶函数，如果将处理分割为函数的话，还能得到对函数进行灵活组合使用的副作用，意识到这一点对我们也会有一些帮助的。

## 循环 + 顺序 + 重发 + 延迟

> 写着写着，突发奇想想要多加一个 ***延迟*** 的效果

### 循环 + 延迟

先来个简单的延迟函数

```js
const delay = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('间隔延迟的时间：' + time + 'ms')
      resolve()
    }, time)
  })
}

delay(2*1000).then(() => {
  console.log('hi1')
  return delay(2*1000)
}).then(() => {
  console.log('hi2')
  return delay(2*1000)
}).then(() => {
  console.log('hi3')
})

// 结果:
// 间隔延迟的时间：2000ms
// hi1
// 间隔延迟的时间：2000ms
// hi2
// 间隔延迟的时间：2000ms
// hi3
```

从结果可以看出，每隔 2s 执行一个 promise ，也就是 **串行+每次都延时**

现在加点循环，变成 **串行 + 每次都延时 + 循环**

```js

let p = delay(2*1000)
for (let i=0; i < 5; i++) {
  p = p.then(function() {
    console.log('hi')
    return delay(1*10)
  })
}

// 结果：
// 间隔延迟的时间：2000ms
// hi
// 间隔延迟的时间：10ms
// hi
// 间隔延迟的时间：10ms
// hi
// 间隔延迟的时间：10ms
// hi
// 间隔延迟的时间：10ms
// hi
// 间隔延迟的时间：10ms

```
那现在我们把这个 **串行 + 每次都延时 + 循环** 的功能结合到上面的 `sequenceTasks()` 函数中

```js

const delay = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('间隔延迟的时间：' + time + 'ms')
      resolve()
    }, time)
  })
}

let count = 1

const p = () => {
  let maxRetry = 2

  return asyncFunc()

  function asyncFunc () {
    return new Promise((resolve, reject) => {
      setTimeout(() => { // setTimeout 模拟异步
        // 用 0 ~ 9 的随机数来模拟失败
        if (~~(Math.random() * 10) >= 5) {
          console.log(`错误p${count}`)
          reject(Error(`错误p${count}`))
          return
        }
        console.log(`成功p${count}`)
        resolve(`成功p${count}`)
        count++
      }, 3000) // 3s
    }).catch((err) => {
      console.log(`p${count}的剩余重发次数：${maxRetry}`)
      if (maxRetry <= 0) {
        return Promise.reject(err)
      }
      maxRetry--
      return asyncFunc()
    })
  }
}

let PromiseTasks = []
for (let i = 1; i < 5; i++) {
  PromiseTasks.push(p)
}

function sequenceTasks (tasks) {
  // 初始化
  let results = []
  function pushValue(value) {
    results.push(value)
    return results
  }

  return tasks.reduce((promise, task) => {
    return promise.then(() => delay(2000)).then(task).then(pushValue)
  }, Promise.resolve())
}

const main = () => {
  return sequenceTasks(PromiseTasks)
}

main().then(results => {
  console.log(results)
}).catch(err => {
  console.log(err)
})

// 结果：
// 间隔延迟的时间：2000ms
// 错误p1
// p1的剩余重发次数：2
// 成功p1
// 间隔延迟的时间：2000ms
// 错误p2
// p2的剩余重发次数：2
// 错误p2
// p2的剩余重发次数：1
// 成功p2
// 间隔延迟的时间：2000ms
// 错误p3
// p3的剩余重发次数：2
// 成功p3
// 间隔延迟的时间：2000ms
// 错误p4
// p4的剩余重发次数：2
// 成功p4
// [ '成功p1', '成功p2', '成功p3', '成功p4' ]

```
到这里，我们基本实现了 循环 + 顺序 + 重发 + 延迟 的 primose，在这当中，应该还回有让代码更简洁，更健壮的方法（比如使用 async/await 语法），有待时间去验证。

## 参考文献
[http://liubin.org/promises-book/#promise-sequence](http://liubin.org/promises-book/#promise-sequence)
[https://my.oschina.net/letiantian/blog/744509](https://my.oschina.net/letiantian/blog/744509)