/**
 * 享元(flyweight)模式
 * 用于性能优化的模式
 * 核心是运用共享技术来有效支持大量细粒度的对象
 * 如果系统中因为创建了大量类似的对象而导致内存占用过高，享元模式就非常有用了
 * 享元模式的目标是尽量减少共享对象的数量
 * 一种用时间换空间的优化模式
 *
 * 适用情况
 * - 一个程序中使用了大量的相似对象
 * - 由于使用了大量对象，造成很大的内存开销
 * - 对象的大多数状态都可以变为外部状态
 * - 剥离出对象的外部状态之后，可以用相对较少的共享对象取代大量对象
 */

/**
 * 文件上传例子
 */

var Upload = function(uploadType) {
  this.upload = uploadType
  // this.fileName = fileName
  // this.fileSize = fileSize
  // this.dom = null
}

// Upload.prototype.init = function(id) {
//   var that = this
//   this.id = id
//   this.dom = document.createElement('div')
//   this.dom.innerHTML = `
//     <span>文件名称：${this.fileName}，文件大小：${this.fileSize}</span>
//     <button class="delFile">删除</button>
//   `
//   this.dom.querySelector('.delFile').onclick = function() {
//     that.delFile()
//   }
//   document.body.appendChild(this.dom)
// }

Upload.prototype.delFile = function() {
  UploadManager.setExternalState(id, this)

  if (this.fileSize < 3000) {
    return this.dom.parentNode.removeChild(this.dom)
  }

  if (window.confirm('确定删除该文件吗？' + this.fileName)) {
    return this.dom.parentNode.removeChild(this.dom)
  }
}

// 工厂函数进行对象实例化
// 如果某种内部状态对应的共享对象已经被创建过，那么直接返回这个对象，否则创建一个新的对象
var UploadFactory = (function(){
  var createdFlyWeightObjs = {}

  return {
    create: function(uploadType) {
      if (createdFlyWeightObjs[uploadType]) {
        return createdFlyWeightObjs[uploadType]
      }
      return createdFlyWeightObjs[uploadType] = new Upload(uploadType)
    }
  }
})()

var uploadManager = (function(){
  var uploadDatabase = {}

  return {
    add: function(id, uploadType, fileName, fileSize){
      var flyWeightObj = UploadFactory.create(uploadType)

      this.dom = document.createElement('div')
      this.dom.innerHTML = `
        <span>文件名称：${this.fileName}，文件大小：${this.fileSize}</span>
        <button class="delFile">删除</button>
      `
      this.dom.querySelector('.delFile').onclick = function() {
        that.delFile()
      }
      document.body.appendChild(this.dom)

      uploadDatabase[id] = {
        fileName: fileName,
        fileSize: fileSize,
        dom: dom
      }

      return flyWeightObj
    },

    setExternalState: function(id, flyWeightObj) {
      var uploadData = uploadDatabase[id]
      for (var i in uploadData) {
        flyWeightObj[i] = uploadData[i]
      }
    }
  }
})()

var id = 0

// uploadType 区分是控件还是flash
window.startUpload = function(uploadType, files) {
  for (var i = 0, file; file = files[i++];) {
    var uploadObj = uploadManager.add(++id, uploadType, file.fileName, file.fileSize)
  }
}

startUpload('plugin', [
  { fileName: '1.txt', fileSize: 1000 },
  { fileName: '2.txt', fileSize: 3000 },
  { fileName: '3.txt', fileSize: 5000 },
])
startUpload('flash', [
  { fileName: '4.txt', fileSize: 1000 },
  { fileName: '5.txt', fileSize: 3000 },
  { fileName: '6.txt', fileSize: 5000 },
])




/************************************************************************************/

/**
 * 没有内部状态的享元
 */
var Upload = function(){}

var UploadFactory = (function(){
  var uploadObj

  return {
    create: function() {
      if (uploadObj) {
        return uploadObj
      }
      return uploadObj = new Upload()
    }
  }
})()

// 无需改动 uploadManager


/************************************************************************************/

/**
 * 没有外部状态的享元
 */




/************************************************************************************/



/**
 * 对象池
 */

// 定义一个获取小气泡节点的工厂
var toolTipFactory = (function(){
  var toolTipPool = []

  return {
    create: function(){
      // 如果对象池为空
      if (toolTipPool.length === 0) {
        // 创建一个 dom
        var div = document.createElement('div')
        document.body.appendChild(div)
        return div
      } else { // 对象池不为空
        // 则从对象池中取出一个 dom
        return toolTipPool.shift()
      }
    },
    recover: function(tooltipDom){
      // 对象池回收 dom
      return toolTipPool.push(tooltipDom)
    }
  }
})()


// 第一次启动
var ary = []

for (var i = 0, str; str = ['A', 'B'][i++];) {
  var toolTip = toolTipFactory.create()
  toolTip.innerHTML = str
  ary.push(toolTip)
}

// 回收
for (var i = 0, toolTip; toolTip = ary[i++];) {
  toolTipFactory.recover(toolTip)
}

// 再建6个
for (var i = 0, str; str = ['A', 'B', 'C', 'D', 'E', 'F'][i++];) {
  var toolTip = toolTipFactory.create()
  toolTip.innerHTML = str
  ary.push(toolTip)
}

/**
 * 通用对象池
 */

var objectPoolFactory = (function(createObjFn){
  var objectPool = []

  return {
    create: function(){
      // 如果对象池为空
      if (objectPool.length === 0) {
        // 创建一个 dom
        var obj = createObjFn.apply(this, arguments)
        return obj
      } else { // 对象池不为空
        // 则从对象池中取出一个 dom
        return objectPool.shift()
      }
    },
    recover: function(obj){
      // 对象池回收 dom
      return objectPool.push(obj)
    }
  }
})()

// 创建 iframe 的对象池

var iframeFactory = objectFactory(function(){
  var iframe = document.createElement('iframe')
  document.body.appendChild(iframe)

  iframe.onload = function() {
    // 防止 iframe 重复加载的 bug
    iframe.onload = null
    // iframe 加载完成之后回收节点
    iframeFactory.recover(iframe)
  }

  return iframe
})

var iframe1 = iframeFactory.create()
iframe1.src = 'http://baidu.com'

var iframe2 = iframeFactory.create()
iframe2.src = 'http://qq.com'

setTimeout(() => {
  var iframe3 = iframeFactory.create()
  iframe3.src = 'http://163.com'
})