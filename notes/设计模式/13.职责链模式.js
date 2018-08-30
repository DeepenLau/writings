/**
 * 职责链模式
 * 使每个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系
 * 将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止
 *
 * 弊端
 * 不能保证某个请求一定会被链中的节点处理 - 可以在链尾增加一个保底的 接受者节点 来处理这种即将离开链尾的请求
 * 性能问题，可能某一次的请求传递过程中，大部分节点并没有起到实质性的作用，他们的作用仅仅是让请求传递下去 - 避免过长的职责链带来的性能损耗
 */

var order = function(orderType, pay, stock) {
  if (orderType === 1) { // 500元定金购买模式
    if (pay === true) { // 已支付定金
      console.log('500元定金预购，得到100元优惠券')
    } else {
      if (stock > 0) { // 用于普通购买的手机还有库存
        console.log('普通购买，无优惠券')
      } else {
        console.log('手机库存不足')
      }
    }
  }

  else if (orderType === 2) { // 100元定金购买模式
    if (pay === true) { // 已支付定金
      console.log('200元定金预购，得到50元优惠券')
    } else {
      if (stock > 0) { // 用于普通购买的手机还有库存
        console.log('普通购买，无优惠券')
      } else {
        console.log('手机库存不足')
      }
    }
  }

  else if (orderType === 3) {
    if (stock > 0) {
      console.log('普通购买，无优惠券')
    } else {
      console.log('手机库存不足')
    }
  }

}

order(1, true, 500) // 输出：500元定金预购，得到100元优惠券

/***************************************************************************************/

// 用职责链模式改写 例子
// 500元订单
var order500 = function(orderType, pay, stock){
  if (orderType === 1 && pay === true) {
    console.log('500元定金预购，得到100元优惠券')
  } else {
    // 请求传递给200元订单
    order200(orderType, pay, stock)
  }
}
// 200元订单
var order200 = function(orderType, pay, stock){
  if (orderType === 2 && pay === true) {
    console.log('200元定金预购，得到50元优惠券')
  } else {
    // 请求传递给普通订单
    orderNormal(orderType, pay, stock)
  }
}
// 普通订单
var orderNormal = function(orderType, pay, stock){
  if (stock > 0) {
    console.log('普通购买，无优惠券')
  } else {
    console.log('手机库存不足')
  }
}

order500(1, true, 500)    // 500元定金预购，得到100元优惠券
order500(1, false, 500)   // 普通购买，无优惠券
order500(2, true, 500)    // 200元定金预购，得到50元优惠券
order500(3, false, 500)   // 普通购买，无优惠券
order500(3, false, 0)     // 手机库存不足


/***************************************************************************************/

// 约定：如果某个节点不能处理请求，则返回一个特定的字符串 'nextSuccessor' 来表示该请求需要继续往后面传递
// 500元订单
var order500 = function(orderType, pay, stock){
  if (orderType === 1 && pay === true) {
    console.log('500元定金预购，得到100元优惠券')
  } else {
    // 不知道下一个节点是谁，反正把请求忘后面传递
    return 'nextSuccessor'
  }
}
// 200元订单
var order200 = function(orderType, pay, stock){
  if (orderType === 2 && pay === true) {
    console.log('200元定金预购，得到50元优惠券')
  } else {
    // 不知道下一个节点是谁，反正把请求忘后面传递
    return 'nextSuccessor'
  }
}
// 普通订单
var orderNormal = function(orderType, pay, stock){
  if (stock > 0) {
    console.log('普通购买，无优惠券')
  } else {
    console.log('手机库存不足')
  }
}

var Chain = function(fn) {
  this.fn = fn
  this.successor = null
}

// 指定在链中的下一个节点
Chain.prototype.setNextSuccessor = function(successor) {
  return this.successor = successor
}

// 传递请求给某个节点
Chain.prototype.passRequest = function(){
  var ret = this.fn.apply(this, arguments)

  if (ret === 'nextSuccessor') {
    return this.successor && this.successor.passRequest.apply(this.successor, arguments)
  }

  return ret
}

// 包装节点
var chainOrder500 = new Chain(order500)
var chainOrder200 = new Chain(order200)
var chainOrderNormal = new Chain(orderNormal)

// 指定节点在职责链中的顺序
chainOrder500.setNextSuccessor(chainOrder200)
chainOrder200.setNextSuccessor(chainOrderNormal)

// 把请求传递给第一个节点
chainOrder500.passRequest(1, true, 500)
chainOrder500.passRequest(2, true, 500)
chainOrder500.passRequest(3, true, 500)
chainOrder500.passRequest(1, false, 0)

/**
 * 异步的职责链
 */
Chain.prototype.next = function() {
  return this.successor && this.successor.passRequest.apply(this.successor, arguments)
}

var fn1 = new Chain(function() {
  console.log(1)
  return 'nextSuccessor'
})

var fn2 = new Chain(function() {
  console.log(2)
  var self = this
  setTimeout(function() {
    self.next()
  }, 1000)
})

var fn3 = new Chain(function() {
  console.log(3)
})

fn1.setNextSuccessor(fn2)
fn2.setNextSuccessor(fn3)
fn1.passRequest()


/**
 * 用 AOP 实现职责链
 */

// 改写 3.2.3 节的 Function.prototype.after 函数

Function.prototype.after = function(fn) {
  var self = this
  return function() {
    var ret = self.apply(this, arguments)
    if (ret === 'nextSuccessor') {
      return fn.apply(this, arguments)
    }
    return ret
  }
}

var order = order500.after(order200).after(orderNormal)

order(1, true, 500)
order(2, true, 500)
order(1, false, 500)

/**
 * 用 AOP 实现职责链模式 改写 第七章 迭代器模式上传文件
 */
var getActiveUploadObj = function() {
  try {
    return new ActiveXObject('TXFTNActiveX.FTNUpload') // IE 上传控件
  } catch (e) {
    // return false
    return 'nextSuccessor'
  }
}

var getFlashUploadObj = function() {
  if (supportFlash()) {
    // supportFlash 函数未提供
    var str = '<object type=" application/ x- shockwave- flash"></ object>'
    return $( str ).appendTo( $(' body') )
  }
  // return false
  return 'nextSuccessor'
}

var getFormUploadObj = function() {
  var str = '<input name=" file" type=" file" class=" ui- file"/>'; // 表单 上传
  return $( str ).appendTo( $(' body') )
}

var getUploadObj = getActiveUploadObj.after(getFlashUploadObj).after(getFormUploadObj)
