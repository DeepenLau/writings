import P from './P.js'

function a () {
  return new P((resolve, reject) => {
    setTimeout(() => {
      resolve('a')
    }, 2000)
  })
}
function b () {
  return new P((resolve, reject) => {
    setTimeout(() => {
      resolve('b')
    }, 3000)
  })
}

a().then(res => {
  console.log(res)
  console.log(1)
  return b()
}).then(res => {
  console.log(res)
})