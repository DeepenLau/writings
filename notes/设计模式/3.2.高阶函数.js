/**
 * 高阶函数是指至少满足下列条件之一的函数
 * - 函数可以作为参数被传递 - 如：回调函数
 * - 函数可以作为返回值输出 - 如：return function(){}
 */

// 高阶函数实现 AOP
// 都是指吧一个函数“动态织入”到另外一个函数之中
// 扩展 Function.prototype 举例子
Function.prototype.before = function(beforeFn) {
  // 保存原函数的引用
  var __self = this
  // 返回包含了原函数和新函数的“代理”函数
  return function() {
    // 执行新函数，修正 this
    beforeFn.apply(this, arguments)
    // 执行原函数
    return __self.apply(this. arguments)
  }
}

Function.prototype.after = function(afterFn) {
  var __self = this
  return function() {
    // 执行原函数
    var ret = __self.apply(this, arguments)
    // 执行新函数
    afterFn.apply(this, arguments)
    // 执行新函数返回原函数的值
    return ret
  }
}

var func = function() {
  console.log(2)
}

func = func.before(function() {
  console.log(1)
}).after(function() {
  console.log(3)
})

func()

/**
 * 函数柯里化（currying）
 * currying 又称部分求值，一个 currying 的函数首先会接受一些参数，接受了这些参数之后
 * 该函数并不会立即求值，而是继续返回另外一个函数，刚才传入的参数在函数形成闭包中被保存起来
 * 待到函数被真正需要求值的时候，之前传入的所有参数都会被一次性用于求值
 */
// 普通函数版
var cost = (function() {
  var args = []

  return function() {
    if (arguments.length === 0) {
      var money = 0
      for (var i = 0, l = args.length; i < l; i++) {
        money += args[i]
      }
      return money
    } else {
      [].push.apply(args, arguments)
    }
  }
})()

cost(100)
cost(100)
cost(100)

console.log(cost())


// currying 函数版
var currying = function(fn) {
  var args = []

  return function() {
    if (arguments.length === 0) {
      return fn.apply(this, args)
    } else {
      [].push.apply(args, arguments)
      return arguments.callee
    }
  }
}

var cost = (function(){
  var money = 0

  return function() {
    for (var i = 0, l = arguments.length; i < l; i++) {
      money += arguments[i]
    }
    return money
  }
})()

var cost = currying(cost)

cost(100)
cost(100)
cost(100)

console.log(cost())


// 利用 call, apply 调用本身不存在的，存在于别的对象的函数
var obj1 = {
  name: 'obj1 name'
}

var obj2 = {
  getName: function() {
    return this.name
  }
}

console.log(obj2.getName.call(obj1)) // obj1 name

/**
 * uncurrying
 * 不是很懂这个
 */
// 泛化 this 的过程叫 uncurrying ？

Function.prototype.uncurrying = function() {
  var self = this
  return function() {
    var obj = Array.prototype.shift.call(arguments)
    return self.apply(obj, arguments)
  }
}

var push = Array.prototype.push.uncurrying()
(function() {
  push(arguments, 4)
})(1,2,3)

// 上面这段报错了
// TypeError: Cannot assign to read only property 'length' of function 'function () {
//   push(arguments, 4)
//   console.log(arguments)
// }'

// uncurrying 另外一种实现
Function.prototype.uncurrying = function() {
  var self = this
  return function() {
    return Function.prototype.call.apply(self, arguments)
  }
}