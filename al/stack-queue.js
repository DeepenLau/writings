class Stack {
  constructor() {
    this.list = []
  }

  push (element) {
    this.list.push(element)
  }
  // 移除栈顶元素并返回
  pop () {
    return this.list.pop()
  }
  // 返回栈顶元素
  peek () {
    return this.list[this.list.length - 1]
  }
  size () {
    return this.list.length
  }
  isEmpty () {
    return this.list.length === 0
  }
}


/** https://leetcode.com/problems/valid-parentheses/
 * @param {string} s
 * @return {boolean}
 */
var isValidParentheses = function(s) {
  let length
  do {
    length = s.length
    s = s.replace('()', '').replace('[]', '').replace('{}', '')
  } while (length != s.length) {
    return s.length == 0
  }

  /*
    let stack = new Stack()
    let map = {
      ')': '(',
      ']': '[',
      '}': '{'
    }
    for (let c of s) {
      if (!(c in map)) { // c in map c 找的是 map 里面的 key，因为 key 都是右括号，找不到说明是左括号，就 push 的 stack 里面
        stack.push(c)
      } else if (map[c] != stack.pop()) { // 当前 c 是右括号，取出 map 里面对应的左括号，取出栈顶元素，相等则匹配，不相等直接返回 false，提前结束
        return false
      }
    }
    // '()[]{}(' 这种情况下最后剩下 '(',要再判断最后栈是否空
    return !stack.size()
  */

  /*
    let map =  {
      '(': ')',
      '[': ']',
      '{': '}'
    }
    let index = 0
    let stack = new Stack()
    while (index < s.length) {
      let pre = stack.peek()
      stack.push(s[index])
      const current = stack.peek()
      if (map[pre] === current) {
        stack.pop()
        stack.pop()
      }
      index++
    }
    return !stack.size()
  */
}

// console.log(isValidParentheses('()[]{}('))

// 用栈实现队列
class StackToQueue {
  constructor() {
    this.inputStack = new Stack()
    this.outputStack = new Stack()
  }

  push(element) {
    this.inputStack.push(element)
  }

  // 获取队列队列中的第一个
  peek() {
    while (true) {
      let last = this.inputStack.pop()
      if (!last) return this.outputStack.peek()
      this.outputStack.push(last)
    }
  }

  pop() {
    return this.outputStack.pop()
  }

  empty() {
    return this.outputStack.isEmpty()
  }
}

let queue = new StackToQueue()
queue.push(1)
queue.push(2)
queue.push(3)
// console.log(queue.peek())
console.log(queue.pop())
// console.log(queue.pop())
// console.log(queue.peek())
// console.log(queue.peek())
// console.log(queue.empty())

var obj = {
  a: () => {
    console.log(this)
  }
}

obj.a()