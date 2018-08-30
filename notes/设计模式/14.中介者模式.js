/**
 * 中介者模式
 * 迎合迪米特法则（最少知识原则）的一种实现
 *
 * 弊端
 * 中介者对象复杂，难以维护
 */

/**
 * 例子：泡泡堂
 */
function Player(name, teamColor) {
  this.partners = []  // 队友列表
  this.enemies = []   // 敌人列表
  this.state = 'alive' // 玩家状态
  this.name = name    // 角色名字
  this.teamColor = teamColor // 队伍颜色
}

Player.prototype.win = function() {
  console.log('winner:' + this.name)
}

Player.prototype.lose = function() {
  console.log('loser:' + this.name)
}

Player.prototype.die = function() {
  var all_died = true

  this.state = 'dead' // 设置玩家状态死亡
  this.lose()         // 应该在这里调用本玩家失败
  for (var i = 0, partner; partner = this.partners[i++];) {
    if (partner.state !== 'dead') {
      // 如果还有一个队友没有死亡，则游戏还未失败
      all_died = false
      break
    }
  }

  if (all_died) {
    // this.lose() 书上的位置
    for (var i = 0, partner; partner = this.partners[i++];) {
      // 通知所有队友玩家游戏失败
      partner.lose()
    }

    for (var i = 0, enemy; enemy = this.enemies[i++];) {
      // 通知所有敌人玩家游戏胜利
      enemy.win()
    }
  }
}

// 定义一个工厂来创建玩家
var players = []
var playerFactory = function(name, teamColor) {
  var newPlayer = new Player(name, teamColor)

  for (var i = 0, player; player = players[i++];) {
    // 通知所有玩家，有新角色加入
    if (player.teamColor === newPlayer.teamColor) {
      // 如果是同一队的玩家
      // 相互添加队友列表
      player.partners.push(newPlayer)
      newPlayer.partners.push(player)
    } else {
      // 相互添加敌人列表
      player.enemies.push(newPlayer)
      newPlayer.enemies.push(player)
    }
  }

  players.push(newPlayer)
  return newPlayer
}

var Player1 = playerFactory('玩家1', 'red')
var Player2 = playerFactory('玩家2', 'red')
var Player3 = playerFactory('玩家3', 'red')
var Player4 = playerFactory('玩家4', 'red')

var Player5 = playerFactory('玩家5', 'blue')
var Player6 = playerFactory('玩家6', 'blue')
var Player7 = playerFactory('玩家7', 'blue')
var Player8 = playerFactory('玩家8', 'blue')

// console.log(players)
Player1.die()
Player2.die()
Player3.die()
// Player4.die()


/************************************************************************************************/

/**
 * 中介者模式改造泡泡堂
 */

function Player(name, teamColor) {
  this.state = 'alive' // 玩家状态
  this.name = name    // 角色名字
  this.teamColor = teamColor // 队伍颜色
}

Player.prototype.win = function() {
  console.log(this.name + ' won')
}

Player.prototype.lose = function() {
  console.log(this.name + ' lost')
}

/************** 玩家死亡 **************/
Player.prototype.die = function() {
  this.state = 'dead'
  // 给中介者发送消息，玩家死亡
  playerDirector.ReceiveMessage('playerDead', this)
}
/************** 移除玩家 **************/
Player.prototype.remove = function() {
  // 给中介者发送消息，移除一个玩家
  playerDirector.ReceiveMessage('removePlayer', this)
}
/************** 玩家换队 **************/
Player.prototype.changeTeam = function(color) {
  // 给中介者发送消息，玩家换队
  playerDirector.ReceiveMessage('changeTeam', this, color)
}


// 定义一个工厂来创建玩家
var playerFactory = function(name, teamColor) {
  var newPlayer = new Player(name, teamColor)
  // 给中介者发送消息，新增玩家
  playerDirector.ReceiveMessage('addPlayer', newPlayer)
  return newPlayer
}

// 中介者 playerDirector
var playerDirector = (function(){
  var players = {}
  // 中介者可以执行的操作
  var operations = {}

  /****************** 新增一个玩家 ******************/
  operations.addPlayer = function(player) {
    var teamColor = player.teamColor
    // 如果该颜色的玩家还没有成立队伍则新成立一个队伍
    players[teamColor] = players[teamColor] || []
    // 添加玩家进队伍
    players[teamColor].push(player)
  }

  /****************** 移除一个玩家 ******************/
  operations.removePlayer = function(player) {
    var teamColor = player.teamColor
    var teamPlayers = players[teamColor] || []

    for (var i = teamPlayers.length - 1; i >= 0; i--) {
      if (teamPlayers[i] === player) {
        teamPlayers.splice(i, 1)
      }
    }
  }

  /****************** 玩家换队 ******************/
  operations.changeTeam = function(player, newTeamColor) {
    // 从原队伍删除
    operations.removePlayer(player)
    // 改变队伍颜色
    player.teamColor = newTeamColor
    // 加入新队伍
    operations.addPlayer(player)
  }

  /****************** 玩家死亡 ******************/
  operations.playerDead = function(player) {
    var teamColor = player.teamColor
    var teamPlayers = players[teamColor]
    var all_died = true

    for (var i = 0, player; player = teamPlayers[i++];) {
      if (player.state !== 'dead') {
        // 如果还有一个队友没有死亡，则游戏还未失败
        all_died = false
        break
      }
    }

    if (all_died) {
      for (var i = 0, player; player = teamPlayers[i++];) {
        // 本队玩家游戏失败
        player.lose()
      }

      for (var color in players) {
        if (color !== teamColor) {
          // 其他队伍的玩家
          var teamPlayers = players[color]
          for (var i = 0, player; player = teamPlayers[i++];) {
            // 其他队伍的所有玩家 win
            player.win()
          }
        }
      }
    }
  }

  var ReceiveMessage = function() {
    // 第一个参数消息名称
    var message = Array.prototype.shift.call(arguments)
    operations[message].apply(this, arguments)
  }

  return {
    ReceiveMessage
  }
})()

var Player1 = playerFactory('玩家1', 'red')
var Player2 = playerFactory('玩家2', 'red')
var Player3 = playerFactory('玩家3', 'red')
var Player4 = playerFactory('玩家4', 'red')

var Player5 = playerFactory('玩家5', 'blue')
var Player6 = playerFactory('玩家6', 'blue')
var Player7 = playerFactory('玩家7', 'blue')
var Player8 = playerFactory('玩家8', 'blue')

// console.log(players)
Player1.remove()
Player2.changeTeam('blue')
Player3.die()
Player4.die()

/******************************************************************************/

/**
 * 中介者模式例子：购物车
 */
/**
dom:

选择颜色：
<select id="colorSelect">
  <option value="">请选择</option>
  <option value="red">红色</option>
  <option value="blue">蓝色</option>
</select>
<br>
选择内存：
<select id="memorySelect">
  <option value="">请选择</option>
  <option value="16g">16g</option>
  <option value="32g">32g</option>
</select>
<br>
输入购买数量：
<input type="text" id="numberInput">

您选择了颜色 <div id="colorInfo"></div>
<br>
您选择了颜色 <div id="memoryInfo"></div>
<br>
您输入了数量 <div id="numberInfo"></div>
<br>

<button id="nextBtn" disabled="true">请选择手机颜色和购买数量</button>
 */

var goods = {
  'red|32G': 3,
  'red|16G': 0,
  'blue|32G': 1,
  'blue|16G': 6
}

var mediator = (function(){
  var colorSelect = document.getElementById('colorSelect')
  var numberInput = document.getElementById('numberInput')
  var memorySelect = document.getElementById('memorySelect')
  var colorInfo = document.getElementById('colorInfo')
  var numberInfo = document.getElementById('numberInfo')
  var memoryInfo = document.getElementById('memoryInfo')
  var nextBtn = document.getElementById('nextBtn')

  return {
    changed: function(obj) {
      var color = colorSelect.value  // 颜色
      var memory = memorySelect.value  // 内存
      var number = numberInput.value  // 数量
      var stock = goods[`${color}|${memory}`] // 颜色，内存对应的库存

      if (obj === colorSelect) {
        colorInfo.innerHTML = color
      } else if (obj === memorySelect) {
        memoryInfo.innerHTML = memory
      } else if (obj === numberInput) {
        numberInfo.innerHTML = number
      }

      if (!color) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '请选择手机颜色'
        return
      }

      // if (((number - 0) | 0) !== number - 0) {
      if (+number <= 0 ) {
        // 用户输入的购买数量是否为正整数
        nextBtn.disabled = true
        nextBtn.innerHTML = '请输入正确的购买数量'
        return
      }

      if (number > stock) {
        nextBtn.disabled = true
        nextBtn.innerHTML = '库存不足'
      }

      nextBtn.disabled = false
      nextBtn.innerHTML = '放入购物车'

    }
  }
})()

// 事件函数
colorSelect.onchange = function() {
  mediator.changed(this)
}
memorySelect.onchange = function() {
  mediator.changed(this)
}
numberInput.onchange = function() {
  mediator.changed(this)
}