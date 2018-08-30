/**
 * 函数节流
 */
var throttle = function(fn, interval) {
  // 保存需要被延迟执行的函数的引用
  var __self = fn
  // 定时器
  var timer = null
  // 是否第一次调用
  var firstTime = true

  return function() {
    var args = arguments,
        __me = this

    if (firstTime) {
      // 如果第一次调用，不需延迟执行
      __self.apply(__me, args)
      return firstTime = false
    }

    if (timer) {
      // 如果定时器在，说明前一次延迟执行还没有完成
      return false
    }

    timer = setTimeout(function() {
      // 延迟一段时间执行
      clearTimeout(timer)
      timer = null
      __self.apply(__me, args)
    }, interval || 500)
  }
}

window.onresize = throttle(function() {
  console.log(1)
}, 2000)

/**
 * 分时函数
 */
// 每 200ms 插入8个数据
var ary = []

for (var i = 1; i <= 1000; i++) {
  // 假设 ary 装在 1000 个好友数据
  ary.push(i)
}

var timeChunk = function(ary, fn, count) {
  var obj,
      t
  var len = ary.length

  var start = function() {
    for(var i = 0; i < Math.min(count || 1, ary.length); i++) {
      var obj = ary.shift()
      fn(obj)
    }
  }

  return function() {
    t = setInterval(function() {
      if (ary.length === 0) {
        // 如果全部节点都已经被创建好
        return clearInterval(t)
      }
      start()
    }, 200) // 分批执行的时间间隔，也可以用参数形式传入
  }
}

var renderFriendList = timeChunk(ary, function(n) {
  var div = document.createElement('div')
  div.innerHTML = n
  document.body.appendChild(div)
}, 8)

renderFriendList()


/**
 * 惰性加载函数
 * 根据判断重写函数？
 */

var addEvent = function(elem, type, handler) {
  if (window.addEventListener) {
    addEvent = function (elem, type, handler) {
      elem.addEventListener(type, handler, false)
    }
  } else if (window.attachEvent) {
    addEvent = function(elem,type, handler) {
      elem.attachEvent('on' + type, handler)
    }
  }

  addEvent(elem, type, handler)
}
// 点击的时候根据判断重写函数
var div = document.getElementById('div1')

addEvent(div, 'click', function(){
  alert(1)
})
addEvent(div, 'click', function(){
  alert(2)
})
