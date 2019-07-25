// https://leetcode-cn.com/problems/valid-anagram/
// 有效的字母异位词
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
  if (s.length !== t.length) return false
  let map = {}

  s.split('').forEach((item) => {

    if (!map[item]) {
      map[item] = 1
    } else {
      ++map[item]
    }

  })

  t.split('').every((item) => {
    if (!map[item]) {
      return false
    }
    --map[item]
    if (map[item] === 0) {
      delete map[item]
    }
    return true
  })
  if (Object.keys(map).length !== 0) {
    return false
  } else {
    return true
  }
}

console.log(isAnagram('a', 'ab'))

// var isAnagram = function(s, t) {

//   if (s.length !== t.length) return false
//   let map1 = {}
//   let map2 = {}

//   s.split('').forEach((item) => {
//     if (!map1[item]) {
//       map1[item] = 1
//     } else {
//       ++map1[item]
//     }
//   })
//   t.split('').forEach((item) => {
//     if (!map2[item]) {
//       map2[item] = 1
//     } else {
//       ++map2[item]
//     }
//   })

//   let result = true

//   Object.keys(map1).every(key => {
//     if (map1[key] !== map2[key]) {
//       return result = false
//     }
//     return true
//   })

//   return result
// }
