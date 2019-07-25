

const arr = [15, 20, 10, 30, 2];

function swap(arr, i, j){
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

// 选择排序

function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let index = i
    for (let j = i+1; j < arr.length; j++) {
      if (arr[index] > arr[j]) {
        index = j
      }
    }
    swap(arr, i, index)
  }
  return arr
}

console.log(selectionSort(arr))
/**
[15, 20, 10, 30, 2]
index = 0
i = 0  j = 1  arr[index]=15 > arr[j]=20 false   index = 0
i = 0  j = 2  arr[index]=15 > arr[j]=10 true    index = 2
i = 0  j = 3  arr[index]=15 > arr[j]=30 false   index = 2
i = 0  j = 4  arr[index]=15 > arr[j]=2  true    index = 4
交换 arr[0] arr[4]
[2, 20, 10, 30, 15]

index = 1
i = 1  j = 2  arr[index]=20 > arr[j]=10 true    index = 2
i = 1  j = 3  arr[index]=10 > arr[j]=30 false   index = 2
i = 1  j = 4  arr[index]=10 > arr[j]=15 false   index = 2
交换 arr[1] arr[2]
[2, 10, 20, 30, 15]

index = 2
i = 2  j = 3  arr[index]=20 > arr[j]=30 false   index = 2
i = 2  j = 4  arr[index]=20 > arr[j]=15 true   index = 4
交换 arr[2] arr[4]
[2, 10, 15, 30, 20]

index = 3
i = 3  j = 4  arr[index]=30 > arr[j]=20 true    index = 4
交换 arr[3] arr[4]
[2, 10, 15, 20, 30]

 */
