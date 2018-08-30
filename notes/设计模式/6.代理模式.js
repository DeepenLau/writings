/**
 * 代理模式
 * 为一个对象提供一个代用品或占位符，以便控制对它的访问
 */

var Flower = function() {}

var xiaoming = {
  sendFlower: function(target) {
    var flower = new Flower()
    target.receiveFlower(flower)
  }
}

var B = {
  receiveFlower: function(flower) {
    A.listonGoodMood(function() {
      var flower = new Flower() // 虚拟代理：在需要的时候再创建
      A.receiveFlower(flower)
    })
  }
}

var A = {
  receiveFlower: function(flower) {
    console.log('收到花')
  },
  listonGoodMood: function(fn) {
    setTimeout(() => {
      fn()
    }, 2000)
  }
}


/**
 * 虚拟代理
 * 实现图片预加载
 */
var myImage = (function(){
  var imgNode = document.createElement('img')
  document.body.appendChild(imgNode)

  return {
    setSrc: function(src) {
      imgNode.src = src
    }
  }
})()

// myImage.setSrc('大图片.jpg')

// 图片未加载完成是使用 loading.gif
var proxyImage = (function(){
  var img = new Image()

  img.onload = function() {
    myImage.setSrc(this.src)
  }

  return {
    setSrc: function(src){
      myImage.setSrc('loading.gif')
      img.src = src
    }
  }
})()

proxyImage.setSrc('大图片.jpg')

// 如果代理对象和本体对象都为一个函数（函数也是对象）
// 函数必然都能被执行，则可以认为它们也具有一致的“接口”
var myImage = (function(){
  var imgNode = document.createElement('img')
  document.body.appendChild(imgNode)

  return function(src) { // 返回一个函数
    imgNode.src = src
  }
})()

// 图片未加载完成是使用 loading.gif
var proxyImage = (function(){
  var img = new Image()

  img.onload = function() {
    myImage(this.src)
  }

  return function(src){ // 也返回一个函数
    myImage('loading.gif')
    img.src = src
  }
})()

proxyImage('大图片.jpg')


/**
 * 虚拟代理合并 Http 请求
 */
var synchronousFile = function(id) {
  console.log('开始同步')
}

var proxySynchronousFile = (function(){
  // 保存一段时间内需要同步的 id
  var cache = [],
  // 定时器
      timer

  return function(id) {
    cache.push(id)

    // 保证不会覆盖已经启动的定时器
    if (timer) {
      return
    }

    timer = setTimeout(function() {
      // 2秒后向本体发送需要同步的id集合
      synchronousFile(cache.join(','))
      // 清空定时器
      clearTimeout(timer)
      timer = null
      // 清空 id 集合
      cache.length = 0
    }, 2000)
  }
})()

var checkbox = document.getElementsByTagName('input')

for (var i = 0, c; c = checkbox[i++];) {
  c.onclick = function() {
    if (this.checked === true){
      proxySynchronousFile(this.id)
    }
  }
}


/**
 * 缓存代理
 */
// 计算乘积
var mult = function() {
  console.log('开始计算乘积')
  var a = 1
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a * arguments[i]
  }
  return a
}

mult(2, 3)    // 6
mult(2, 3, 4) // 24

// 加入缓存代理函数
var proxyMult = (function(){
  var cache = {}

  return function(){
    var args = Array.prototype.join.call(arguments, ',')

    if (args in cache ) {
      return cache[args]
    }
    // 没有被缓存的，就调用 mult函数 进行计算，mult 本身不带有缓存功能，只负责计算
    return cache[args] = mult.apply(this, arguments)
  }
})()

proxyMult(1,2,3,4,5)
proxyMult(1,2,3,4,5)

/**
 * 高阶函数动态创建代理
 */
// 计算乘积
var mult = function() {
  var a = 1
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a * arguments[i]
  }
  return a
}

// 计算加和
var plus = function() {
  var a = 1
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a + arguments[i]
  }
  return a
}

// 创建缓存代理的工厂
var createProxyFactory = function(fn) {
  var cache = {}

  return function() {
    var args = Array.prototype.join.call(arguments, ',')
    if (args in cache ) {
      return cache[args]
    }
    return cache[args] = fn.apply(this, arguments)
  }
}

var proxyMult = createProxyFactory(mult)
var proxyPlus = createProxyFactory(plus)

console.log(proxyMult(1,2,3,4))
console.log(proxyMult(1,2,3,4))
console.log(proxyPlus(1,2,3,4))
console.log(proxyPlus(1,2,3,4))

/**
 * 其他代理模式
 * 6.10 章节
 */
// 防火墙代理
// 远程代理
// 保护代理
// 智能引用代理
// 写时复制代理