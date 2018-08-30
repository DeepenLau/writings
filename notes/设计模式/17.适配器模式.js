/**
 * 适配器模式
 *
 * 外观模式(19章)的作用和适配器比较相似，有人把外观模式看成一组对象的适配器，外观模式的最显著特点是定义了一个新的接口
 */

var gooleMap = {
  show: function() {
    console.log('开始渲染谷歌地图')
  }
}
var baiduMap = {
  display: function() {
    console.log('开始渲染百度地图')
  }
}

var baiduMapAdapter = {
  show: function() {
    return baiduMap.display()
  }
}

var renderMap = function(mao) {
  if (map.show instanceof Function) {
    map.show()
  }
}

renderMap(gooleMap)
renderMap(baiduMapAdapter)


/******************************************************************************************************/

var getGuangdongCity = function() {
  var guangdongcity = [
    {
      name: 'shenzhen',
      id: 11
    },
    {
      name: 'guangzhou',
      id: 12
    }
  ]

  return guangdongcity
}

var render = function(fn) {
  console.log('开始渲染广东地图')
  document.write(JSON.stringify(fn()))
}

render(getGuangdongCity)

// 新加数据, 并改了数据结构
var guangdongcity = {
  shenzhen: 11,
  guangzhou: 12,
  zhuhai:13
}

// 适配器, 旧的数据结构转成新的
var addressAdapter = function(oldAddressfn) {
  var address = {}
  var oldAddress = oldAddressfn()

  for (var i = 0, c; c = oldAddress[i++];) {
    address[c.name] = c.id
  }

  return function() {
    return address
  }
}

render(addressAdapter(getGuangdongCity))