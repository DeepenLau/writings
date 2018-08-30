/**
 * 装饰者模式
 * 动态改动对象属性，但并不改变对象本身
 *
 * 和代理模式的区别 15.7
 * 代理模式：不直接访问本体，通常只有一层 代理-本体 引用
 * 装饰者：为对象动态切入行为，经常会形成一条长长的装饰链
 */

/**
 * 传统面向对象语言中的 装饰者模式 的实现
 */
var Plane = function() {}

Plane.prototype.fire = function(){
  console.log('发射普通子弹')
}

// 两个装饰类 导弹，原子弹
var MissileDecorator = function(plane) {
  this.plane = plane
}

MissileDecorator.prototype.fire = function() {
  this.plane.fire()
  console.log('发射导弹')
}

var AtomDecorator = function(plane){
  this.plane = plane
}

AtomDecorator.prototype.fire = function() {
  this.plane.fire()
  console.log('发射原子弹')
}

var plane = new Plane()
plane = new MissileDecorator(plane)
plane = new AtomDecorator(plane)

plane.fire()


/**
 * javascript 不是用面向对象实现
 */
var plane = {
  fire: function() {
    console.log('发射普通子弹')
  }
}

var missileDecorator = function() {
  console.log('发射导弹')
}
var atomDecorator = function() {
  console.log('原子弹')
}

var fire1 = plane.fire

plane.fire = function () {
  fire1()
  missileDecorator()
}

var fire2 = plane.fire

plane.fire = function () {
  fire2()
  atomDecorator()
}

plane.fire()


/**
 * AOP 应用实例
 */
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


var showLogin = function() {
  console.log('打开登录浮层')
}

var log = function() {
  console.log('上报标签为：' + this.getAttribute('tag'))
}

showLogin = showLogin.after(log)

/**********************************************************/

var getToken = function() {
  return 'Token'
}

var ajax = function(type, url, param) {
  // todo 不知道为啥跑不动，按书上写的
  // 拿不到在 before 函数传进来的 arguments

  // console.log(type)   undefined
  // console.log(url)    undefined
  // console.log(param)  undefined
}

ajax = ajax.before((type, url, param) => {
  param.Token = getToken()
})

ajax('get', 'xxx.com', { name: 'sven' })