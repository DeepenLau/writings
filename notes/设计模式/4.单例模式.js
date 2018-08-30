/**
 * 单例模式
 * 保证一个类仅有一个实例，并提供一个访问它的全局访问点
 * 核心：确保只有一个类，并提供全局访问
 */
// 必须使用 getInstance 方法创建实例的两种方法
var Singleton = function(name) {
  this.name = name
  this.instance = null
}

Singleton.prototype.getName = function() {
  alert(this.name)
}

Singleton.getInstance = function(name) {
  if (!this.instance) {
    this.instance = new Singleton(name)
  }
  return this.instance
}

var a = Singleton.getInstance('sven1')
var b = Singleton.getInstance('sven2')

alert(a === b) // true

// or
var Singleton = function(name) {
  this.name = name
}

Singleton.prototype.getName = function() {
  alert(this.name)
}

Singleton.getInstance = (function(){
  var instance = null
  return function(name) {
    if (!instance) {
      instance = new Singleton(name)
    }
    return instance
  }
})()





// 透明的单例模式
var CreateDiv = (function(){
  var instance

  // 重写了 CreateDiv 函数，下面 new 的时候 new 的是这个函数
  var CreateDiv = function(html) {
    if (instance) {
      return instance
    }
    this.html = html
    this.init()
    return instance = this
  }

  CreateDiv.prototype.init = function() {
    var div = document.createElement('div')
    div.innerHTML = this.html
    document.body.appendChild(div)
  }

  return CreateDiv
})()

var a = new CreateDiv('sven1')
var b = new CreateDiv('sven2')

alert(a === b)




// 用代理实现单例模式
var CreateDiv = function(html) {
  this.html = html
  this.init()
}

CreateDiv.prototype.init = function() {
  var div = document.createElement('div')
  div.innerHTML = this.html
  document.body.appendChild(div)
}

var ProxySingletonCreateDiv = (function(){
  var instance

  return function(html) {
    if (!instance) {
      instance = new CreateDiv(html)
    }
    return instance
  }
})()

var a = new ProxySingletonCreateDiv('sven1')
var b = new ProxySingletonCreateDiv('sven2')

alert(a === b)

// 动态创建命名空间
var MyApp = {}

MyApp.namespace = function(name) {
  var parts = name.split('.')
  var current = MyApp

  for (var i in parts) {
    if (!current[parts[i]]) {
      current[parts[i]] = {}
    }
    current = current[parts[i]]
  }
}

MyApp.namespace('event')
MyApp.namespace('dom.style')

console.dir(MyApp)

// 上述代码等价于
var MyApp = {
  event: {},
  dom: {
    style: {}
  }
}

// 惰性单例
var createLoginLayer = (function(){
  var div
  return function() {
    if (!div) {
      div = document.createElement('div')
      div.innerHTML = '单一的登录浮窗'
      div.style.display = 'none'
      document.body.appendChild(div)
    }
    return div
  }
})()

document.getElementById('loginBtn').onclick = function() {
  var loginLayer = createLoginLayer()
  loginLayer.style.display = 'block'
}



/**
 * 通用的惰性单例
 * 下面的 getSingle 函数可以用在给 列表item添加事件监听器，不会重复添加
 */
var getSingle = function() {
  var instance

  return function(fn) {
    if (!instance) {
      instance = fn.apply(this, arguments)
    }
    return instance
  }
}

var createLoginLayer = function() {
  var div = document.createElement('div')
  div.innerHTML = '单一的登录浮窗'
  div.style.display = 'none'
  document.body.appendChild(div)
  return div
}

var createSingleLoginLayer = getSingle(createLoginLayer)

// 列表动态绑定事件
var bindEvent = getSingle(function() {
  document.getElementById('div1').onclick = function() {
    alert('click')
  }
  return true
})

var render = function() {
  console.log('开始渲染列表')
  bindEvent()
}

render()
render()
render()