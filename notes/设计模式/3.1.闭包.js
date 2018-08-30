// 类型判断
var Type = {}

for (var i = 0, type; type = ['String', 'Array', 'Number'][i++];) {
  (function(type){
    Type['is' + type] = function(obj) {
      return Object.prototype.toString.call(obj) === '[object ' + type + ']'
    }
  })(type)
}

Type.isArray([])

// 乘积
var mult = (function() {
  var cache = {}

  // 封装 calculate 函数
  var calculate = function() {
        var a = 1
    for (var i = 0, l = arguments.length; i < l; i++) {
      a = a * arguments[i]
    }
    return a
  }

  return function() {
    var args = Array.prototype.join.call(arguments, ',')

    if (cache[args]) {
      return cache[args]
    }
    return cache[args] = calculate.apply(null, arguments)
  }
})()

mult(1,2,3)
mult(1,2,3)


// img对象经常用于数据上报
var report = (function() {
  var imgs = []
  return function(src) {
    var img = new Image()
    imgs.push(img)
    img.src = src
  }
})()