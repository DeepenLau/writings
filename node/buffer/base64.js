// 一张大图片转 base64 会大 3分之1


// 一个汉字3个字节
// 1.通过 buffer 拿到16进制的三个字节
// 2.转成二进制
// 3.三个二进制拼接
// 4.按四个字节一组划分
// 5.每组转成10进制的数字
// 6.通过10进制的数字在固定的编码字符串中取值
// 7.出来就是banse64编码的内容

let r = Buffer.from('一')
console.log(r) // e4 b8 80

let a = r.reduce((prev, next) => {
  return `${prev.toString(2)}${next.toString(2)}`
})

let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
str += str.toLowerCase()
str += '0123456789+/'

let base64 = a.match(/\d{6}/g).reduce((prev, next, index, arr) => {
  let num1 = parseInt(prev, 2)
  let num2 = parseInt(next, 2)
  if (index > 1) {
    return prev + str[num2]
  }
  return `${str[num1]}${str[num2]}`
})

console.log(base64)


// console.log((0xe4).toString(2))
// console.log((0xb8).toString(2))
// console.log((0x80).toString(2))
// 11100100
// 10111000
// 10000000

// 111001 001011 100010 000000
// console.log(parseInt('111001', 2)) // 57
// console.log(parseInt('001011', 2)) // 11
// console.log(parseInt('100010', 2)) // 34
// console.log(parseInt('000000', 2)) // 0

// console.log(str.length)

// let base64 = str[57] + str[11] + str[34] + str[0]
// console.log(base64)
// console.log(r.toString('base64')) // 5LiA