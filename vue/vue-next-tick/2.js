/*
let callbacks = []
let pending = false

function nextTick (cb) {
  callbacks.push(cb)

  if (!pending) {
    pending = true
    setTimeout(flushCallbacks, 0);
  }
}

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let uid = 0

class Watcher {
  constructor() {
    this.id = ++uid
  }
  update() {
    console.log('watch' + this.id + ' update')
    queueWatcher(this)
  }

  run() {
    console.log('watch' + this.id + '视图更新啦～')
  }
}

let has = {};
let queue = [];
let waiting = false;

function queueWatcher(watcher) {
    const id = watcher.id;
    if (has[id] == null) {
        has[id] = true;
        queue.push(watcher);

        if (!waiting) {
            waiting = true;
            nextTick(flushSchedulerQueue);
        }
    }
}

function flushSchedulerQueue () {
  let watcher, id;

  for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      id = watcher.id;
      has[id] = null;
      watcher.run();
  }

  waiting  = false;
}

let watch1 = new Watcher();
let watch2 = new Watcher();

watch1.update();
watch1.update();
watch2.update();
*/


var data = {
  foo: 'foo',
  bar: 'bar'
}


function defineReactive(data) {
  for (let key in data) {
    if (typeof data[key] !== null && typeof data[key] === 'object') {
      defineReactive(data[key])
    } else {
      let value = data[key]
      Object.defineProperty(data, key, {
        get() {
          return value
        },
        set(val) {
          console.log(data[key], val)
          if (data[key] === val) return
          data[key] = val
        }
      })
    }
  }
}
defineReactive(data)

let value = 'foo'
let watch1
Object.defineProperty(data, 'foo', {
  get() {
    watch1 = new Watcher()
    return value
  },
  set(val) {
    value = val
    watch1.update()
  }
})


let callbacks = []
let pending = false

function nextTick(cb) {
  callbacks.push(cb)

  if (!pending) {
    setTimeout(flushCallbacks, 0)
  }
}

function flushCallbacks() { // 调用存起来的 callbacks
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let uid = 0
class Watcher {
  constructor() {
    this.id = ++uid
  }

  update() {
    console.log('watch' + this.id + ' update');
    queueWatcher(this)
  }

  run() {
    console.log('watch' + this.id + '视图更新了');
  }
}

let has = {}
let queue = []
let waiting = false

function queueWatcher(watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    queue.push(watcher)

    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

function flushSchedulerQueue() {
  let watcher, id

  for (let i = 0; i < queue.length; i++) {
    watcher = queue[i]
    id = watcher.id
    has[id] = null
    watcher.run()
  }

  waiting = false
}
console.log(data.foo)
data.foo = 'new foo1'
data.foo = 'new foo2'
// setTimeout(() => {
//   data.foo = 'new foo3'
// })


// let watch1 = new Watcher();
// let watch2 = new Watcher();

// watch1.update();
// watch1.update();
// watch2.update();
