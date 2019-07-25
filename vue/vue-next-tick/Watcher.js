import Dep from './Dep.js'
import nextTick from './next-tick.js'

let has = {}
let queue = []
let waiting = false

function queueWatcher(watcher) {
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
    this.data = data
    this.id = ++uid
    this.value = data[key]
    this.key = key
    Dep.target = null
  }

  update() {
    console.log(`watcher ${this.key} update id ${this.id}`)
    queueWatcher(this)
  }

  run() {
    console.log(`更新 watcher id = ${this.id} 的 ${this.key} 属性到 dom 最新的值: ${this.data[this.key]}`)
  }
}

