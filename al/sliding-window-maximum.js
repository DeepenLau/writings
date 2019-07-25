// https://leetcode-cn.com/problems/sliding-window-maximum/submissions/

// 优先队列，大顶堆(MaxHeap)
var maxSlidingWindow = function(nums, k) {}

// 双端队列（deque）
var maxSlidingWindow = function(nums, k) {}


// 自己实现的
var maxSlidingWindow = function(nums, k) {
  let result = []
  if (!nums.length) return result
  function slide(start, size) {
    let inWindowEles = nums.slice(start, size)
    if (inWindowEles.length < k) return
    let currentMax = Math.max.apply(null, inWindowEles)
    result.push(currentMax)
    slide(start+1, size+1)
  }

  slide(0, k)

  return result
}

maxSlidingWindow([1,3,4,-3,5,3,6,7], 3)
