const arr = [1, 20, 10, 30, 0, 22, 11, 55, 24];

function insertSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let temp = arr[i]
    for (let j = i-1; j >= 0; j--) {
      if (temp < arr[j] && j === 0) {
        // 插到第一的位置
        arr.splice(i, 1)
        arr.splice(0, 0, temp)
        break
      }
      if (temp > arr[j-1] && temp <= arr[j]) {
        arr.splice(i, 1)
        arr.splice(j, 0, temp)
        break
      }
    }
  }
  return arr
}

console.log(insertSort(arr))