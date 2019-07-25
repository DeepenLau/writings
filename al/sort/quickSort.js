// const arr = [];

// // 生成随机整数
// function random(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min
// }

// // 生成len长度的随机数组
// function generateArr(len) {
//   for (var i = 0; i < len; i++) {
//     arr.push(random(1, len))
//   }
// }

// // 统计占用了多少空间
// let sum = 0

// function quickSort(arr) {
//   if(arr.length <= 1){
//     return arr;
//   }
//   let pivotIndex = Math.floor(arr.length / 2)
//   let pivot = arr.splice(pivotIndex, 1)[0]

//   const left = []
//   const right = []

//   for (let i = 1; i < arr.length; i++) {
//     if (pivot > arr[i]) {
//       left.push(arr[i])
//     } else {
//       right.push(arr[i])
//     }
//   }
//   // return quickSort(left).concat([temp], quickSort(right))
//   sum = right.length + left.length + sum
//   return [...quickSort(left), pivot, ...quickSort(right)]
// }

// // 生成十万个成员的数组
// generateArr(100000)

// // 将数组反向排序,目的是使得接下来的快排达到最差情况,也就是O(n㏒n)的复杂度
// arr.sort((a, b) => b - a)
// quickSort(arr)
// console.log(sum)

const arr = [4,5,2,6,7,3,5,0,6]

function swap (array, a, b) {
  [array[a], array[b]] = [array[b], array[a]]
  console.log(array)
}


function quick (array, left, right) {
  let index
  if (array.length > 1) {
    index = partition(array, left, right)
    if (left < index - 1) {
      quick(array, left, index - 1)
    }
    if (index < right) {
      quick(array, index, right)
    }
  }
  return array
}

const arr2 = [4,5,2,26,7,6,5,1,4,61]
function partition(array, left, right) {
  const pivot = array[Math.floor((right + left)/2)] //array[5]
  let i = left
  let j = right

  while(i <= j) {
    while (compare(array[i], pivot) === -1) {
      i++
    }
    while (compare(array[j], pivot) === 1) {
    }
    if (i <= j) {
      swap(array, i, j)
      i++
      j--
    }
  }
  console.log('return i ', i)
  return i
}

function compare(a, b){
  if (a === b) {
    return 0
  }
  return a < b ? -1 : 1
}

function quickSort(array) {
  return quick(array, 0, array.length - 1)
}

console.log(quickSort(arr2))

