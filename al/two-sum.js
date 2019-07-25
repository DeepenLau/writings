// https://leetcode-cn.com/problems/two-sum/


/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j]
      }
    }
  }
}

var twoSum = function(nums, target) {
  let Xindex = 0
  let Yindex = 1
  nums.every((x, index) => {
    let y = target - x

    for (let i = index + 1; i < nums.length; i++) {
      if (y === nums[i]) {
        Xindex = index
        Yindex = i
        return false
      }
    }
    return true
  })

  return [Xindex, Yindex]
}

let result = twoSum([3,2,3], 6)
console.log(result)