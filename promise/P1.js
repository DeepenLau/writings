class Promise1 {
  constructor (executor) {
    this.value
    this.reason
    this.status = 'pending'
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    let resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'fulfilled'
        this.value = value
        this.onFulfilledCallbacks.forEach(cb => cb(this.value))
      }
    }

    let reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(cb => cb(this.reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  /**
   * Promise 的 then 方法
   * @param {Function} onFulfilled
   * @param {Function} onRejected
   */
  then(onFulfilled, onRejected) {

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        let x = onFulfilled(this.value)
        resolvePromise(promise2, x, resolve, reject)
      }
      if (this.status === 'rejected') {
        let x = onRejected(this.reason)
        resolvePromise(promise2, x, resolve, reject)
      }

      if (this.status === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          let x = onFulfilled(this.value)
          resolvePromise(promise2, x, resolve, reject)
        })
        this.onRejectedCallbacks.push(() => {
          let x = onRejected(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        })
      }
    })

    return promise2
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  var then
  var thenCalledOrThrow = false

  if (promise2 === x) { // 对应标准2.3.1节
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if (x instanceof Promise) { // 对应标准2.3.2节
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

// function resolvePromise(promise2, x, resolve, reject) {
//   if (promise2 === x) {
//     // 返回了自己本身，没有人调用自己的 resolve 或者 reject 方法
//     return reject(TypeError('循环引用'))
//   }
//   if (x instanceof P) {
//     if (x.status === 'pending') {
//       x.then(resolve, reject)
//     } else {

//     }
//     return
//   }

//   if (typeof x === 'object' ) {
//     x.then(resolve, reject)
//   } else {
//     resolve(x)
//   }
// }

function a () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('a1')
    }, 1000)
  })
}
function b () {
  return new Promise((resolve, reject) => {
    resolve('b')
  })
}

let p1 = a()

let p2 = p1.then(res => {
  console.log(res)
  return p2
})