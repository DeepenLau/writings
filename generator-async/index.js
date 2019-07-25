

function * a() {
  yield Promise.resolve(1)
  yield Promise.resolve(1)
}

const g = a()
g.next().value.then(res => console.log(res))
// console.log(g.next())
// console.log(g.next())