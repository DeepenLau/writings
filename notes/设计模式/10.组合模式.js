/**
 * 组合模式
 * 命令模式的组合
 * 10.8 注意事项
 *  - 组合模式不是父子关系，组合对象把请求委托给包含的所有叶对象，能够合作的关键是拥有相同的接口
 *  - 对也对象操作的一致性，除了要求组合对象和叶对象拥有相同的接口之外，还有就是对一组叶对象的操作必须具有一致性
 *  - 双向映射关系，一个叶对象同时在属于两个组合对象，很可萌叶对象被操作两次，这种不适合组合模式，这种情况必须给父节点和子节点建立双向映射关系，但是相互引用过多会相当复杂，此时引入 中介者模式（14章） 来管理这些对象
 *  - 用职责链模式提高组合模式的性能，当树的结构复杂，节点数量多时，遍历树的时候会有性能问题，引入 职责链模式（13章）
 *
 *
 * 10.10 何时使用组合模式
 *  - 表示对象的  部分-整体  层次结构
 *  - 客户希望统一对待树中的所有对象，所有对象统一接口
 */


/**
 * 超级万能遥控器
 * - 打开空调
 * - 打开电视和音响
 * - 关门、开电脑、登录qq
 */

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

var openAcCommand = {
  execute: function() {
    console.log('打开空调')
  }
}

/*** 电视和音响连接在一起，所以用一个宏命令来组合打开电视和打开音响的命令 ***/
var openTvCommand = {
  execute: function() {
    console.log('打开电视')
  }
}

var openSoundCommand = {
  execute: function() {
    console.log('打开音响')
  }
}

var macroCommand1 = new MacroCommand()
macroCommand1.add(openTvCommand)
macroCommand1.add(openSoundCommand)

/*** 关门、开电脑、登录qq组合命令 ***/
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

var macroCommand2 = new MacroCommand()

macroCommand2.add(closeDoorCommand)
macroCommand2.add(openPCCommand)
macroCommand2.add(openQQCommand)


/*** 把所有命令组合成一个 “超级命令” ***/
var macroCommand = new MacroCommand()
macroCommand.add(openAcCommand)
macroCommand.add(macroCommand1)
macroCommand.add(macroCommand2)

/*** 最后给遥控器绑定“超级命令” ***/

var setCommand = (function(command) {
  document.getElementById('button').onclick = function() {
    command.execute()
  }
})(macroCommand)

// 组合模式的透明性使得发起请求的客户不用去顾忌树中组合对象和叶对象的区别
// 但它们在本质上是有区别的

// 组合对象有 add 方法，叶对象没有
// 解决方案，给叶对象增加 add 方法并且报错
var openTvCommand = {
  execute: function() {
    console.log('打开电视')
  },
  add: function() {
    throw new Error('叶对象不能添加子节点')
  }
}





/**
 * 组合模式例子
 * 扫描文件夹
 */
/********* Folder **********/
var Folder = function(name) {
  this.name = name
  this.files = []
}

Folder.prototype.add = function(file) {
  this.files.push(file)
}

Folder.prototype.scan = function() {
  console.log('开始扫描文件夹：%s', this.name)

  for (var i = 0, file, files = this.files; file = files[i++];) {
    file.scan()
  }
}

/********* File **********/
var File = function(name) {
  this.name = name
}

File.prototype.add = function() {
  throw new Error('文件下面不能再添加文件')
}

File.prototype.scan = function() {
  console.log('开始扫描文件：%s', this.name)
}

// 创建一些文件夹和文件对象
var folder = new Folder('学习资料')
var folder1 = new Folder('js')
var folder2 = new Folder('jq')

var file1 = new File('文件1')
var file2 = new File('文件2')
var file3 = new File('文件3')

folder1.add(file1)
folder2.add(file2)

folder.add(folder1)
folder.add(folder2)
folder.add(file3)


// 把移动硬盘里的文件和文件夹都复制到这棵树中
var folder3 = new Folder('Nodejs')
var file4 = new File('文件4')
folder3.add(file4)

var file5 = new File('文件5')

// 把这些文件都添加到原有的树中
folder.add(folder3)
folder.add(file5)

// 扫描整个文件夹
folder.scan()



/**
 * 引用父对象
 */
/************* 扫描文件夹之前，先移除一个具体的文件 *************/
var Folder = function(name) {
  this.name = name
  this.files = []
  this.parent = null // 增加 this.parent 属性
}

Folder.prototype.add = function(file) {
  file.parent = this    // 设置父对象
  this.files.push(file)
}

Folder.prototype.scan = function() {
  console.log('开始扫描文件夹：%s', this.name)

  for (var i = 0, file, files = this.files; file = files[i++];) {
    file.scan()
  }
}

Folder.prototype.remove = function() {
  if (!this.parent) {
    // 根节点或作者树外的游离节点（没有父节点）
    return
  }

  // 如果有父节点存在，此时遍历父节点中保存的子节点列表，删除想要删除的子节点
  for (var files = this.parent.files, l = files.length - 1; l >= 0; l--) {
    var file = files[l]
    if (file === this) {
      files.splice(l, 1)
    }
  }
}

/********* File **********/
var File = function(name) {
  this.name = name
  this.parent = null
}

File.prototype.add = function() {
  throw new Error('文件下面不能再添加文件')
}

File.prototype.scan = function() {
  console.log('开始扫描文件：%s', this.name)
}

File.prototype.remove = function () {
  if (!this.parent) {
    return
  }

  for (var files = this.parent.files, l = files.length - 1; l >= 0; l--) {
    var file = files[l]
    if (file === this) {
      files.splice(l, 1)
    }
  }
}

var folder = new Folder('根文件夹')
var folder1 = new Folder('文件夹1')
var file1 = new File('文件1')

folder1.add(new File('文件2'))
folder.add(folder1)
folder.add(file1)

folder1.remove() // 移除文件夹
// 删除了 folder1 文件夹，剩下根文件夹下面的 文件1
folder.scan()