const MyPromise = require('./P2')

module.exports = {
  // resolved(value) {},
  // rejected(reason) {},
  deferred() {
    var dfd = {}
    dfd.promise = new MyPromise((resolve, reject) => {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
  }
}

// Promise.deferred = Promise.defer = function() {
//   var dfd = {}
//   dfd.promise = new Promise(function(resolve, reject) {
//     dfd.resolve = resolve
//     dfd.reject = reject
//   })
//   return dfd
// }