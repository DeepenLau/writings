/**
 * 迭代器模式
 * 是指提提供一种方法顺序访问一个聚合对象的中的各个元素，而又不需要暴露该对象的内部表示
 * 迭代器可以把迭代的过程从业务逻辑中分离出去，在使用迭代器模式之后
 * 即使不关心对象的内部构造，也可以按顺序访问其中的每个元素
 *
 * 无非就是循环访问聚合对象中的各个元素
 */

// 实现自己的迭代器
// 内部迭代器
var each = function(ary, callback) {
  for (var i = 0, l = ary.length; i < l; i++) {
    // 把下标和元素当作参数传给 callback 函数
    callback.call(ary[i], i, ary[i])
  }
}

each([1,2,3], function(i, n) {
  console.log([i, n])
})

// 倒序迭代器
var reverseEach = function(ary, callback) {
  for (var l = ary.length - 1; i >= l; i--) {
    // 把下标和元素当作参数传给 callback 函数
    callback.call(ary[i], i, ary[i])
  }
}

reverseEach([1,2,3], function(i, n) {
  console.log([i, n])
})

/**
 * 外部迭代器
 * 必须显式地请求迭代下一个元素
 */

// 比较两个数组是否相等
var Iterator = function(obj) {
  var current = 0

  var next = function() {
    current += 1
  }

  var isDone = function() {
    return current >= obj.length
  }

  var getCurrItem = function() {
    return obj[current]
  }

  return {
    next: next,
    isDone: isDone,
    getCurrItem: getCurrItem
  }
}

var compare = function(iterator1, iterator2) {
  while(!iterator1.isDone() && !iterator2.isDone()) {
    if (iterator1.getCurrItem() !== iterator2.getCurrItem()) {
      throw new Error('iterator1 和 iterator2 不相等')
    }
    iterator1.next()
    iterator2.next()
  }
  console.log('iterator1 和 iterator2 相等')
}

var iterator1 = Iterator([1,2,3])
var iterator2 = Iterator([1,2,3])

compare(iterator1, iterator2)

/**
 * 中止迭代器
 */
var each = function(ary, callback) {
  for (var i = 0, l = ary.length; i < l; i++) {
    // callback 的执行结果返回 false，提前终止迭代
    if (callback.call(ary[i], i, ary[i]) === false) {
      break
    }
  }
}

each([1,2,3,4,5], function(i, n) {
  if (n > 3) {
    // 大于 3 终止循环
    return false
  }
  console.log([i, n]) // 1,2,3
})

/**
 * 迭代器应用
 */

var getActiveUploadObj = function() {
  try {
    return new ActiveXObject('TXFTNActiveX.FTNUpload') // IE 上传控件
  } catch (e) {
    return false
  }
}

var getFlashUploadObj = function() {
  if (supportFlash()) {
    // supportFlash 函数未提供
    var str = '<object type=" application/ x- shockwave- flash"></ object>'
    return $( str ).appendTo( $(' body') )
  }
  return false
}

var getFormUploadObj = function() {
  var str = '<input name=" file" type=" file" class=" ui- file"/>'; // 表单 上传
  return $( str ).appendTo( $(' body') )
}

// 三个函数都有同一个约定：如果该函数里面的 upload 对象是可用的，则让函数返回该对象，反之返回 false，提示迭代器继续往后面迭代

var iteratorUploadObj = function() {
  for (var i = 0, fn; fn = arguments[i++];) {
    var uploadObj = fn()
    if (uploadObj !== false) {
      return uploadObj
    }
  }
}

var uploadObj = iteratorUploadObj(getActiveUploadObj, getFlashUploadObj, getFormUploadObj)