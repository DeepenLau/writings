/**
 * this 的指向大只可以分为以下4种
 * - 作为对象方法调用
 * - 作为普通函数调用
 * - 构造器调用
 * - Function.prototype.call 或 Function.prototype.apply 调用
 */

//  1. 作为对象方法调用
//  当函数作为对象的方法被调用时，this 指向该对象
var obj = {
  a: 1,
  getA: function() {
    console.log(this === obj) // true
    console.log(this.a)       // 1
  }
}

// 2. 作为普通函数调用
// 当函数不作为对象的属性被调用时，也就是我们常说的 普通函数方法
// 此时的 this 总是指向全局对象。
// 在浏览器里，这个全局对象是 window 对象
window.name = 'globalName'

var getName = function () {
  return this.name
}

console.log( getName() ) // globalName

// =======
window.name = 'globalName'
var o = {
  name: 'sven',
  getName: function() {
    return this.name
  }
}
var getName = o.getName

// o.getName 赋予了 getName ，调用 getName 不是在 o 对象下，而是作为了普通函数
console.log(getName()) // globalName

// ========
// 严格模式下，全局普通函数调用 ，this 指向 undefined
function func() {
  'use strict'
  console.log(this) // undefined
}


// 3. 构造器调用（new）
// 当 new 运算符调用函数时，该函数总会返回一个对象
// 通常情况下，构造器里的 this 就指向返回的这个对象
var MyClass = function() {
  this.name = 'sven'
}

var obj = new MyClass()

obj.name // sven

// 用 new 调用构造器时，如果构造器显示地返回一个 object 类型的对象
// 那么此次运算结果最终返回这个对象，而不是我们之前期待的 this
var MyClass = function() {
  this.name = 'sven'
  return {
    name: 'anne'
  }
}

var obj = new MyClass()

obj.name // anne

// 如果构造器不显式地返回任何数据，或者是返回一个非对象类型的数据，就不会造成上述问题
var MyClass = function() {
  this.name = 'sven'
  return 'anne'
}

var obj = new MyClass()

obj.name // sven



/**
 * 当使用 call 或者 apply 的时候，如果我们传入的第一个参数为 null
 * 函数体内的 this 会指向默认的宿主环境，在浏览器中则是 window
 */
var func = function(a, b, c) {
  console.log(this === window) // true
}

func.apply(null, [1,2,3])

// 严格模式下，this还是为 null
var func = function(a, b, c) {
  'use strict'
  console.log(this === null) // true
}

func.apply(null, [1,2,3])

/**
 * 模拟原生 Function.prototype.bind 函数
 */

Function.prototype.bind = function() {
  // 保存原函数
  var self = this
  // 需要绑定的 this 上下文
  var context = [].shift.call(arguments)
  // 剩余的参数转成数组
  var args = [].slice.call(arguments)

  // 返回一个新的函数
  return function () {
    // 执行新的函数的时候，会把之前传入的 context 当作新函数体内的 this
    // 并且组合两次分别传入的参数，作为新函数的参数
    return self.apply(context, [].concat.call(args, [].slice.call(arguments)))
  }
}

var obj = {
  name: 'sven'
}

var func = function() {
  console.log(this.name)
}.bind(obj)

func()