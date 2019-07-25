function * fn () {
  let a = yield Promise.resolve(1)
  console.log('a', a)
  let b = yield Promise.resolve(2)
  console.log('b', b)
  return 3
}

// let it = fn()
// let { value } = it.next()
// value.then(res => {
//   let { value } = it.next(res)
//   value.then(res => {
//     let { value } = it.next(res)
//   })
// })

function co (it) {
  return new Promise((resolve, reject) => {
    function next(res) {
      let { value, done } = it.next(res)
      if (done) return resolve(value)
      value.then(res => {
        next(res)
      }, reject)
    }

    next()
  })
}

co(fn()).then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})

// callback 问题：1、回调地域，2、无法捕获错误（无法 try catch） 3、同步多个异步请求拿到最终的结果（需要计数器去实现，Promise.all 解决）

