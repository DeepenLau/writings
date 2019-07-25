import Dep from './Dep.js'
import nextTick from './next-tick.js'

let has = {}
let queue = []
let waiting = false

export function queueWatcher(watcher) {
  const id = watcher.id
  if (!has[id]) {
    has[id] = true
    queue.push(watcher)
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

function flushSchedulerQueue() {

  queue.forEach(watcher => {
    has[watcher.id] = null
    watcher.run()
  })

  waiting = false
}

let uid = 0

export default class Watcher {
  constructor(data, key) {
    Dep.target = this
    this.id = ++uid
    this.data = data
    this.value = data[key]
    this.key = key
    // 为了确保每个属性有自己独立的 Watcher ，需要把上一个 this 解绑
    Dep.target = null
  }

  update() {
    console.log(`watcher ${this.key} update id:${this.id} 当前 update 的值是：${this.data[this.key]}`)
    queueWatcher(this)
  }

  run() {
    console.log(`更新 watcher id = ${this.id} 的 ${this.key} 属性到 dom 最新的值: ${this.data[this.key]}`)
  }
}