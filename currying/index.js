// function sum(...args) {
//   let result = args.reduce((prev, current, index) => {
//     return prev + current
//   })
//   return result
// }

function sum(x) {
  let result = x
  return function add(y) {
    if (!y) return result
    result += y
    return add
  }
}

function add() {
  var args = []

  return function tmp(...arguments) {
    if (arguments.length === 0) {
      // 没有参数了，输出结果
      return args.reduce((prev, current) => {
        return prev + current
      })
    }
    [].push.apply(args, arguments)

    return tmp
  }
}

let sum = add()


function curry(fn) {
  let fnArgsLenth = 0
  console.log(fnArgsLenth)
  let arr = []
  return function cb(...args) {

    args.forEach((item) => {
      arr.push(item)
    })
    console.log(arr.length, fnArgsLenth)
    if (0 === args.length) {
      return fn.apply(this, arr)
    }
    fnArgsLenth += 1
    return cb
  }
}

function add(...args) {
  return args.reduce((prev, current) => {
    return prev + current
  })
}
function add(a, b, c, d) {
  const args = [a, b, c, d]
  return args.reduce((prev, current) => {
    return prev + current
  })
}

let sum = curry(add)


// let result1 = sum(1, 2, 3)
let result2 = sum(1)(2)(3, 4, 5)(6)
// let result3 = sum(1, 2)(3)

console.log('result2: ', result2)

function sum(x) {
  return function (y) {
    return x + y
  }
}
console.log(sum(1)(2))

// 第二版
function sub_curry(fn) {
  var args = [].slice.call(arguments, 1);
  return function() {
      return fn.apply(this, args.concat([].slice.call(arguments)));
  };
}

function curry(fn, length) {

  length = length || fn.length;

  var slice = Array.prototype.slice;

  return function() {
      if (arguments.length < length) {
          var combined = [fn].concat(slice.call(arguments));
          return curry(sub_curry.apply(this, combined), length - arguments.length);
      } else {
          return fn.apply(this, arguments);
      }
  };
}


var fn = curry(function(...args) {
  console.log(args);
});

fn("a", "b", "c") // ["a", "b", "c"]
fn("a", "b")("c") // ["a", "b", "c"]
fn("a")("b")("c") // ["a", "b", "c"]
fn("a")("b", "c") // ["a", "b", "c"]


// 柯里化之前
function add(x, y) {
  return x + y;
}

add(1, 2) // 3

// 柯里化之后
function addX(y) {
  return function (x) {
    return x + y;
  };
}

console.log(addX(2)(1)) // 3


function add(a, b, c, d) {
  const args = [a, b, c, d]
  return args.reduce((prev, current) => {
    return prev + current
  })
}
function curry(fn) {
  let tmpArgs = []
  let fnArgsLen = fn.length
  return function cb(...args) {
    args.forEach(item => tmpArgs.push(item))
    console.log(fnArgsLen, tmpArgs)
    if (fnArgsLen === tmpArgs.length) {
      return fn.apply(null, tmpArgs)
    }
    return cb
  }
}

let sum = curry(add)
let result = sum(1, 2)(3)(4)
console.log(result)


function add(...args) {
  return args.reduce((prev, current) => {
    return prev + current
  })
}

function curry(fn) {
  let tmpArgs = []

  return function cb(...args) {
    args.forEach(item => tmpArgs.push(item))

    if (args.length === 0) {
      return fn.apply(null, tmpArgs)
    }
    return cb
  }
}
let sum = curry(add)
let result = sum(1,2,3,4)
console.log(result())