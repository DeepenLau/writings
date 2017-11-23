function DoublyLinkedList() {
	var Node = function(element) {
  	this.element = element
    this.next = null
    this.prev = null // new
  }

  var lenth = 0
  var head = null
  var tail = null // new

  // 插入
  this.insert = function (position, element) {
    // 检查越界值
    if (position > -1 && position < length) {
      var node = new Node(element)
      var current = head // 列表第一个赋给当前
      var previous
      var index = 0

      if (position === 0) { // 在第一位置添加
        if (!head) { // 如果没有第一项
          head = node
          tail = node
        } else { // 如果有第一项
          node.next = current
          current.next = node
          head = node
        }
      } else if (position === length) { // 最后一项
        current = tail
        current.next = node
        node.prev = current
        tail = node
      } else { // 非首尾
        while (index++ < position) {
          previous = current
          current = current.next
        }

        node.next = current
        previous.next = node

        current.prev = node
        node.prev = previous
      }

      length++
      return true
    } else {
      return false
    }
  }

  // 移除
  this.removeAt = function (position) {
    // 检查越界值
    if (position > -1 && position < length) {
      var current = head // 列表第一个赋给当前
      var previous
      var index

      if (position === 0) {
        // 移除第一项
        head = current.next

        if (length === 1) {
          // 如果只有一项
          tail = null
        } else {
          head.prev = null
        }
      } else if (position === length -1) {
        current = tail
        tail = current.prev
        tail.next = null
      } else {
        // 移除非第一项
        while (index++ < position) {
          previous = current
          current = current.next
        }
        // 将 previous 与 current 的下一项链接起来：跳过 current,从而移除它
        previous.next = current.next
        current.next.prev = previous
      }

      length--
      return current.element
    } else {
      return null
    }
  }
}