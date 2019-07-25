// https://leetcode-cn.com/problems/kth-largest-element-in-a-stream/

// 优先队列，可用堆(二叉堆，大顶堆，小顶堆)解
// 用排序解，不知道为什么 leetcode 上有个测试用例不通过
var KthLargest = function(k, nums) {
  this.k = k
  this.nums = nums
}

KthLargest.prototype.add = function(val) {
  this.nums.push(val)
  this.kth = this.getKth()
  return this.kth
}
KthLargest.prototype.getKth = function() {
  this.nums = this.nums.sort((a, b) => {
    return b - a
  }).slice(0, this.k)
  return this.nums[this.k - 1]
}

let k = 3
let arr = [4,5,8,2]


let kthLargest = new KthLargest(k, arr)

kthLargest.add(11)
console.log(kthLargest)

