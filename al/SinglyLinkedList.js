class ListNode {
  constructor(element) {
    this.element = element
    this.next = null
  }
}

class LinkedList {
  constructor(list) {
    this.tail = null
    this.head = null
    this.length = 0
    list.forEach((element, index) => {
      this.append(element)
    })
  }

  append(element) {
    const node = new ListNode(element)

    if (this.head === null) {
      this.head = node
    } else {

      let current = this.head
      while (current.next) {
        current = current.next
      }
      current.next = node
    }

    this.length++
  }

  reverseList(head) {
    let current = head
    let prev = null


    while (current) {
      let next = current.next
      current.next = prev
      prev = current
      current = next
    }

    return prev
  }

  swapPairs(head) {
    let dummy = new ListNode(0)
    dummy.next = head                  // 保持对 head 的引用
    let pre = dummy
    let cur = head
                                       //  pre      cur
                                       //   0  ->   1   ->   2   ->   3
    while (cur && cur.next) {

                                       // pre               cur
      pre.next = cur.next              //  0   ->   2        1        3

                                       // pre               cur
      cur.next = cur.next.next         //  0   ->   2        1   ->   3

                                       // pre               cur
      pre.next.next = cur              //  0   ->   2   ->   1   ->   3

                                       // 下一轮循环
                                       //                   pre      cur
      pre = cur                        //  0   ->   2   ->   1   ->   3
      cur = cur.next
    }

    return head

    /*
      if (head == null) return null
      if (head.next == null) return head
      let tmp = head.next
      head.next = this.swapPairs(tmp.next)
      tmp.next = head
      return tmp
    */
  }

  hasCycle(head) {
    /* 硬做（在某个时间段内，比如 0.5s 或者 1s 内，找不到 next 指向 null ，就是有闭环，否则没有闭环）
      let start = Date.now()
      let end
      let has = false
      let current = head
      while (current) {
        end = Date.now()
        current = current.next
        if (end - start >= 1000) {
          return has = true
        }
      }
      return has
    */

    /* 快慢指针，类似环形的龟兔赛跑，两个指针相遇了，说明有环，无环类似于直道，永远不会相遇 */
      let fast = head
      let slow = head
      while(slow && fast && fast.next) {
        fast = fast.next.next
        slow = slow.next
        if (fast === slow) {
          return true
        }
      }
      return false


    /* 使用 set，set 的去重机制
      let current = head
      let set = new Set()
      while(current) {
        let a = set.size
        set.add(current)
        let b = set.size
        if (a == b) {
          return true
        }
        current = current.next
      }
      return false
    */

  }
  // 探测环的位置 https://leetcode.com/problems/linked-list-cycle-ii/
  // 快慢节点解法：https://juejin.im/post/59e5544851882551dd311710
  detectCycle(head) {
    let fast = head
    let slow = head
    while(slow && fast && fast.next) {
      fast = fast.next.next
      slow = slow.next
      if (fast === slow) {
        break
      }
    }
    if (fast === null || fast.next === null) return null

    let p = head
    while (p != slow) {
      p = p.next
      slow = slow.next
    }
    return p


    // let current = head
    // let pres = []
    // while(current) {
    //   pres.push(current)
    //   current = current.next
    //   for (let i = 0; i < pres.length; i++) {
    //     if (pres[i] === current) {
    //       return current
    //     }
    //   }
    // }


  }
  indexOf(pos) {
    let current = this.head
    let index = 0
    while (current) {
      if (index === pos) {
        return current
      }
      current = current.next
      index++
    }
  }
  createCycle(pos) {
    let current = this.head
    while (current.next) {
      current = current.next
    }
    if (pos !== -1) {
      current.next = this.indexOf(pos)
    }
    return this.head
  }
}

const list = new LinkedList([1,2,3,4,5])
// const reList = list.reverseList(list.head)

// const a = list.swapPairs(list.head)
// console.log(a)
// list.append()
const head = list.createCycle(2)
const a = list.detectCycle(head)
console.log(a)

