try {
  module.exports = Promise
} catch (e) {}

function Promise(executor) {
  var self = this

  self.status = 'pending'
  self.onResolvedCallback = []
  self.onRejectedCallback = []

  function resolve(value) {
    // if (value instanceof Promise) {
    //   return value.then(resolve, reject)
    // }
    setTimeout(function() { // 异步执行所有的回调函数
      if (self.status === 'pending') {
        self.status = 'resolved'
        self.data = value
        for (var i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback[i](value)
        }
      }
    })
  }

  function reject(reason) {
    setTimeout(function() { // 异步执行所有的回调函数
      if (self.status === 'pending') {
        self.status = 'rejected'
        self.data = reason
        for (var i = 0; i < self.onRejectedCallback.length; i++) {
          self.onRejectedCallback[i](reason)
        }
      }
    })
  }

  try {
    executor(resolve, reject)
  } catch (reason) {
    reject(reason)
  }
}

function resolvePromise(promise2, x, resolve, reject) {


  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if (x instanceof Promise) {
    if (x.status === 'pending') {
      x.then((v) => {
        resolvePromise(promise2, v, resolve, reject)
      }, reject)
    }

    if (x.status === 'resolved') {
      resolve(x.data)
    }

    if (x.status === 'rejected') {
      reject(x.data)
    }

    return

  }

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
          resolvePromise(promise2, y, resolve, reject)
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

// Promise.prototype.then = function(onResolved, onRejected) {
//   onResolved = typeof onResolved === 'function' ? onResolved : value => value
//   onRejected = typeof onRejected === 'function' ? onRejected : reason  => { throw reason }

//   let self = this
//   let promise2 = new Promise((resolve, reject) => {

//     if (self.status === 'resolved') {
//       // 包一层 setTimeout 进入 macro-task
//       // TODO 用 MutationObserver 改写成 micro-task
//       setTimeout(() => {
//         try {
//           let x = onResolved(self.value)
//           resolvePromise(promise2, x, resolve, reject)
//         } catch (e) {
//           reject(e)
//         }
//       })
//     }

//     if (self.status === 'rejected') {
//       setTimeout(() => {
//         try {
//           let x = onRejected(self.reason)
//           resolvePromise(promise2, x, resolve, reject)
//         } catch(e) {
//           reject(e)
//         }
//       })
//     }

//     if (self.status === 'pending') {
//       // this.onResolvedCallback = onResolved 这样会无法传递 this.value值
//       self.onResolvedCallback.push((value) => {
//           try {
//             let x = onResolved(value)
//             resolvePromise(promise2, x, resolve, reject)
//           } catch (e) {
//             reject(e)
//           }
//       })

//       self.onRejectedCallback.push((reason) => {
//           try {
//             let x = onRejected(reason)
//             resolvePromise(promise2, x, resolve, reject)
//           } catch (e) {
//             reject(e)
//           }
//       })
//     }
//   })

//   return promise2
// }
Promise.prototype.then = function(onResolved, onRejected) {
  var self = this
  var promise2
  onResolved = typeof onResolved === 'function' ? onResolved : function(v) {
    return v
  }
  onRejected = typeof onRejected === 'function' ? onRejected : function(r) {
    throw r
  }

  if (self.status === 'resolved') {
    return promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() { // 异步执行onResolved
        try {
          var x = onResolved(self.data)
          resolvePromise(promise2, x, resolve, reject)
        } catch (reason) {
          reject(reason)
        }
      })
    })
  }

  if (self.status === 'rejected') {
    return promise2 = new Promise(function(resolve, reject) {
      setTimeout(function() { // 异步执行onRejected
        try {
          var x = onRejected(self.data)
          resolvePromise(promise2, x, resolve, reject)
        } catch (reason) {
          reject(reason)
        }
      })
    })
  }

  if (self.status === 'pending') {
    // 这里之所以没有异步执行，是因为这些函数必然会被resolve或reject调用，而resolve或reject函数里的内容已是异步执行，构造函数里的定义
    return promise2 = new Promise(function(resolve, reject) {
      self.onResolvedCallback.push(function(value) {
        try {
          var x = onResolved(value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (r) {
          reject(r)
        }
      })

      self.onRejectedCallback.push(function(reason) {
          try {
            var x = onRejected(reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (r) {
            reject(r)
          }
        })
    })
  }
}

Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}

Promise.deferred = Promise.defer = function() {
  var dfd = {}
  dfd.promise = new Promise(function(resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}


function a () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}
function b () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('b')
    }, 2000)
  })
}

a().then(res => {
  console.log(res)
  return b()
}).then(res => {
  console.log(res)
})