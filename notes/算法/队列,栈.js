function Queue() {
  var items = []
  this.enqueue = function(element) {
    items.push(element)
  }
  this.dequeue = function() {
    return items.shift()
  }
  this.front = function () {
    return items[0]
  }
  this.isEmpty = function () {
    return items.length === 0
  }
  this.size = function () {
    return items.length
  }
  this.clear = function () {
    items = []
  }
}

function Stack () {
  var items = []
  this.push = function (element) {
    items.push(element)
  }
  // 移除栈顶元素并返回
  this.pop = function () {
    return items.pop()
  }
  // 返回栈顶元素
  this.peek = function () {
    return items[items.length - 1]
  }
  this.isEmpty = function () {
    return items.length === 0
  }
  this.size = function () {
    return items.length
  }
  this.clear = function () {
    items = []
  }
}