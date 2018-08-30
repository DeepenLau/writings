/**
 * duck typing 鸭子类型
 */

var duck = {
  duckSinging: function () {
    console.log('嘎嘎嘎')
  }
}

var chicken = {
  duckSinging: function () {
    console.log('嘎嘎嘎')
  }
}

var choir = []

var joinChoir = function (animal) {
  if (animal && typeof animal.duckSinging === 'function') {
    choir.push(animal)
    console.log('恭喜加入合唱团')
    console.log('合唱团已有成员数量' + choir.length)
  }
}

joinChoir(duck)    // 恭喜加入合唱团
joinChoir(chicken) // 恭喜加入合唱团

/**
 * 多态
 */

var makeSound = function (animal) {
  animal.sound()
}

var Duck = function(){}
Duck.prototype.sound = function () {
  console.log('嘎嘎嘎')
}

var Chicken = function(){}
Chicken.prototype.sound = function () {
  console.log('咯咯咯')
}

makeSound(new Duck())    // 嘎嘎嘎
makeSound(new Chicken()) // 咯咯咯

/**
 * 模拟 private public
 */

var myObject = (function(){
  var __name = 'sven'  // 私有（private）变量

  return {
    getName: function () {  // 公开（public）方法
      return __name
    }
  }
})()

console.log(myObject.getName()) // 输出：sven
console.log(myObject.__name)    // 输出：undefined