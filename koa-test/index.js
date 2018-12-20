const MyKoa = require('./mykoa/application')
// const MyKoa = require('Koa')
const app = new MyKoa()

// app.use((ctx, next) => {
//   console.log(1)
//   next()
//   console.log(2)
// })
// app.use((ctx, next) => {
//   console.log(3)
//   next()
//   console.log(4)
// })
// app.use((ctx, next) => {
//   console.log(5)
//   next()
//   console.log(6)
// })

app.use(async (ctx, next) => {
  console.log(1)
  await next()
  console.log(2)
})
app.use(async (ctx, next) => {
  console.log(3)
  let p = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('3.5')
      // reject('中间件报错')
      resolve()
    }, 1000)
  })
  await p.then()
  await next()
  console.log(4)
})

app.use((ctx, next) => {
  ctx.body = 'hello world 信息'
})

app.listen(3000)
