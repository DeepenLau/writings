function Dictionary() {
  var items = {}

  this.has = function (key) {
    return key in items
  }

  this.set = function (key, value) {
    items[key] = value
  }

  this.remove = function (key) {
    if (this.has(key)) {
      delete items[key]
      return true
    }
    return false
  }

  this.get = function (key) {
    return this.has(key) ? items[key] : undefined
  }

  this.values = function () {
    // return Object.keys(items).map(function (key) {
    //   return items[key]
    // })
    var values = []
    for (var k in items) {
      // 只有 for in 的话，会把原型链里面的属性也遍历出来
      if (this.has(k)) {
        values.push(items[k])
      }
    }
    return values
  }

  this.clear = function () {}

  this.size = function () {}

  this.keys = function () {}

  this.getItems = function () {
    return items
  }
}

var dictionary = new Dictionary()
dictionary.set('aaa', 'a-value')
dictionary.set('bbb', 'b-value')
dictionary.set('ccc', 'c-value')



/**
 * 散列表
 */
function HashTable () {
  var table = []

  var loseloseHashCode = function (key) {
    var hash = 0
    for (var i=0; i<key.length; i++) {
      hash += key.charCodeAt(i)
    }
    // 书：为了得到一个比较小的数值，我们会用 hash 值和一个任意数做除法的余数(mod)
    return hash % 37
  }

  this.put = function (key, value) {
    var position = loseloseHashCode(key)
    console.log(position + ' - ' + key)
    table[position] = value
  }

  this.get = function (key) {
    return table[loseloseHashCode(key)]
  }
  this.remove = function (key) {
    table[loseloseHashCode(key)] = undefined
  }

  this.print = function () {
    for (var i=0; i<table.length; ++i) {
      if (table[i] !== undefined) {
        console.log(i + ': ' + table[i])
      }
    }
  }

  var ValuePair = function (key, value) {
    this.key = key
    this.value = value

    this.toString = function () {
      return '[' + this.key + ' - ' + this.value + ']'
    }
  }

  this.getTable = function () {
    return table
  }

}

var hash = new HashTable()

hash.put('aaa', 'a-value')
hash.put('bbb', 'b-value')
hash.put('ccc', 'c-value')


/**
 * 散列表 - 分离链接
 */
function HashMap () {
  var table = []

  var ValuePair = function (key, value) {
    this.key = key
    this.value = value

    this.toString = function () {
      return '[' + this.key + ' - ' + this.value + ']'
    }
  }

  var loseloseHashCode = function (key) {
    var hash = 0
    for (var i=0; i<key.length; i++) {
      hash += key.charCodeAt(i)
    }
    // 书：为了得到一个比较小的数值，我们会用 hash 值和一个任意数做除法的余数(mod)
    return hash % 37
  }

  this.put = function (key, value) {
    var position = loseloseHashCode(key)
    if (table[position] == undefined) {
      table[position] = new LinkedList()
    }
    table[position].append(new ValuePair(key, value))
  }

  this.get = function (key) {
    var position = loseloseHashCode(key)

    if (table[position] !== undefined) {
      // 遍历链表来寻找键/值
      var current = table[position].getHead()

      while(current.next) {
        if (current.element.key === key) {
          return current.element.value
        }
        current = current.next
      }

      // TODO 不懂为啥是放在 while 后面，而不是前面
      // 检查元素在链表第一个或最后一个节点的情况
      if (current.element.key === key) {
        return current.element.value
      }
    }
    return undefined
  }
  this.remove = function (key) {
    var position = loseloseHashCode(key)

    if (table[position] !== undefined) {
      var current = table[position].getHead()

      while (current.next) {
        if (current.element.key === key) {
          table[position].remove(current.element)
          if (table[position].isEmpty()) {
            table[position] = undefined
          }
          return true
        }
        current = current.next
      }

      // TODO 和前面同样疑惑，不懂为啥是放在 while 后面，而不是前面
      // 检查是否为第一个或最后一个元素
      if (current.element.key === key) {
        table[position].remove(current.element)
        if (table[position].isEmpty()) {
          table[position] = undefined
        }
        return true
      }
    }
    return false
  }

  this.print = function () {
    for (var i=0; i<table.length; ++i) {
      if (table[i] !== undefined) {
        console.log(i + ': ' + table[i])
      }
    }
  }

  this.getTable = function () {
    return table
  }

}

/**
 * 散列表 - 线性探查
 */
function HashMap () {
  var table = []

  var ValuePair = function (key, value) {
    this.key = key
    this.value = value

    this.toString = function () {
      return '[' + this.key + ' - ' + this.value + ']'
    }
  }

  var loseloseHashCode = function (key) {
    var hash = 0
    for (var i=0; i<key.length; i++) {
      hash += key.charCodeAt(i)
    }
    // 书：为了得到一个比较小的数值，我们会用 hash 值和一个任意数做除法的余数(mod)
    return hash % 37
  }

  this.put = function (key, value) {
    var position = loseloseHashCode(key)

    if (table[position] == undefined) {
      table[position] = new ValuePair(key, value)
    } else {
      var index = ++position

      while (table[index] != undefined) {
        index++
      }

      table[index] = new ValuePair(key, value)
    }
  }

  this.get = function (key) {
    var position = loseloseHashCode(key)

    if (table[position] !== undefined) {
      if (table[position].key === key) {
        return table[position].value
      } else {
        var index = ++position
        while (table[index] === undefined || table[index].key !== key) {
          index++
        }

        if (table[index].key === key) {
          return table[index].value
        }
      }
    }
    return undefined
  }

  this.remove = function (key) {
    var position = loseloseHashCode(key)

    if (table[position] !== undefined) {
      if (table[position].key === key) {
        return table[position] = undefined
      } else {
        var index = ++position
        while (table[index] === undefined || table[index].key !== key) {
          index++
        }

        if (table[index].key === key) {
          return table[index] = undefined
        }
      }
    }
    return undefined
  }
}


// 一个比 “lose lose”更好的散列函数
// 这并不是最好的散列函数，但这是最被社区推荐的散列函数之一
var djb2HashCode = function (key) {
  var hash = 5381 // 质数，大多数实现都使用5381

  for (var i=0; i<key.length; i++) {
    hash = hash * 33 + key.charCodeAt(i)
  }

  // 将使用相加的和与另一个随机*质数*相除的余数
  return hash % 1013 // 质数，（比我们认为的散列表的大小要大----在本例中，我们认为散列表的大小为1000）
}