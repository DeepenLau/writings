const http = require('http')
const EventEmitter = require('events')
const Stream = require('stream')

const context = require('./context')
const request = require('./request')
const response = require('./response')

class MyKoa extends EventEmitter {
  constructor() {
    super()
    this.middlewares = []

    this.context = context
    this.request = request
    this.response = response
  }

  use(fn) {
    this.middlewares.push(fn)
  }

  compose(middlewares, ctx) {
    function dispatch(index) {
      if (index === middlewares.length) return
      let currentFn = middlewares[index]
      // 这个 next 就是触发调用下一个中间件的函数
      try {
        const next = () => dispatch(index + 1)
        // 把当前中间件函数包一层 Promise
        return Promise.resolve(currentFn(ctx, next))
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }

  onerror(err) {
    console.error(err)
  }

  listen(...args) {
    const server = http.createServer(this.handleRequest.bind(this))
    server.listen(...args)
  }

  createContext(req, res) {
    const ctx = Object.create(this.context)
    const request = Object.create(this.request)
    const response = Object.create(this.response)

    ctx.request = request
    ctx.response = response
    // req, res 为原生对象
    // request, response 为自己定义的对象
    // 让自己的 request 和 response 的 req，res 都指向 原生req，res
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    return ctx
  }

  handleRequest(req, res) {
    res.statusCode = 404
    const ctx = this.createContext(req, res)
    const fn = this.compose(this.middlewares, ctx)

    fn.then(() => {
      if (typeof ctx.body == 'object') {
        res.setHeader('Content-Type', 'application/json;charset=utf8')
        res.end(JSON.stringify(ctx.body))
      } else if (ctx.body instanceof Stream){ // 如果是流
        ctx.body.pipe(res)
      } else if (typeof ctx.body === 'string' || Buffer.isBuffer(ctx.body)) {
        res.setHeader('Content-Type', 'text/html;charset=utf8')
        res.end(ctx.body)
      } else {
        res.end('Not found')
      }
    })
  }
}

module.exports = MyKoa