function ArrayList () {
  var array = []

  this.insert = function (item) {
    array.push(item)
  }

  this.toString = function () {
    return array.join()
  }

  // 冒泡排序
  this.bubbleSort = function () {
    var length = array.length

    for (var i = 0; i<length; i++) {
      for (var j = 0; j<length-1; j++) {
        if (array[j] > array[j+1]) {
          swap(j, j+1)
        }
      }
    }
  }

  // 改进后的冒泡排序（复杂度：O(n^2)）
  this.modifiedBubbleSort = function () {
    var length = array.length
    for (var i = 0; i<length; i++) {
      for (var j = 0; j<length-1-i; j++) {
        if (array[j] > array[j+1]) {
          swap(j, j+1)
        }
      }
    }
  }

  var swap = function(index1, index2) {
    var aux = array[index1]

    array[index1] = array[index2]
    array[index2] = aux
  }


  // 选择排序 （复杂度：O(n^2)））
  this.selectSort = function () {
    var length = array.length// {1}
    var indexMin

    for (var i = 0; i<length-1; i++) {
      indexMin = i
      for (var j=i; j<length; j++) {
        if (array[indexMin]>array[j]) {
          indexMin = j
        }
      }
      if (i !== indexMin) {
        swap(i, indexMin)
      }
    }

  }


  // 插入排序 (排序小型数组时，此算法比选择排序和冒泡排序性能要好)
  this.insertionSort = function () {
    var length = array.length
    var j
    var temp

    for (var i=1; i<length; i++) {
      j = i
      temp = array[i]
      while (j > 0 && array[j-1] > temp) {
        array[j] = array[j-1]
        j--
      }
      array[j] = temp
    }
  }


  // 并归排序（第一个可以被实际使用的排序算法，前三个性能不好，归并排序性能不错，复杂度：O(nlog^n) ）
  this.mergeSort = function () {
    array = mergeSortRec(array)
  }

  var mergeSortRec = function (array) {
    var length = array.length

    if (length === 1) {
      return array
    }

    var mid = Math.floor(length/2)
    var left = array.slice(0, mid)
    var right = array.slice(mid, length)

    return merge(mergeSortRec(left), mergeSortRec(right))
  }

  var merge = function (left, right) {
    var result = []
    var il = 0
    var ir = 0

    while (il < left.length && ir < right.length) {
      if (left[il] < right[ir]) {
        result.push(left[il++])
      } else {
        result.push(right[ir++])
      }
    }

    while (il < left.length) {
      result.push(left[il++])
    }

    while (ir < right.length) {
      result.push(right[ir++])
    }

    return result
  }


  // 快速排序  复杂度：O(nlogn)
  this.quickSort = function () {
    quick(array, 0, array.length - 1)
  }

  var quick = function (array, left, right) {
    var index
    if (array.length > 1) {

      index = partition(array, left, right)

      if (left < index - 1) {
        quick(array, left, index - 1)
      }

      if (index < right) {
        quick(array, index, right)
      }
    }
  }

  var partition = function (array, left, right) {
    var pivot = array[Math.floor((right + left)/2)]
    var i = left
    var j = right

    while (i <= j) {
      while (array[i] < pivot) {
        i++
      }
      while (array[j] > pivot) {
        j--
      }
      if (i <= j) {
        // 书上：swapQuickStort 打错字了吧
        swapQuickSort(array, i, j)
        i++
        j--
      }
    }
    return i
  }

  var swapQuickSort = function (array, index1, index2) {
    var aux = array[index1]
    array[index1] = array[index2]
    array[index2] = aux
  }



  // 顺序搜索
  this.sequentialSearch = function (item) {
    for (var i = 0; i<array.length; i++) {
      if (item === array[i]) {
        return i
      }
    }
    return -1
  }

  // 二分搜索
  this.binarySearch = function (item) {
    this.quickSort()

    var low = 0
    var high = array.length - 1
    var mid
    var element

    while (low <= high) {
      mid = Math.floor((low + high) / 2)
      element = array[mid]
      if (element < item) {
        low = mid + 1
      } else if (element > item) {
        high = mid - 1
      } else {
        return mid
      }
    }
    return -1
  }
}

function createNonSortedArray (size) {
  var array = new ArrayList()

  for (var i = size; i>0; i--) {
    array.insert(i)
  }
  return array
}

var array = createNonSortedArray(5)
console.log(array.toString())
array.bubbleSort()
array.selectSort()
console.log(array.toString())
