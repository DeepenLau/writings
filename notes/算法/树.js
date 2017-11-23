function BinarySearchTree () {
  var Node = function (key) {
    this.key = key
    this.left = null
    this.right = null
  }

  var root = null

  // 私有插入节点方法
  var _insertNode = function (node, newNode) {
    if (newNode.key < node.key) {
      if (node.left === null) {
        node.left = newNode
      } else {
        _insertNode(node.left, newNode)
      }
    } else {
      if (node.right === null) {
        node.right = newNode
      } else {
        _insertNode(node.right, newNode)
      }
    }
  }

  // 私有 中序遍历 函数
  var _inOrderTraverseNode = function (node, callback) {
    if (node !== null) {
      _inOrderTraverseNode(node.left, callback)
      callback(node.key)
      _inOrderTraverseNode(node.right, callback)
    }
  }

  // 私有 先序遍历 函数
  var _preOrderTraverseNode = function (node, callback) {
    if (node !== null) {
      callback(node.key)
      _preOrderTraverseNode(node.left, callback)
      _preOrderTraverseNode(node.right, callback)
    }
  }

  // 私有 后序遍历 函数
  var _postOrderTraverseNode = function (node, callback) {
    if (node !== null) {
      _postOrderTraverseNode(node.left, callback)
      _postOrderTraverseNode(node.right, callback)
      callback(node.key)
    }
  }

  this.insert = function (key) {
    var newNode = new Node(key)

    if (root === null) {
      root = newNode
    } else {
      _insertNode(root, newNode)
    }
  }

  // 中序遍历
  this.inOrderTraverse = function (callback) {
    _inOrderTraverseNode(root, callback)
  }

  // 先序遍历
  this.preOrderTraverse = function (callback) {
    _preOrderTraverseNode(root, callback)
  }

  // 后序遍历
  this.postOrderTraverse = function (callback) {
    _postOrderTraverseNode(root, callback)
  }

  // 私有 搜索最小值 函数
  var _minNode = function (node) {
    if (node) {
      while (node && node.left !== null) {
        node = node.left
      }

      return node.key
    }
    return null
  }

  // 私有 搜索最大值 函数
  var _maxNode = function (node) {
    if (node) {
      while (node && node.right !== null) {
        node = node.right
      }

      return node.key
    }
    return null
  }

  // 搜索最小键
  this.min = function () {
    return _minNode(root)
  }
  // 搜索最小键
  this.max = function () {
    return _maxNode(root)
  }

  // 私有 搜索特定值 函数
  var _searchNode = function (node, key) {
    if (node === null) {
      return false
    }
    if (key < node.key) {
      return _searchNode(node.left, key)
    } else if (key > node.key) {
      return _searchNode(node.right, key)
    } else {
      return true
    }
  }

  this.search = function (key) {
    return _searchNode(root, key)
  }

  var _findMinNode = function (node) {
    if (node) {
      while (node && node.left !== null) {
        node = node.left
      }

      return node
    }
    return null
  }

  // 私有 移除键 函数
  var _removeNode = function (node, key) {
    if (node === null) { // {2}
      return null
    }
    if (key < node.key) { // {3}
      node.left = _removeNode(node.left, key) // {4}
      return node // {5}
    } else if (key > node.key) { // {6}
      node.right = _removeNode(node.right, key) // {7}
      return node // {8}
    } else { // 键等于 node.key
      // 第一种情况 -- 一个叶节点
      if (node.left === null && node.right === null) { // {9}
        node = null // {10}
        return node // {11}
      }

      // 第二种情况 -- 一个只有一个子节点的节点
      if (node.left === null) { // {12}
        node = node.right // {13}
        return node // {14}
      } else if (node.right === null) { // {15}
        node = node.left // {16}
        return node // {17}
      }

      // 第三种情况 -- 一个有两个子节点的节点
      var aux = _findMinNode(node.right) // {18}
      node.key = aux.key // {19}
      node.right = _removeNode(node.right, aux.key) // {20}
      return node // {21}
    }
  }

  this.remove = function (key) {
    root = _removeNode(root, key)
  }
}

var tree = new BinarySearchTree()
tree.insert(7)
tree.insert(15)
tree.insert(5)
tree.insert(3)
tree.insert(9)
tree.insert(8)
tree.insert(10)
tree.insert(13)
tree.insert(12)
tree.insert(14)
tree.insert(20)
tree.insert(18)
tree.insert(25)
tree.insert(6)

function printNode(value) {
  console.log(value)
}

tree.inOrderTraverse(printNode)