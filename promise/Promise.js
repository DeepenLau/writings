class Promise {
  constructor(executor) {
    this.status = 'pending'
    this.reason = undefined // 成功后的值
    this.value = undefined  // 记录失败的原因
    this.onfulfilledCallbacks = [] // 收集成功的回调
    this.onrejectedCallbacks = []  // 收集失败的回调

    let resolve = value => {
      if (this.status === 'pending') {
        this.status = 'fulfilled' // 成功的时候改变状态
        this.value = value
        this.onfulfilledCallbacks.forEach(item => {
          item()
        })
      }
    }

    let reject = reason => {
      if (this.status === 'pending') {
        this.status = 'rejected' // 失败的时候改变状态
        this.reason = reason
        this.onrejectedCallbacks.forEach(item => {
          item()
        })
      }
    }

    try {
      //执行 执行器
      executor(resolve,reject);
    } catch (error) {
      reject(error)
    }
  }

  then(onfulfilled, onrejected) {
    let self = this
    onfulfilled = typeof onrejected === 'function' ? onfulfilled : val => val
    onrejected = typeof onrejected === 'function' ? onrejected : err => { throw err }

    let promise2 = new Promise((resolve, reject) => {
      if (this.status === 'fulfilled') {
        // 加入setTimeout 模拟异步
        // 如果调用 then 的时候 promise 的状态已经变成了 fulfilled 那么就调用成功回调，并且传递参数为成功的 value
        setTimeout(() => {
          try {
            // x 是执行成功的回调结果
            let x = onfulfilled(this.value)
            // 调用 resolvePromise函数 根据 x 的值 来决定 promise2 的状态
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }

      if (this.status === 'rejected') {
        setTimeout(() => {
          try {
            // x 是执行成功的回调结果
            let x = onrejected(this.reason)
            // 调用 resolvePromise函数 根据 x 的值 来决定 promise2 的状态
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }

      if (this.status === 'pending') {
        // 如果调用 then 的时候 promise 的状态还是 pending
        // 说明 promise 执行器内部的 resolve 或者 reject 是异步执行的
        // 那么就需要先把 then 方法中的成功回调和失败回调存储起来
        // 等待 promise 的状态改成 fulfilled 或者 rejected 的时候再按顺序执行相关回调

        this.onfulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              // x 是执行成功的回调结果
              let x = onfulfilled(this.value)
              // 调用 resolvePromise函数 根据 x 的值 来决定 promise2 的状态
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })

        this.onrejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              // x 是执行成功的回调结果
              let x = onrejected(this.reason)
              // 调用 resolvePromise函数 根据 x 的值 来决定 promise2 的状态
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })

    return promise2
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  // 如果是同一个引用，则循环引用
  if (promise2 === x) {
    return reject('typeError: 循环引用了')
  }

  let called

  if (x !== null && (typeof x === 'object') || typeof x === 'function') {
    // 如果 x 是一个或者函数 那么它就有可能是 promise 需要注意 null typeof 也是 object ，所以需要排除掉
    // 先获得 x 中的 then 如果这一步异常了，那么就直接把异常原因 reject 掉
    try {
      let then = x.then
      if (typeof then === 'function') {
        // 如果 then 是个函数 那么调用 then 并且把成功回调和失败回调传进去 如果 x 是一个 promise 并且最终状态是成功 那么
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, error => {
          if (called) return
          called = true
          reject(error)
        })
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
}

function a () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 1000)
  })
}
let p1 = a()

let p2 = p1.then(res => {
  console.log(res)
  return p2
})
p2.then(null, err => {
  console.log(err)
})