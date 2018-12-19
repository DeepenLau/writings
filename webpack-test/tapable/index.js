const {
  SyncHook,
  AsyncParallelHook
} = require('tapable')

class Car {
  constructor() {
    this.hooks = {
      accelerate: new SyncHook(['xx']),
      break: new SyncHook(),
      calculateRoutes: new AsyncParallelHook(['soucre', 'target', 'routesList'])
    }
  }
}

const car = new Car()

// car.hooks.break.tap('WarningLampPlugin', (...args) => {
//   console.log(args)
//   console.log('WarningLampPlugin')
// })
// car.hooks.accelerate.tap('LoggerPlugin', (...args) => {
//   console.log(args)
//   console.log(`LoggerPlugin ${args[0]}`)
// })
car.hooks.calculateRoutes.tapPromise('calculateRoutes tapPromise', (...args) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('tapPromise')
      console.log(args)
      resolve('sadf')
    }, 2000)
  })
})

// car.hooks.break.call()
// car.hooks.accelerate.call('asdjfkl')
car.hooks.calculateRoutes.promise(1,2,3).then((...args) => {
  console.log('then 之后')
  console.log(args)
})