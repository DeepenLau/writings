// 斐波那契数列
// 1和2的斐波那契数是1
// n(n>2)的斐波那契数是 (n-1)的斐波那契数 加上 (n-2)的斐波那契数

// 递归方式
function fibonacci (num) {
  if (num === 1 || num === 2) {
    return 1
  }

  return fibonacci(num - 1) + fibonacci(num - 2)
}

// 非递归方式
function fib (num) {
  var n1 = 1
  var n2 = 1
  var n = 1

  for (var i = 3; i <= num; i++) {
    n = n1 + n2
    n1 = n2
    n2 = n
  }

  return n
}

console.log(fibonacci(6))
console.log(fib(6))

// 最少硬币找零问题
// 硬币找零：给出要找零的钱数，以及可用的硬币面额 d1...dn 及其数量，找出有多少种找零方法
// 最少找零问题：给出要找零的钱数，以及可用的硬币面额 d1...dn 及其数量，找出所需的最少的硬币个数

// 例如，美国有一下面额（硬币）：d1=1, d2=5, d3=10, d4=25
// 如果要找36美分的零钱，我们可以用 d1 + d3 + d4

// 解决方案：找到 n 所需的最小硬币数。但要做到这一点，首先得找到对每个 x<n 的解。然后，我们将解建立在更小的值的解的基础上
// 卧槽，看不懂了
function MinCoinChange(coins) {
  var coins = coins
  var cache = {}
}
