/**
 * 模板方法模式
 * 基于继承的设计模式
 * 只需使用继承就可以实现的非常简单的模式
 * 一种严重依赖抽象类的设计模式
 *
 * 使用场景
 * 构建一系列 ui 组件
 */

/**
 * Coffee or Tea
 */
// 饮料类
var Beverage = function() {}

Beverage.prototype.boilWater = function() {
  console.log('把水煮沸')
}

Beverage.prototype.brew = function() {
  // 冲泡
  // 空方法，应该由子类重写
  throw new Error('子类必须重写 brew 方法')
}
Beverage.prototype.pourInCup = function() {
  // 倒入杯子
  // 空方法，应该由子类重写
  throw new Error('子类必须重写 pourInCup 方法')
}
Beverage.prototype.addCondiments = function() {
  // 加料
  // 空方法，应该由子类重写
  throw new Error('子类必须重写 addCondiments 方法')
}
Beverage.prototype.customerWantsCondiments = function() {
  // 钩子
  // 默认需要调料
  return true
}

// init 为模板方法
// 该方法封装了子类的算法框架
// 它作为一个算法的模板，指导子类以何种顺序去执行哪些方法
Beverage.prototype.init = function() {
  this.boilWater()
  this.brew()
  this.pourInCup()
  if (this.customerWantsCondiments()) {
    this.addCondiments()
  }
}

// Coffee 类
var Coffee = function(){}

Coffee.prototype = new Beverage()

Coffee.prototype.brew = function() {
  console.log('用沸水冲泡咖啡')
}
Coffee.prototype.pourInCup = function() {
  console.log('把咖啡倒进杯子')
}
Coffee.prototype.addCondiments = function() {
  console.log('加糖和牛奶')
}

var coffee = new Coffee()
coffee.init()



// CoffeeWithHook 类
var CoffeeWithHook = function(){}

CoffeeWithHook.prototype = new Beverage()

CoffeeWithHook.prototype.brew = function() {
  console.log('用沸水冲泡咖啡')
}
CoffeeWithHook.prototype.pourInCup = function() {
  console.log('把咖啡倒进杯子')
}
CoffeeWithHook.prototype.addCondiments = function() {
  console.log('加糖和牛奶')
}
CoffeeWithHook.prototype.customerWantsCondiments = function() {
  return window.confirm('请问需要调料吗？')
}

var coffeeWithHook = new Coffee()
coffeeWithHook.init()


// Tea 类
var Tea = function(){}

Tea.prototype = new Beverage()

Tea.prototype.brew = function() {
  console.log('用沸水冲泡茶叶')
}
Tea.prototype.pourInCup = function() {
  console.log('把茶倒进杯子')
}
Tea.prototype.addCondiments = function() {
  console.log('加柠檬')
}

var tea = new Tea()
tea.init()


/**
 * 不使用“继承”方式
 */
var Beverage = function(param) {
  var boilWater = function() {
    console.log('把水煮沸')
  }

  var brew = param.brew || function() {
    throw new Error('必须传递 brew 方法')
  }
  var pourInCup = param.pourInCup || function() {
    throw new Error('必须传递 pourInCup 方法')
  }
  var addCondiments = param.addCondiments || function() {
    throw new Error('必须传递 addCondiments 方法')
  }

  var F = function() {}

  F.prototype.init = function() {
    boilWater()
    brew()
    pourInCup()
    addCondiments()
  }

  return F
}

var Coffee = Beverage({
  brew: function() {
    console.log('用沸水冲泡咖啡')
  },
  pourInCup: function() {
    console.log('把咖啡倒进杯子')
  },
  addCondiments: function() {
    console.log('加糖和牛奶')
  }
})
var Tea = Beverage({
  brew: function() {
    console.log('用沸水冲泡茶叶')
  },
  pourInCup: function() {
    console.log('把茶倒进杯子')
  },
  addCondiments: function() {
    console.log('加柠檬')
  }
})

var coffee = new Coffee()
var tea = new Tea()
coffee.init()
tea.init()