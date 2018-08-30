/**
 * 发布-订阅模式（观察者模式）
 * 定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时
 * 所有依赖于它的对象都将得到通知
 * 在 JavaScript 中，我们一般用 事件模型 来代替传统的 发布-订阅模式
 */

// 定义售楼处
var salesOffices = {}
// 缓存列表，存放订阅者的回调函数
salesOffices.clientList = []
// 增加订阅者
salesOffices.listen = function(key, fn) {
  if (!this.clientList[key]) {
    // 如果还没有订阅过此类消息，给该类消息创建一个缓存列表
    this.clientList[key] = []
  }
  // 订阅的消息添加进缓存列表
  this.clientList[key].push(fn)
}

// 发布消息
salesOffices.trigger = function(key) {
  // 取出消息类型
  var key = Array.prototype.shift.call(arguments)
  var fns = this.clientList[key]

  // 如果没有订阅该消息，则返回 false
  if (!fns || fns.length === 0) {
    return false
  }

  for(var i = 0, fn; fn = fns[i++];) {
    // arguments 是发布消息时带上的参数
    fn.apply(this, arguments)
  }
}

// 小明订阅 88 平方米房子的消息
salesOffices.listen('squareMeter88', function(price, squareMeter){
  console.log('价格=%s', price)
})
// 小红订阅 110 平方米房子的消息
salesOffices.listen('squareMeter110', function(price, squareMeter){
  console.log('价格=%s', price)
})

// 发布消息
salesOffices.trigger('squareMeter88', 11111, 222222)
// salesOffices.trigger(33333, 444444)


/**
 * 发布-订阅模式的通用实现
 */
var event = {
  clientList: {},

  listen: function(key, fn){
    if (!this.clientList[key]) {
      // 如果还没有订阅过此类消息，给该类消息创建一个缓存列表
      this.clientList[key] = []
    }
    // 订阅的消息添加进缓存列表
    this.clientList[key].push(fn)
  },

  trigger: function() {
    var key = Array.prototype.shift.call(arguments)
    var fns = this.clientList[key]

    // 如果没有订阅该消息，则返回 false
    if (!fns || fns.length === 0) {
      return false
    }

    for(var i = 0, fn; fn = fns[i++];) {
      // arguments 是发布消息时带上的参数
      fn.apply(this, arguments)
    }
  },

  remove: function(key, fn) {
    var fns = this.clientList[key]

    // 如果 key 对应的消息没有被人订阅，则直接返回 false
    if (!fns) {
      return false
    }

    // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
    if (!fn) {
      fns && (fns.length = 0)
    } else {
      // 反向遍历订阅的回调函数列表 / 为什么要反向遍历？
      console.log(key)
      for (var l = fns.length - 1; l >= 0; l--) {
        var _fn = fns[l]
        if (_fn === fn) {
          // console.log(fns)
          // 删除订阅者的回调函数
          fns.splice(l, 1)
          console.log(fns)
        }
      }
    }
  }
}

// 这个函数可以给所有的对象都动态安装发布-订阅功能
var installEvent = function(obj) {
  for (var i in event) {
    // 属性重名可能会有问题
    obj[i] = event[i]
  }
}

var salesOffices = {}
installEvent(salesOffices)

// 小明订阅 88 平方米房子的消息
salesOffices.listen('squareMeter88', fn1 = function(price, squareMeter){
  console.log('价格=%s', price)
})
// 小红订阅 110 平方米房子的消息
salesOffices.listen('squareMeter110', fn2 = function(price, squareMeter){
  console.log('价格=%s', price)
})

// 发布消息
// salesOffices.remove('squareMeter88', fn1) // 删除小明的订阅
salesOffices.trigger('squareMeter88', 11111, 222222)



/**
 * Event类：全局“中介者”角色
 */
var Event = (function() {
  var clientList = {}
  var listen
  var trigger
  var remove

  listen = function(key, fn){
    if (!clientList[key]) {
      clientList[key] = []
    }
    clientList[key].push(fn)
  }

  trigger = function() {
    var key = Array.prototype.shift.call(arguments)
    var fns = clientList[key]

    // 如果没有订阅该消息，则返回 false
    if (!fns || fns.length === 0) {
      return false
    }

    for(var i = 0, fn; fn = fns[i++];) {
      // arguments 是发布消息时带上的参数
      fn.apply(this, arguments)
    }
  }

  remove = function() {
    var fns = clientList[key]

    // 如果 key 对应的消息没有被人订阅，则直接返回 false
    if (!fns) {
      return false
    }

    // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
    if (!fn) {
      fns && (fns.length = 0)
    } else {
      // 反向遍历订阅的回调函数列表 / 为什么要反向遍历？
      console.log(key)
      for (var l = fns.length - 1; l >= 0; l--) {
        var _fn = fns[l]
        if (_fn === fn) {
          // console.log(fns)
          // 删除订阅者的回调函数
          fns.splice(l, 1)
        }
      }
    }
  }

  return {
    listen: listen,
    trigger: trigger,
    remove: remove
  }
})()

// 订阅消息
Event.listen('squareMeter88', function(price) {
  console.log('价格=%s', price)
})

// 发布消息
Event.trigger('squareMeter88', 20000)

/**
 * 按钮测试
 */
;(function(){
  // 发布
  var button = document.getElementById('count')
  var count = 0
  button.addEventListener('click', function() {
    Event.trigger('addCount', count++)
  })

  // 订阅
  var show = document.getElementById('show')
  Event.listen('addCount', function(count) {
    show.innerHTML = count
  })
})()


/**
 * 实现
 * 1. 先发布，后订阅
 * 2. 命名空间
 * 书上的代码跑不动，可能我抄错，可能书错，所以自己实现一下
 */

var Event = (function() {
  var clientList = {}
  var _listen
  var _trigger
  var _remove
  var namespace
  var offlineStack = {}

  namespace = function(namespace) {
    var namespace = namespace || 'default'

    ret =  {
      listen: function(key, fn) {
        _listen(namespace + '/' + key, fn)
      },
      trigger: function() {
        arguments[0] = namespace + '/' + arguments[0]
        _trigger.apply(this, arguments)
      },
      remove: function() {
        _remove(namespace + '/' + key, cache, fn)
      }
    }

    return ret
  }

  _listen = function(key, fn){
    if (!clientList[key]) {
      clientList[key] = []
    }
    clientList[key].push(fn)
    // 查看离线事件，若有离线事件，马上调用
    if (offlineStack[key] && offlineStack[key].length > 0) {
      for(var i = 0; i < offlineStack[key].length; i++) {
        // arguments 是发布消息时带上的参数
        fn.apply(this, offlineStack[key][i])
      }
    }
  }

  _trigger = function() {
    var key = Array.prototype.shift.call(arguments)
    var fns = clientList[key]
    var args = arguments
    console.log(key)
    // 如果没有订阅该消息，则返回 放入离线事件
    if (!fns || fns.length === 0) {
      if (!offlineStack[key]) {
        offlineStack[key] = []
      }
      offlineStack[key].push(args)

      return false
    }

    for(var i = 0, fn; fn = fns[i++];) {
      // arguments 是发布消息时带上的参数
      fn.apply(this, arguments)
    }
  }

  _remove = function() {
    var fns = clientList[key]

    // 如果 key 对应的消息没有被人订阅，则直接返回 false
    if (!fns) {
      return false
    }

    // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
    if (!fn) {
      fns && (fns.length = 0)
    } else {
      // 反向遍历订阅的回调函数列表 / 为什么要反向遍历？最后订阅的优先删除？
      console.log(key)
      for (var l = fns.length - 1; l >= 0; l--) {
        var _fn = fns[l]
        if (_fn === fn) {
          // console.log(fns)
          // 删除订阅者的回调函数
          fns.splice(l, 1)
        }
      }
    }

    create = function (namespace) {
      namespace
    }
  }

  return {
    listen: _listen,
    trigger: _trigger,
    remove: _remove,
    namespace: namespace
  }
})()

// 发布消息
Event.trigger('squareMeter88', 20000, 2222)
// Event.trigger('squareMeter100', 2, 1)

// 订阅消息
Event.listen('squareMeter88', function(price) {
  console.log('1价格=%s', price)
})
Event.listen('squareMeter88', function(price) {
  console.log('2价格=%s', price)
})

Event.namespace('namespace1').trigger('squareMeter100', 2, 1)
Event.namespace('namespace1').trigger('squareMeter100', 2, 1)

Event.namespace('namespace1').listen('squareMeter100', function(price) {
  console.log('1价格=%s', price)
})
Event.namespace('namespace2').listen('squareMeter100', function(price) {
  console.log('2价格=%s', price)
})



