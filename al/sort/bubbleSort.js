const arr = [1, 2, 20, 10, 30, 2];
function swap(arr, i, j){
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}
// 冒泡排序
// function bubbleSort(arr){
//   for(let i = 0; i < arr.length - 1; i++){
//     for(let j = 0; j < arr.length - i - 1; j++){
//       if(arr[j] > arr[j + 1]){
//         let temp = arr[j];
//         arr[j] = arr[j+1];
//         arr[j+1] = temp;
//       }
//     }
//   }
//   return arr;
// }

// console.log(bubbleSort(arr));
// 时间复杂度：O(n^2) 空间复杂度：O(1)

// 冒泡排序优化
// 加一个标志位，如果没有进行交换，将标志位置为false，表示排序完成
function bubbleSort2(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let flag = false
    for(let j = 0; j < arr.length - i - 1; j++) {
      if(arr[j] > arr[j + 1]){
        swap(arr, j, j+1);
        flag = true
      }
    }
    if (!flag) {
      break
    }
  }
  return arr;
}

console.log(bubbleSort2(arr));


function debounce(fn, delay){
  let timer
  clearTimeout(timer)
  return function () {
    timer = setTimeout(() => {
      fn()
    }, delay)
  }
}

function a() {
  console.log(111)
}

setInterval(() => {
  debounce(a, 2000)
}, 1000)