'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MyPromise = function () {
  function MyPromise(executor) {
    var _this = this;

    _classCallCheck(this, MyPromise);

    this.status = 'pending'; // pending, fulfilled, or rejected
    this.value; // fulfilled 的值
    this.reason; // rejected 的原因

    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    var resolve = function resolve(value) {
      _this.status = 'fulfilled';
      _this.value = value;
      _this.onFulfilledCallbacks.forEach(function (cb) {
        return cb();
      });
    };
    var reject = function reject(reason) {
      _this.status = 'rejected';
      _this.reason = reason;
      _this.onRejectedCallbacks.forEach(function (cb) {
        return cb();
      });
    };
    // executor 传进来的 回调函数，要传 resolve, reject 两个函数类型的参数给它
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  _createClass(MyPromise, [{
    key: 'then',
    value: function then(onFulfilled, onRejected) {
      var _this2 = this;

      onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (value) {
        return value;
      };
      onRejected = typeof onRejected === 'function' ? onRejected : function (reason) {
        throw reason;
      };

      var promise2 = new MyPromise(function (resolve, reject) {

        if (_this2.status === 'fulfilled') {
          // 包一层 setTimeout 进入 macro-task
          // TODO 用 MutationObserver 改写成 micro-task
          setTimeout(function () {
            try {
              var x = onFulfilled(_this2.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }

        if (_this2.status === 'rejected') {
          setTimeout(function () {
            try {
              var x = onRejected(_this2.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        }

        if (_this2.status === 'pending') {
          // this.onFulfilledCallback = onFulfilled 这样会无法传递 this.value值
          _this2.onFulfilledCallbacks.push(function () {
            setTimeout(function () {
              try {
                var x = onFulfilled(_this2.value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            });
          });

          _this2.onRejectedCallbacks.push(function () {
            setTimeout(function () {
              try {
                var x = onRejected(_this2.reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            });
          });
        }
      });

      return promise2;
    }
  }, {
    key: 'catch',
    value: function _catch(onRejected) {
      return this.then(null, onRejected);
    }
  }, {
    key: 'finally',
    value: function _finally(onFinally) {
      return this.then(function () {
        onFinally();
      }, function () {
        onFinally();
      });
    }
  }], [{
    key: 'resolve',
    value: function resolve(value) {
      return new MyPromise(function (resolve) {
        return resolve(value);
      });
    }
  }, {
    key: 'reject',
    value: function reject(reason) {
      return new MyPromise(function (resolve, reject) {
        return reject(reason);
      });
    }
  }, {
    key: 'all',
    value: function all() {
      var promises = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return new MyPromise(function (resolve, reject) {
        if (!Array.isArray(promises)) {
          return reject('传入的参数应为一个数组');
        }

        var results = [];
        var count = 0;
        promises.forEach(function (promise, index) {
          promise.then(function (res) {
            // 这里不能用 results.push，要传入的位置和结果的位置一致
            results[index] = res;
            // 使用 count 变量来记录当前已经 resolved 的个数
            count++;
            if (count === promises.length) {
              resolve(results);
            }
          }).catch(function (err) {
            reject(err);
          });
        });
      });
    }
  }, {
    key: 'race',
    value: function race() {
      var promises = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      return new MyPromise(function (resolve, reject) {
        if (!Array.isArray(promises)) {
          return reject('传入的参数应为一个数组');
        }
        var isDone = false;
        // Promise.race([p1, p2, p3])里面哪个结果获得的快，就返回那个结果，不管结果本身是成功状态还是失败状态。
        promises.forEach(function (promise) {
          promise.then(function (res) {
            if (isDone) return;

            resolve(res);
          }).catch(function (err) {
            if (isDone) return;
            reject(err);
          }).finally(function () {
            isDone = true;
          });
        });
      });
    }
  }, {
    key: 'done',
    value: function done() {
      return new MyPromise(function () {});
    }
  }]);

  return MyPromise;
}();

function resolvePromise(promise, x, resolve, reject) {

  // 2.3.1 promise 与 x 相等
  if (promise === x) {
    return reject(TypeError('循环引用了同一个 promise'));
  }

  // 2.3.2 x 为 Promise
  if (x instanceof MyPromise) {
    if (x.status === 'pending') {
      x.then(function (value) {
        resolve(value);
      }, function (reason) {
        reject(reason);
      });
    }

    if (x.status === 'fulfilled') {
      resolve(x.value);
    }

    if (x.status === 'rejected') {
      reject(x.reason);
    }

    return;
  }

  // 2.3.3  x 为对象或者函数
  if (x !== null && (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' || typeof x === 'function') {
    var then = void 0;
    var called = false; // // 2.3.3.3.3 结合下面看 called = true 的位置

    try {
      then = x.then; // 2.3.3.1
    } catch (e) {
      return reject(e); // 2.3.3.2
    }

    if (typeof then === 'function') {
      // 2.3.3.3
      try {
        then.call(x, function (y) {
          // 2.3.3.3.1
          if (called) return;
          called = true;
          resolvePromise(promise, y, resolve, reject);
        }, function (r) {
          // // 2.3.3.3.2
          if (called) return;
          called = true;
          reject(r);
        });
      } catch (e) {
        // 2.3.3.3.4
        if (called) return; // 2.3.3.3.4.1
        called = true;
        reject(e); // // 2.3.3.3.4.2
      }
    } else {
      // 2.3.3.4
      resolve(x);
    }
  } else {
    // 2.3.4 x 不为对象或者函数
    resolve(x);
  }
}

module.exports = MyPromise;