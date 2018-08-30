/**
 * 策略模式
 * 定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换
 *
 * 一个基于策略模式的程序至少由两部分组成
 * 第一部分是一组策略类，策略类封装了具体的算法，并负责具体的计算过程
 * 第二部分是环境类Context, Context接受客户的请求，随后把请求委托某一个策略类
 * 要做到这点，说明 Context 中要维持对某个策略对象的引用
 */

/**
 * 基于传统面向对象语言的模仿
 */
// 封装对应策略类
var performanceS = function() {}
performanceS.prototype.calculate = function (salary) {
  return salary * 4
}

var performanceA = function () {}
performanceA.prototype.calculate = function (salary) {
}

var performanceB = function () {}
performanceB.prototype.calculate = function (salary) {
  return salary * 2
}

// 定义奖金类 Bonus
var Bonus = function() {
  // 原始工资
  this.salary = null
  // 绩效等级对应的策略对象
  this.strategy = null
}

Bonus.prototype.setSalary = function(salary) {
  // 设置员工的原始工资
  this.salary = salary
}

Bonus.prototype.setStrategy = function(strategy) {
  // 设置员工绩效等级对应的策略对象
  this.strategy = strategy
}

// 取得奖金数额
Bonus.prototype.getBonus = function() {
  // 把计算奖金的操作委托给对应的策略对象
  return this.strategy.calculate(this.salary)
}


const obj = new Bonus()
obj.setSalary(1000)
obj.setStrategy(new performanceA())
obj.getBonus()


/**
 * JavaScript 版本的策略模式
 */
var strategies = {
  'S': function(salary) {
    return salary * 4
  },
  'A': function(salary) {
    return salary * 3
  },
  'B': function(salary) {
    return salary * 2
  }
}

var calculateBonus = function(level, salary) {
  return strategies[level](salary)
}

console.log(calculateBonus('S', 2000))
console.log(calculateBonus('A', 1000))

/**
 * 使用策略模式实现缓动动画
 */
// 缓动算法
// 参数：t:动画已消耗的时间，b:小球原始位置，c:小球目标位置，d:动画持续的总时间
// 返回值：动画元素应该处在的当前位置
var tween = {
  linear: function(t, b, c, d) {
    return c * t / d + b
  },
  easeIn: function(t, b, c, d) {
    return c * (t /= d) * t + b
  },
  strongEaseIn: function(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b
  },
  strongEaseOut: function(t, b, c, d) {
    return c * ( ( t = t / d - 1) * t * t * t * t + 1 ) + b
  },
  sineaseIn: function(t, b, c, d) {
    return c * ( t /= d) * t * t + b
  },
  sineaseOut: function(t, b, c, d) {
    return c * ( ( t = t / d - 1) * t * t + 1 ) + b
  }
}

// 定义 Animate 类
var Animate = function(dom) {
  this.dom = dom           // 进行动画的 dom 节点
  this.startTime = 0       // 动画开始时间
  this.startPos = 0        // 动画开始时，dom 节点的位置，即 dom 的初始位置
  this.endPos = 0          // 动画结束时，dom 节点的位置，即 dom 的目标位置
  this.propertyName = null // dom 节点需要被改变的 css 的属性名
  this.easing = null       // 缓动算法
  this.duration = null     // 动画持续时间
}


/**
 * 启动动画方法
 * @param {String} propertyName  要改变的 css 属性名
 * @param {Number} endPos        小球运动的目标位置
 * @param {Number} duration      动画持续时间
 * @param {String} easing        缓动算法
 */
Animate.prototype.start = function(propertyName, endPos, duration, easing) {
  // 动画启动时间
  this.startTime = +new Date
  // dom 节点初始位置
  this.startPos = this.dom.getBoundingClientRect()[propertyName]
  // dom 节点需要被改变的 css 属性名
  this.propertyName = propertyName
  // dom 节点目标位置
  this.endPos = endPos
  // 动画持续时间
  this.duration = duration
  // 缓动算法
  this.easing = tween[easing]

  var self = this

  // 启动定时器，开始执行动画
  var timeId = setInterval(function() {
    if (self.step() === false) {
      // 如果动画已结束，则清除定时器
      clearInterval(timeId)
    }
  }, 19)
}

// 小球运动的每一帧要做的事情
// 这里负责计算小球的当前位置和调用更新 css 属性的方法 Animate.prototype.update
Animate.prototype.step = function() {
  var t = +new Date // 取得当前时间

  if (t >= this.startTime + this.duration) {
    // 如果当前时间大于动画开始时间加上动画持续时间之和，说明动画结束，此时要修正小球的位置
    // 因为这一帧开始之后，小球的位置已经接近了目标位置，但很可能不完全等于目标位置
    // 此时我们要主动修正小球的当前位置为最终的目标位置
    // 此外让 Animate.prototype.step 方法返回 false，可以通知 Animate.prototype.start 方法清除定时器
    // 更新小球的 css 属性值
    this.update(this.endPos)
    return false
  }

  var pos = this.easing(t - this.startTime, this.startPos, this.endPos - this.startPos, this.duration)
  // pos 为小球当前位置
  this.update(pos) // 更新小球的 css 属性值
}

// 负责更新小球 css 属性值的 Animate.prototype.update 方法
Animate.prototype.update = function(pos) {
  this.dom.style[this.propertyName] = pos + 'px'
}

var div = document.getElementById('div')
var animate = new Animate(div)

animate.start('left', 500, 1000, 'strongEaseOut')

/**
 * 表单验证
 */
// 策略对象
var strategies = {
  isNonEmpty: function(value, errorMsg) {
    // 不为空
    if (value === '') {
      return errorMsg
    }
  },

  minLength: function(value, length, errorMsg) {
    // 限制最小长度
    if (value.length < length) {
      return errorMsg
    }
  },

  isMobile: function(value, errorMsg) {
    // 手机号码格式
    if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
      return errorMsg
    }
  }
}

// 客户调用代码
var validateFunc = function() {
  var validator = new Validator()

  // 添加一些校验规则
  validator.add(registerForm.userName, [
    { strategy: 'isNonEmpty', errorMsg: '用户名不能为空' },
    { strategy: 'minLength:4', errorMsg: '用户名长度不能少于4位' }
  ])
  validator.add(registerForm.password, [
    { strategy: 'minLength:6', errorMsg: '密码长度不能少于6位' }
  ])
  validator.add(registerForm.phoneNumber, [
    { strategy: 'isMobile', errorMsg: '手机号码格式不正确' }
  ])

  // 获得校验结果
  var errorMsg = validator.start()
  return errorMsg
}

var registerForm = document.getElementById('registerForm')

registerForm.onsubmit = function() {
  var errorMsg = validateFunc()
  // 有 errorMsg，则未通过校验
  if (errorMsg) {
    alert(errorMsg)
    return false
  }
}

var Validator = function() {
  this.cache = []
}

Validator.prototype.add = function(dom, rules) {
  var self = this

  for (var i = 0, rule; rule = rules[i++];) {
    (function(rule) {
      var strategyAry = rule.strategy.split(':')
      var errorMsg = rule.errorMsg

      self.cache.push(function() {
        var strategy = strategyAry.shift()
        strategyAry.unshift(dom.value)
        ary.push(errorMsg)
        return strategies[strategy].apply(dom, strategyAry)
      })
    })(rule)
  }

  /****** 单条验证 *******/
  // // 把 strategy 和参数分开
  // var ary = rule.split(':')
  // // 把校验的步骤用空函数包装起来，并且放入 cache
  // this.cache.push(function() {
  //   // 用户挑选的 strategy
  //   var strategy = ary.shift()
  //   // 把 input 的 value 添加进参数列表
  //   ary.unshift(dom.value)
  //   // 把 errorMsg 添加进参数列表
  //   ary.push(errorMsg)

  //   return strategies[strategy].apply(dom, ary)
  // })
}

Validator.prototype.start = function() {
  for (var i = 0, validateFunc; validateFunc = this.cache[i++];) {
    // 开始校验，并取得校验后的返回信息
    var msg = validateFunc()
    // 如果有确切的返回值，说明校验没有通过
    if (msg) {
      return msg
    }
  }
}