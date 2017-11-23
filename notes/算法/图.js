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

function Graph () {
  var vertices = []
  var adjList = new Dictionary()

  this.addVertex = function (v) {
    vertices.push(v)
    adjList.set(v, [])
  }

  this.addEdge = function (v, w) {
    adjList.get(v).push(w) // 在 v 顶点的边列表里加入 w 顶点，v --> w
    adjList.get(w).push(v) // 在 w 顶点的边列表里加入 v 顶点，w --> v
                           // 最终实现连接 v 和 w 的无向图   v <--> w
  }

  this.toString = function () {
    var s = ''
    for (var i=0; i<vertices.length; i++) {
      s += vertices[i] + ' -> '
      var neighbors = adjList.get(vertices[i])
      for (var j=0; j<neighbors.length; j++) {
        s += neighbors[j] + ' '
      }
      s += '\n'
    }
    return s
  }

  var _initializeColor = function () {
    var color = []
    for (var i=0; i<vertices.length; i++) {
      color[vertices[i]] = 'white' //{1}
    }
    return color
  }

  this.bfs = function (v, callback) {
    var color = _initializeColor() //{2}
    var queue = new Queue() //{3}
    queue.enqueue(v) //{4}

    while (!queue.isEmpty()) { //{5}
      var u = queue.dequeue() //{6}
      var neighbors = adjList.get(u) //{7}
      color[u] = 'grey' //{8}

      for (var i=0; i<neighbors.length; i++) {//{9}
        var w = neighbors[i]//{10}

        if(color[w] === 'white') { //{11}
          color[w] = 'grey' //{12}
          queue.enqueue(w) //{13}
        }
      }
      color[u] = 'black' //{14}
      if (callback) { //{15}
        callback(u)
      }
    }
  }

  this.BFS = function (v) {
    var color = _initializeColor()
    var queue = new Queue()
    var d = [] //{1}
    var pred = [] //{2}
    queue.enqueue(v)

    for (var i=0; i<vertices.length; i++) {//{3}
      d[vertices[i]] = 0 //{4}

      pred[vertices[i]] = null //{5}
    }

    while (!queue.isEmpty()) {
      var u = queue.dequeue()
      var neighbors = adjList.get(u)
      color[u] = 'grey'

      for (var i=0; i<neighbors.length; i++) {
        var w = neighbors[i]
        if (color[w] === 'white') {
          color[w] = 'grey'
          d[w] = d[u] + 1 //{6}
          pred[w] = u //{7}
          queue.enqueue(w)
        }
      }
      color[u] = 'black'
    }
    return {//{8}
      distances: d,
      predecessors: pred
    }
  }

}

var graph = new Graph()
var myVertices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

for(var i=0; i<myVertices.length; i++) {
  graph.addVertex(myVertices[i])
}

graph.addEdge('A', 'B')
graph.addEdge('A', 'C')
graph.addEdge('A', 'D')
graph.addEdge('C', 'D')
graph.addEdge('C', 'G')
graph.addEdge('D', 'G')
graph.addEdge('D', 'H')
graph.addEdge('B', 'E')
graph.addEdge('B', 'F')
graph.addEdge('E', 'I')

console.log(graph.toString())

function printNode (value) {//{16}
  console.log('Visited vertex: ' + value) //{17}
}

graph.bfs(myVertices[0], printNode)

var shortestPathA = graph.BFS(myVertices[0])
console.log(shortestPathA)

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

function Graph () {
  var vertices = []
  var adjList = new Dictionary()

  this.addVertex = function (v) {
    vertices.push(v)
    adjList.set(v, [])
  }

  this.addEdge = function (v, w) {
    adjList.get(v).push(w) // 在 v 顶点的边列表里加入 w 顶点，v --> w
    adjList.get(w).push(v) // 在 w 顶点的边列表里加入 v 顶点，w --> v
                           // 最终实现连接 v 和 w 的无向图   v <--> w
  }

  this.toString = function () {
    var s = ''
    for (var i=0; i<vertices.length; i++) {
      s += vertices[i] + ' -> '
      var neighbors = adjList.get(vertices[i])
      for (var j=0; j<neighbors.length; j++) {
        s += neighbors[j] + ' '
      }
      s += '\n'
    }
    return s
  }

  var _initializeColor = function () {
    var color = []
    for (var i=0; i<vertices.length; i++) {
      color[vertices[i]] = 'white' //{1}
    }
    return color
  }

  // 广度优先算法
  this.bfs = function (v, callback) {
    var color = _initializeColor() //{2}
    var queue = new Queue() //{3}
    queue.enqueue(v) //{4}

    while (!queue.isEmpty()) { //{5}
      var u = queue.dequeue() //{6}
      var neighbors = adjList.get(u) //{7}
      color[u] = 'grey' //{8}

      for (var i=0; i<neighbors.length; i++) {//{9}
        var w = neighbors[i]//{10}

        if(color[w] === 'white') { //{11}
          color[w] = 'grey' //{12}
          queue.enqueue(w) //{13}
        }
      }
      color[u] = 'black' //{14}
      if (callback) { //{15}
        callback(u)
      }
    }
  }

  this.BFS = function (v) {
    var color = _initializeColor()
    var queue = new Queue()
    var d = [] //{1}
    var pred = [] //{2}
    queue.enqueue(v)

    for (var i=0; i<vertices.length; i++) {//{3}
      d[vertices[i]] = 0 //{4}

      pred[vertices[i]] = null //{5}
    }

    while (!queue.isEmpty()) {
      var u = queue.dequeue()
      var neighbors = adjList.get(u)
      color[u] = 'grey'

      for (var i=0; i<neighbors.length; i++) {
        var w = neighbors[i]
        if (color[w] === 'white') {
          color[w] = 'grey'
          d[w] = d[u] + 1 //{6}
          pred[w] = u //{7}
          queue.enqueue(w)
        }
      }
      color[u] = 'black'
    }
    return {//{8}
      distances: d,
      predecessors: pred
    }
  }

  // 深度优先算法
  this.dfs = function (callback) {
    var color = _initializeColor() //{1}

    for (var i=0; i<vertices.length;i++) { //{2}
      if(color[vertices[i]] === 'white') { //{3}
        _dfsVisit(vertices[i], color, callback) //{4}
      }
    }
  }

  var _dfsVisit = function (u, color, callback) {
    color[u] = 'grey' //{5}
    if (callback) { //{6}
      callback(u)
    }
    var neighbors = adjList.get(u) //{7}
    for (var i=0; i<neighbors.length; i++) { //{8}
      var w = neighbors[i] //{9}
      if (color[w] === 'white') { //{10}
        _dfsVisit(w, color, callback) //{11}
      }
    }
    color[u] = 'black' //{12}
  }

  // 探索深度优先算法
  var time = 0 //{1}
  this.DFS = function (callback) {
    var color = _initializeColor() //{2}
    var d = []
    var f = []
    var p = []
    var time = 0

    for (var i=0; i<vertices.length; i++) { //{3}
      f[vertices[i]] = 0
      f[vertices[i]] = 0
      d[vertices[i]] = null
    }

    for (var i=0; i<vertices.length;i++) { //{2}
      if(color[vertices[i]] === 'white') { //{3}
        _DFSVisit(vertices[i], color, d, f, p) //{4}
      }
    }

    return { //{4}
      discovery: d,
      finished: f,
      predecessors: p
    }
  }

  var _DFSVisit = function (u, color, d, f, p) {
    console.log('discovered ' + u)
    color[u] = 'gery'
    d[u] = ++time //{5}
    var neighbors = adjList.get(u)
    for (var i=0; i<neighbors.length; i++) {
      var w = neighbors[i]
      if (color[w] === 'white') {
        p[w] = u // {6}
        _DFSVisit(w, color, d, f, p)
      }
    }
    color[u] = 'black'
    f[u] = ++time //{7}
    console.log('explored ' + u)
  }
}

var graph = new Graph()
var myVertices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

for(var i=0; i<myVertices.length; i++) {
  graph.addVertex(myVertices[i])
}

graph.addEdge('A', 'B')
graph.addEdge('A', 'C')
graph.addEdge('A', 'D')
graph.addEdge('C', 'D')
graph.addEdge('C', 'G')
graph.addEdge('D', 'G')
graph.addEdge('D', 'H')
graph.addEdge('B', 'E')
graph.addEdge('B', 'F')
graph.addEdge('E', 'I')

console.log(graph.toString())

function printNode (value) {//{16}
  console.log('Visited vertex: ' + value) //{17}
}

graph.bfs(myVertices[0], printNode)

var shortestPathA = graph.BFS(myVertices[0])
console.log(shortestPathA)

// 通过前溯点数组，我们可以用下面这段代码来构建从顶点A到其他顶点的路径
var fromVertex = myVertices[0] //{9}

for (var i=1; i<myVertices.length; i++) {//{10}
  var toVertex = myVertices[i]//{11}
  var path = new Stack() //{12}

  for (var v=toVertex; v!==fromVertex; v=shortestPathA.predecessors[v]) {//{13}
    path.push(v) //{14}
  }

  path.push(fromVertex) //{15}
  var s = path.pop()//{16}
  while (!path.isEmpty()) {//{17}
    s += ' - ' + path.pop() //{18}
  }
  console.log(s)
}