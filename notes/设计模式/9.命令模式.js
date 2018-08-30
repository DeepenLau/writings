/**
 * 命令模式
 * 一个执行默写特定事情的命令
 * 做撤销功能有用
 */
// 传统面向对象的实现
var btn1 = document.getElementById('button1')
var btn2 = document.getElementById('button2')
var btn3 = document.getElementById('button3')

var setCommand = function(button, command) {
  button.onclick = function() {
    command.execute()
  }
}

var MenuBar = {
  refresh: function() {
    console.log('刷新菜单陌路')
  }
}

var SubMenu = {
  add: function() {
    console.log('增加子菜单')
  },
  del: function() {
    console.log('删除子菜单')
  }
}

var RefreshMenuBarCommand = function(receiver) {
  this.receiver = receiver
}
RefreshMenuBarCommand.prototype.execute = function() {
  this.receiver.refresh()
}

var AddSubMenuCommand = function(receiver) {
  this.receiver = receiver
}
AddSubMenuCommand.prototype.execute = function() {
  this.receiver.add()
}

var DelSubMenuCommand = function(receiver) {
  this.receiver = receiver
}
DelSubMenuCommand.prototype.execute = function() {
  console.log('删除子菜单')
}

var refreshMenuBarCommand = new RefreshMenuBarCommand(MenuBar)
var addSubMenuCommand = new AddSubMenuCommand(SubMenu)
var delSubMenuCommand = new DelSubMenuCommand(SubMenu)

setCommand(button1, refreshMenuBarCommand)
setCommand(button2, addSubMenuCommand)
setCommand(button3, delSubMenuCommand)



/**
 * 使用闭包实现的命令模式
 */

var setCommand = function(button, func) {
  button.onclick = function() {
    func()
  }
}

var MenuBar = {
  refresh: function() {
    console.log('刷新菜单陌路')
  }
}

var SubMenu = {
  add: function() {
    console.log('增加子菜单')
  },
  del: function() {
    console.log('删除子菜单')
  }
}

var RefreshMenuBarCommand = function(receiver) {
  return {
    execute: function() {
      receiver.refresh()
    }
  }
}

setCommand(button1, RefreshMenuBarCommand(MenuBar).execute())

/**
 * 控制小球撤销运动
 */
var div = document.getElementById('div')

var pos = document.getElementById('pos')

var moveBtn = document.getElementById('moveBtn')
var cancelBtn = document.getElementById('cancelBtn')

var MoveCommand = function(receiver, pos) {
  this.receiver = receiver
  this.pos = pos
  this.oldPos = null
}

MoveCommand.prototype.execute = function() {
  this.receiver.start('left', this.pos || 500, 1000, 'strongEaseOut')
  this.oldPos = this.receiver.dom.getBoundingClientRect()[this.receiver.propertyName]
}
MoveCommand.prototype.cancel = function() {
  console.log(this.oldPos)
  this.receiver.start('left', this.oldPos, 1000, 'strongEaseOut')
}
var moveCommand
moveBtn.onclick = function() {
  var animate = new Animate(div) // 使用策略模式中的动画类
  moveCommand = new MoveCommand(animate, pos.value)
  moveCommand.execute()
}

cancelBtn.onclick = function () {
  moveCommand.cancel()
}

/**
 * 播放录像
 * 保存每一步命令，重新执行，实现播放录像
 */

var Ryu = {
  attack: function() {
    console.log('攻击')
  },
  defense: function() {
    console.log('防御')
  },
  jump: function() {
    console.log('跳跃')
  },
  crouch: function() {
    console.log('蹲下')
  }
}

var makeCommand = function(receiver, state) {
  return function() {
    receiver[state]()
  }
}

var commands = {
  '119': 'jump',    // w
  '115': 'crouch',  // S
  '97': 'defense',  // A
  '100': 'defense'  // D
}

var commandStack = [] // 保存命令堆栈

document.onkeypress = function(ev) {
  var keyCode = ev.keyCode
  var command = makeCommand(Ryu, commands[keyCode])

  if (command) {
    command() // 执行命令
    // 将刚刚执行过的命令保存进堆栈
    commandStack.push(command)
  }
}

document.getElementById('replay').onclick = function() {
  var command
  // 从堆栈里依次取出命令并执行
  // 用 shift(), 就只能回放一次了
  while (command = commandStack.shift()) {
    comman()
  }
}


/**
 * 宏命令
 * 一次执行一批命令
 */
var closeDoorCommand = {
  execute: function() {
    console.log('关门')
  }
}

var openPCCommand = {
  execute: function() {
    console.log('开电脑')
  }
}

var openQQCommand = {
  execute: function() {
    console.log('登录QQ')
  }
}

var MacroCommand = function() {
  return {
    commandList: [],
    add: function(command) {
      this.commandList.push(command)
    },
    execute: function() {
      for (var i = 0, command; command = this.commandList[i++];) {
        command.execute()
      }
    }
  }
}

var macroCommand = new MacroCommand()

macroCommand.add(closeDoorCommand)
macroCommand.add(openPCCommand)
macroCommand.add(openQQCommand)

macroCommand.execute()