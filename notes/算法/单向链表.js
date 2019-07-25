function LinkedList() {
	var Node = function(element) {
  	this.element = element
    this.next = null
  }

  var length = 0
  var head = null

  // 追加
  this.append = function (element) {
  	var node = new Node(element)
    var current

    if  (head === null) {
    	head = node
    } else {
    	current = head

      while(current.next) {
      	current = current.next
      }

      current.next = node
    }

    length++
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
      } else {
        // 移除非第一项
        while (index++ < position) {
          previous = current
          current = current.next
        }
        // 将 previous 与 current 的下一项链接起来：跳过 current,从而移除它
        previous.next = current.next
      }

      length--
      return current.element
    } else {
      return null
    }
  }

  // 插入
  this.insert = function (position, element) {
    // 检查越界值
    if (position > -1 && position < length) {
      var node = new Node(element)
      var current = head // 列表第一个赋给当前
      var previous
      var index = 0

      if (position === 0) {
        // 在第一位置添加
        node.next = current
        head = node
      } else {
        // 非第一位置添加
        while (index++ < position) {
          previous = current
          current = current.next
        }
        node.next = current
        previous.next = node
      }

      length++
      return true
    } else {
      return false
    }
  }

  // toString
  this.toString = function () {
    var current = head
    var string = ''

    while (current) {
      string += ',' + current.element
      current = current.next
    }
    // string = ',1,2,3,4,5'
    return string.slice(1) // 从第1位开始取，截掉第一个逗号
  }

  this.indexOf = function (element) {
    var current = head
    // 书上写的 -1 是错的，-1 的话，下面的 while 里的 index++ 就要提到 if 前面
    var index = 0

    while (current) {
      if (current.element === element) {
        return index
      }
      index++
      current = current.next
    }

    return -1
  }

  this.remove = function (element) {
    var index = this.indexOf(element)
    return this.removeAt(index)
  }

  this.isEmpty = function () {
    return length === 0
  }

  this.size = function () {
    return length
  }

  this.getHead = function () {
    return head
  }
}

var list = new LinkedList()
list.append(15)
list.append(10)
