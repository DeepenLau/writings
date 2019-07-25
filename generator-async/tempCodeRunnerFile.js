function fn2() {
  let obj = {
    0: 1,
    1: 2,
    2: 3,
    length: 3,
    [Symbol.iterator]: function * () {
      let index = 0
      while(index !== this.length) {
        yield this[index++]
      }
    }
  }
  const arr = [...obj]
  console.log(arr, Array.isArray(arr))
}

fn2()