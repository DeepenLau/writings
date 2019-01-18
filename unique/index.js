var arr = [1,33,3,4,5,6,7,7,8,9,9,1,2,1]
unique(arr)
// 双循环
function unique(arr) {
  let newArr = []

  for(let i = 0; i < arr.length; i++) {
    for (let j = i+1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        // 重复了
        arr.splice(j,1)
      }
    }
    newArr.push(arr[i])
  }

  return newArr
}
var arr = [1,33,3,4,5,6,7,7,8,9,9,1,2,1]
// indexOf
function unique(arr) {
  let newArr = []

  for (let i = 0; i < arr.length; i++) {
    let current = arr[i]
    if (newArr.indexOf(current) === -1) { // 匹配不到就是不重复，push进 newArr，给下一次用
      newArr.push(current)
    }
  }

  return newArr
}

console.log(unique(arr))

// 先排序，把相同的放一起，判断到前一个和当前相同，就是重复，否则不重复
var arr = [1,33,3,4,5,6,7,7,8,9,9,1,2,1]
function unique(arr) {
  let newArr = []
  arr.sort()
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i+1]) {
      arr.splice(i+1, 1)
    }
    newArr.push(arr[i])
  }
  return newArr
}
console.log(unique(arr))