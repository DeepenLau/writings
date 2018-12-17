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

function a() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}
function b() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('b')
      // reject('err b')
    }, 3000)
  })
}
function c() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('c')
    }, 2000)
  })
}

// a().then(res => {
//   return b()
// }).then(res => {

// }).catch(err => {
//   console.log(err)
// })

// MyPromise.race([a(), b(), c()]).then(res => {
//   console.log(res)
// }).catch(err => {
//   console.log(err)
// })

setTimeout(() => {
  console.log(3)
})
new MyPromise(resolve => {
  console.log(1)
  resolve()
}).then(() => {
  console.log(2)
})

// p1.then(() => {
//   console.log(5)
//   return 6
// }).then(res => {
//   console.log(res)
// })



// node.js
// setImmediate(function(){
//   console.log(1);
// },0);
// setTimeout(function(){
//   console.log(2);
// },0);
// new Promise(function(resolve){
//   console.log(3);
//   resolve();
//   console.log(4);
// }).then(function(){
//   console.log(5);
// });
// console.log(6);
// process.nextTick(function(){
//   console.log(7);
// });
// console.log(8);

