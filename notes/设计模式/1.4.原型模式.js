/**
 * 原型模式
 *
 * 基于原型链的委托机制 就是 原型 继承的本质
 *
 * 要得到一个对象，不是通过实例化类，而是找到一个对象作为原型并克隆它
 *
 * JavaScript 是 通过 克隆 Object. prototype 来得 到 新的 对象，
 * 但 实际上 并不是 每次 都 真正 地 克隆 了 一个 新的 对象。
 * 从内 存 方面 的 考虑 出发，
 * JavaScript 还 做了 一些 额外 的 处理， 具体 细节 可以 参参阅 周 爱民 老师 编著 的《 JavaScript 语言 精髓 与 编程 实践》。
 */

// 复制一个一模一样的对象
var Plane = function() {
  this.blood = 100
  this.attackLevel = 1
  this.defenseLevel = 1
}

var plane = new Plane()
plane.blood = 500
plane.attackLevel = 10
plane.defenseLevel = 7

var clonePlane = Object.create(plane)
console.log(clonePlane)

/**
 * javascript 遇到的每个对象，实际上都是从 Object.prototype 对象克隆而来的
 */
const o = {}
// 查看原型对象
Object.getPrototypeOf(o) === Object.prototype // true
// 创建没有原型的对象
var o = Object.create(null)
Object.getPrototypeOf(o) === Object.prototype // false



/**
 * 模拟 构造函数 new 操作符的过程
 * @param {Sring} name
 */
function Person (name) {
  this.name = name
}

Person.prototype.getName = function () {
  return this.name
}

var objectFactory = function() {
  // 从 Object.prototype 上克隆一个空的对象
  var obj = new Object()
  // 取得外部传入的构造器，此例是 Person
  var Constructor = [].shift.call(arguments)
  // 指向正确的原型
  obj.__proto__ = Constructor.prototype
  // 借用外部传入的构造器给 obj 设置属性
  var ret = Constructor.apply(obj, arguments)
  // 确保构造器总会返回一个对象
  return typeof ret === 'object' ? ret : obj
}

var a = objectFactory(Person, 'sven')
var b = new Person('sven')


