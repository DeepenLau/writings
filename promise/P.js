class P {
  constructor(executor) {
    this.status = 'pending' // pending, fulfilled, or rejected. // 挂载 this 上有可能会在外部被改动
    this.value
    this.reason
    this.onResolvedCallback = []
    this.onRejectedCallback = []

    let resolve = value => {
      setTimeout(() => {
        if (this.status === 'pending') {
          this.status = 'fulfilled'
          this.value = value
          this.onResolvedCallback.forEach(cb => {
            cb(value)
          })
        }
      }, 0)
    }

    let reject = reason => {
      setTimeout(() => {
        if (this.status === 'pending') {
          this.status = 'rejected'
          this.reason = reason
          this.onRejectedCallback.forEach(cb => {
            cb(reason)
          })
        }
      }, 0)
    }

    try { // 考虑到执行executor的过程中有可能出错，所以我们用try/catch块给包起来，并且在出错后以catch到的值reject掉这个Promise
      executor(resolve, reject) // 执行executor
    } catch(e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason  => { throw reason }

    let promise2

    if (this.status === 'fulfilled') {
      return promise2 = new P((resolve, reject) => {
        setTimeout(() => {
          try {
            // 如果 onFulfilled 的返回值是一个 Promise 对象，直接取它的结果作为 promise2 的结果
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
    }

    if (this.status === 'rejected') {
      return promise2 = new P((resolve, reject) => {
        setTimeout(() => {
          try {
            // 如果 onFulfilled 的返回值是一个 Promise 对象，直接取它的结果作为 promise2 的结果
            let x = onRejected(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      })
    }

    if (this.status === 'pending') {
      // 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，
      // 只能等到Promise的状态确定后，才能确实如何处理。
      // 所以我们需要把我们的**两种情况**的处理逻辑做为callback放入promise1(此处即this/self)的回调数组里
      // 逻辑本身跟第一个if块内的几乎一致，此处不做过多解释

      // 这里之所以没有异步执行，是因为这些函数必然会被resolve或reject调用，而resolve或reject函数里的内容已是异步执行，构造函数里的定义
      return promise2 = new P((resolve, reject) => {
        this.onResolvedCallback.push(value => {
          try {
            var x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
        this.onRejectedCallback.push(reason => {
          try {
            var x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })

      })
    }

    return promise2
  }

  catch (onRejected) {
    return this.then(null, onRejected)
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  var then
  var thenCalledOrThrow = false

  if (promise2 === x) { // 对应标准2.3.1节
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if (x instanceof P) { // 对应标准2.3.2节
    // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
    // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
    if (x.status === 'pending') {
      x.then(function(value) {
        resolvePromise(promise2, value, resolve, reject)
      }, reject)
    } else { // 但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值，而不是一个thenable，所以这里直接取它的状态
      x.then(resolve, reject)
    }
    return
  }

  if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) { // 2.3.3
    try {

      // 2.3.3.1 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // 即要判断它的类型，又要调用它，这就是两次读取
      then = x.then
      if (typeof then === 'function') { // 2.3.3.3
        then.call(x, function rs(y) { // 2.3.3.3.1
          if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
          thenCalledOrThrow = true
          return resolvePromise(promise2, y, resolve, reject) // 2.3.3.3.1
        }, function rj(r) { // 2.3.3.3.2
          if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
          thenCalledOrThrow = true
          return reject(r)
        })
      } else { // 2.3.3.4
        resolve(x)
      }
    } catch (e) { // 2.3.3.2
      if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
      thenCalledOrThrow = true
      return reject(e)
    }
  } else { // 2.3.4
    resolve(x)
  }
}

function a () {
  return new P((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 2000)
  })
}
function b () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('b')
      // reject('err')
    }, 2000)
  })
}


let p1 = a()

let p2 = p1.then(res => {
  console.log(res)
  return p2
})

// new P(resolve=>resolve(8))
//   .then()
//   .catch(e => {
//     return e
//   })
//   .then(function foo(value) {
//     alert(value)
//   })