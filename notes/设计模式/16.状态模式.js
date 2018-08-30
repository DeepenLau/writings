/**
 * 状态模式
 * 把事物的每种状态都封装成单独的类，跟此种状态有关的行为都封装在这个类的内部
 *
 * 弊端 16.6
 * - 定义很多类，增加不少对象
 * - 逻辑分散，无法在一个地方就看出整个状态机的逻辑
 */

/**
 * 传统面向对象 电灯例子
 */

// 抽象出一个状态父类，所有状态继承这个父类，并约定子类必须实现 buttonWasPressed 方法
var State = function() {}
State.prototype.buttonWasPressed = function() {
  throw new Error('子类必须实现 buttonWasPressed 方法')
}


// OffLightState
var OffLightState = function(light){
  this.light = light
}
OffLightState.prototype = new State()
OffLightState.prototype.buttonWasPressed = function() {
  console.log('弱光') // offLightState 对应的行为
  // 切换状态到 weakLightState
  this.light.setState(this.light.weakLightState)
}

// WeakLightState
var WeakLightState = function(light){
  this.light = light
}
WeakLightState.prototype = new State()
WeakLightState.prototype.buttonWasPressed = function() {
  console.log('强光') // WeakLightState 对应的行为
  // 切换状态到 strongLightState
  this.light.setState(this.light.strongLightState)
}

// StrongLightState
var StrongLightState = function(light){
  this.light = light
}
StrongLightState.prototype = new State()
StrongLightState.prototype.buttonWasPressed = function() {
  console.log('超强光') // StrongLightState 对应的行为
  // 切换状态到 OffLightState
  this.light.setState(this.light.superStrongLightState)
}
// 新增 SuperStrongLightState
var SuperStrongLightState = function(light){
  this.light = light
}
SuperStrongLightState.prototype = new State()
SuperStrongLightState.prototype.buttonWasPressed = function() {
  console.log('关灯') // SuperStrongLightState 对应的行为
  // 切换状态到 OffLightState
  this.light.setState(this.light.offLightState)
}

var Light = function(){
  this.offLightState = new OffLightState(this)
  this.weakLightState = new WeakLightState(this)
  this.strongLightState = new StrongLightState(this)
  this.superStrongLightState = new SuperStrongLightState(this)
  this.button = null
}

Light.prototype.init = function(){
  var button = document.createElement('button')
  var self = this

  this.button = document.body.appendChild(button)
  this.button.innerHTML = '开关'

  this.currState = this.offLightState

  this.button.onclick = function() {
    self.currState.buttonWasPressed()
  }
}

Light.prototype.setState = function(newState) {
  this.currState = newState
}

/******************************************************************************************************/

/**
 * javascript 版本的 电灯例子
 */
var Light = function () {
  this.currState = FSM.off // 这是当前状态
  this.button = null
}

Light.prototype.init = function() {
  var button = document.createElement('button')
  self = this

  button.innerHTML = '已关灯'
  this.button = document.body.appendChild(button)
  this.button.onclick = function() {
    // 把请求委托给 FSM 状态机
    self.currState.buttonWasPressed.call(self)
  }
}

var FSM = {
  off: {
    buttonWasPressed: function() {
      console.log('关灯')
      this.button.innerHTML = '下一次按我是开灯'
      this.currState = FSM.on
    }
  },
  on: {
    buttonWasPressed: function() {
      console.log('开灯')
      this.button.innerHTML = '下一次按我是关灯'
      this.currState = FSM.off
    }
  }
}

var light = new Light()
light.init()

/******************************************************************************************************/

/**
 * delegate(委托) 函数
 */
var delegate = function(client, delegation) {
  return {
    buttonWasPressed: function() {
      // 将客户的操作委托给 delegation 对象
      return delegation.buttonWasPressed.apply(client, arguments)
    }
  }
}

var FSM = {
  off: {
    buttonWasPressed: function() {
      console.log('关灯')
      this.button.innerHTML = '下一次按我是开灯'
      this.currState = this.onState
    }
  },
  on: {
    buttonWasPressed: function() {
      console.log('开灯')
      this.button.innerHTML = '下一次按我是关灯'
      this.currState = this.offState
    }
  }
}

var Light = function() {
  this.offState = delegate(this, FSM.off)
  this.onState = delegate(this, FSM.on)
  this.currState = this.offState // 设置初始状态为关闭状态
  this.button = null
}

Light.prototype.init = function() {
  var button = document.createElement('button')
  self = this

  button.innerHTML = '已关灯'
  this.button = document.body.appendChild(button)
  this.button.onclick = function() {
    self.currState.buttonWasPressed()
  }
}

var light = new Light()
light.init()
/******************************************************************************************************/

/**
 * javascript 状态机库
 * https://github.com/jakesgordon/javascript-state-machine
 */

var fsm = StateMachine.create({
  initial: 'off',
  events: [
    { name: 'buttonWasPressed', from: 'off', to: 'on' },
    { name: 'buttonWasPressed', from: 'on', to: 'off' }
  ],
  callbacks: {
    onbuttonWasPressed: function(event, from, to) {
      console.log(arguments)
    }
  },
  error: function(eventName, from, to, args, errorCode, errorMessage) {
    console.log(arguments) // 从一种状态试图切换到一种不可能到达的状态的时候（切换状态失败的时候）
  }
})

button.click = function(){
  fsm.buttonWasPressed()
}


/******************************************************************************************************/


/**
 * 文件上传例子
 */
window.external.upload = function(state) {
  console.log(state)  // 可能为 sign、uploading、done、error
}
// 上传插件
var plugin = (function() {
  var plugin = document.createElement('embed')
  plugin.style.display = 'none'

  plugin.type = 'application/txftn-webkit'

  plugin.sign = function() {
    console.log('开始文件扫描')
  }
  plugin.pause = function() {
    console.log('暂停文件上传')
  }
  plugin.uploading = function() {
    console.log('开始文件上传')
  }
  plugin.del = function() {
    console.log('删除文件上传')
  }
  plugin.done = function() {
    console.log('文件上传完成')
  }
  document.body.appendChild(plugin)
  return plugin
})()

var Upload = function(fileName) {
  this.plugin = plugin
  this.fileName = fileName
  this.button1 = null
  this.button2 = null
  this.signState = new SignState(this)  // 初始状态
  this.uploadingState = new UploadingState(this)
  this.pauseState = new PauseState(this)
  this.doneState = new DoneState(this)
  this.errorState = new ErrorState(this)

  this.currState = this.signState  // 设置当前状态
}

Upload.prototype.init = function() {
  this.dom = document.createElement('div')
  this.dom.innerHTML =
  '<span>文件名称：'+ this.fileName +'</span>\
  <button data-action="button1">扫描中</button>\
  <button data-action="button2">删除</button>'

  document.body.appendChild(this.dom)

  this.button1 = this.dom.querySelector('[data-action="button1"]')
  this.button2 = this.dom.querySelector('[data-action="button2"]')

  this.bindEvent()
}

// 给两个按钮绑定事件
Upload.prototype.bindEvent = function() {
  var self = this
  this.button1.onclick = function() {
    self.currState.clickHandler1()
  }

  this.button2.onclick = function() {
    self.currState.clickHandler2()
  }
}

Upload.prototype.sign = function() {
  this.plugin.sign()
  this.currState = this.signState
}
Upload.prototype.uploading = function() {
  this.button1.innerHTML = '正在上传，点击暂停'
  this.plugin.uploading()
  this.currState = this.uploadingState
}
Upload.prototype.pause = function() {
  this.button1.innerHTML = '已暂停，点击继续上传'
  this.plugin.pause()
  this.currState = this.pauseState
}
Upload.prototype.done = function() {
  this.button1.innerHTML = '上传完成'
  this.plugin.done()
  this.currState = this.doneState
}
Upload.prototype.error = function() {
  this.button1.innerHTML = '上传失败'
  this.currState = this.errorState
}
Upload.prototype.del = function() {
  his.plugin.del()
  this.dom.parentNode.removeChild(this.dom)
}

var StateFactory = (function() {
  var State = function() {}

  State.prototype.clickHandler1 = function() {
    throw new Error('子类必须重写父类的 clickHandler1 方法')
  }
  State.prototype.clickHandler2 = function() {
    throw new Error('子类必须重写父类的 clickHandler2 方法')
  }

  return function(param) {
    var F = function(uploadObj) {
      this.uploadObj = uploadObj
    }

    F.prototype = new State()

    for (var i in param) {
      F.prototype[i] = param[i]
    }

    return F
  }
})()

var SignState = StateFactory({
  clickHandler1: function() {
    console.log('扫描中，点击无效...')
  },
  clickHandler2: function() {
    console.log('文件正在上传中，不能删除')
  }
})
var UploadingState = StateFactory({
  clickHandler1: function() {
    this.uploadObj.pause()
  },
  clickHandler2: function() {
    console.log('文件正在上传中，不能删除')
  }
})
var PauseState = StateFactory({
  clickHandler1: function() {
    this.uploadObj.uploading()
  },
  clickHandler2: function() {
    this.uploadObj.del()
  }
})
var DoneState = StateFactory({
  clickHandler1: function() {
    console.log('文件已上传完成，点击无效')
  },
  clickHandler2: function() {
    this.uploadObj.del()
  }
})
var ErrorState = StateFactory({
  clickHandler1: function() {
    console.log('文件上传失败，点击无效')
  },
  clickHandler2: function() {
    this.uploadObj.del()
  }
})

// 测试
var uploadObj = new Upload('xxxxxx')
uploadObj.init()
window.external.upload = function(state){
  uploadObj[state]()
}

window.external.upload('sign')

setTimeout(() => {
  window.external.upload('uploading') // 1秒开始上传
}, 1000)

setTimeout(() => {
  window.external.upload('done') // 5秒上传完成
}, 5000)

// Upload.prototype.changeState = function(state) {
//   switch(state) {
//     case 'sign':
//       this.plugin.sign()
//       this.button1.innerHTML = '扫描中，任何操作无效'
//       break
//     case 'uploading':
//       this.plugin.uploading()
//       this.button1.innerHTML = '正在上传，点击暂停'
//       break
//     case 'pause':
//       this.plugin.pause()
//       this.button1.innerHTML = '已暂停，点击继续上传'
//       break
//     case 'done':
//       this.plugin.done()
//       this.button1.innerHTML = '上传完成'
//       break
//     case 'del':
//       this.plugin.del()
//       this.dom.parentNode.removeChild(this.dom)
//       console.log('删除完成')
//       break
//   }

//   this.state = state
// }
