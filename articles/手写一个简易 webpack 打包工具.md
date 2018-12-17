---
title: 手写一个简易 webpack 打包工具
date: 2018-12-16 00:30:33
tag: webpack
desc: 学习了解 webpack 打包流程
---


# 手写一个简易 webpack 打包工具

## 前言
大家都知道，webpack 是一个基于 tapable 控制流程的打包工具，
而 tapable 本身控制的东西就是 webpack 插件的执行，
所以 webpack 只是一个中间站，通过 tapable 整合各种插件，最终输出结果。
这篇文章从最简单开始，先实现一个最简单的最简易的 webpack。

## 知己知彼
首先我们先看看一份简单入口文件，webpack 会输出什么结果
由于最新的 webpack4 已经实现是 0 配置构建，所以我们的文件也很简单

```js
// src/index.js 入口文件
console.log('index 的内容')
```
执行命令（记得先自行安装相关依赖）
```sh
# webpack 会默认找 src 目录下的 index.js 文件，然后输出到 dist/main.js
npx webpack --mode devepoment
```
输出：
```js
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("console.log('index 的内容')\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });
```

咋一看好像有点眼花缭乱，那我们就再提取一下信息，只保留关键部分

```js
(function(modules) {
  function __webpack_require__(moduleId) {

    var module = {
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

    return module.exports;
  }

  return __webpack_require__("./src/index.js");
})({
  "./src/index.js":
    (function(module, exports) {
      eval("console.log('index 的内容')");
    })
 });
```

经过提取，其实就是一个 IIFE，最核心的其实就是下面这些，放到 `.html` 文件里面，
在浏览器打开可以看到控制台能打印出 `index 的内容`。
下面我们就以此为模板开始实现一个简易的 webpack，在 webpack 里面最终的输出也是有这样的一个代码模板机制的。

## 开始动手

先给自己的打包工具起一个名字，我就叫它 `mypack`

再屡一下我们接下来要做的事情：
1. 可以在项目根目录下执行命令：`mypack`，就自动完成打包工作
2. 支持模块化引用
3. 简易支持 `loader` 机制（内置）

## 创建命令行
1. 先新建一个 mypack 目录，进入执行 `npm init -y` 初始化项目
2. 在该目录下新建命令行执行文件，我把它放在 `bin/mypack.js`
3. 修改 `package.json` 里面的字段 `bin` 字段
```json
"bin": {
  "mypack": "bin/mypack.js"
},
```
意思就是执行 `mypack` 就会执行 `bin/mypack.js` 这个文件
4. 执行 `npm link`，软链到全局命令环境，就可以直接使用 `mypack` 命令了
5. 要解除软链就直接执行 `npm unlink` 就可以了

接下来我们在 `bin/mypack.js` 里面写点东西
```sh
#! /usr/bin/env node
console.log('命令行创建成功')
```
`#! /usr/bin/env node` 这个告诉终端，用 `node` 来执行当前文件

然后在终端执行 `mypack`，就可以看见打印出`命令行创建成功`

接下来要做的事情，基本都是 `bin/mypack.js` 里面做的

## `bin/mypack.js`

要实现零配置，那我们就先预先定于入口和出口，还有就是拿上面的输出代码作为模板，
同时读取入口文件的内容，很快我们可以写出下面的代码
```sh
# bin/mypack.js
#! /usr/bin/env node
let fs = require('fs')

let entry = './src/index.js'
let output = './dist/main.js'

let script = fs.readFileSync(entry, 'utf8')

let template = `
  (function(modules) {
    function __mypack_require__(moduleId) {
      var module = {
        exports: {}
      };

      modules[moduleId].call(module.exports, module, module.exports, __mypack_require__);

      return module.exports;
    }
    return __mypack_require__("${entry}");
  })({
  "${entry}":
    (function(module, exports) {
      ${script}
    })
  });
`
fs.writeFileSync(output, template)
console.log('打包成功')
```
> 把 `__webpack_require__` 替换成了自己的 `__mypack_require__`

在要执行打包的项目根目录下，新建 `src/index.js` 文件
```js
// src/index.js
function foo() {
  console.log('打包成功')
}
foo()
```

执行 `mypack`，不出意外可以看到在 `dist/main.js` 看到以下结果
```js
(function(modules) {

  function __mypack_require__(moduleId) {

    var module = {
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __mypack_require__);

    return module.exports;
  }

  return __mypack_require__("./src/index.js");
})({
 "./src/index.js":
   (function(module, exports) {
    function foo() {
  console.log('打包成功')
}
foo()
   })
});

```
并且可以在 `.html` 文件里面引用，成功在浏览器里面执行

## 模块引用

那如果我们的入口文件有对其他模块的引用呢
```js
// src/index.js
const bar = require('./bar.js')
console.log(bar)
function foo() {
  console.log('打包成功')
}
foo()
```
```js
// src/bar.js
module.exports = 'bar.js 的内容'
```

我们可以先看看 webpack 的输出长什么样子

```js
// 经过简化的代码
(function(modules) {

  function __webpack_require__(moduleId) {

  var module = {
    exports: {}
  };

  modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

  return module.exports;
}

return __webpack_require__(__webpack_require__.s = "./src/index.js");
 })({
  "./src/bar.js": (function(module, exports) {
    eval("module.exports = 'bar.js 的内容'");
  }),

  "./src/index.js":(function(module, exports, __webpack_require__) {
    eval("const bar = __webpack_require__(/*! ./bar.js */ \"./src/bar.js\")\nconsole.log(bar)\nfunction foo() {\n  console.log('打包成功')\n}\nfoo()");
  })

 });
```

可以看到，在自执行函数的参数多了一个属性
并且在 `./src/index.js` 的模块里把 源代码的 `require` 函数替换成了，自定义的模块执行函数 `__webpack_require__`。
也就是说，在入口文件里面遇到 `require` 函数就会提取该模块，再把该模块加到自执行函数的模块参数里面

那我们的代码就可以改成这样
```sh
#! /usr/bin/env node
let fs = require('fs')
let path = require('path')

let entry = './src/index.js'
let output = './dist/main.js'

let script = fs.readFileSync(entry, 'utf8')

// 定义提取的模块数组
let modules = []
function parseModules(script) {
  // 正则匹配 require() ，提取路径的模块内容并且替换成 __mypack_require__ 函数
  return script.replace(/require\(['"](.*?)['"]\)/g, function (...args) {
    let name = './' + path.join('./src', args[1])
    let content = fs.readFileSync(name, 'utf8')
    // 递归，可能模块里还有模块
    content = parseModules(content)
    modules.push({
      name, content
    })
    return `__mypack_require__('${name}')`
  })
}

script = parseModules(script)

let template = `
(function(modules) {

  function __mypack_require__(moduleId) {

    var module = {
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __mypack_require__);

    return module.exports;
  }

  return __mypack_require__("${entry}");
})({
  ${(
    modules.map(item => { // 可能模块里还有模块，所以每个模块都传入 __mypack_require__ 函数
      return `
        "${item.name}": (function(module, exports, __mypack_require__) {
          ${item.content}
        })
      `
    })
  )},
  "${entry}": (function(module, exports, __mypack_require__) {
    ${script}
  })
});
`
fs.writeFileSync(output, template)
console.log('打包成功')
```

这样，我们的打包出来的代码就成了这样
```js

(function(modules) {
  function __mypack_require__(moduleId) {
    var module = {
      exports: {}
    }

    modules[moduleId].call(module.exports, module, module.exports, __mypack_require__)

    return module.exports
  }

  return __mypack_require__('./src/index.js')
})({
  './src/baz.js': function(module, exports, __mypack_require__) {
    module.exports = 'baz.js 里面的内容'
  },
  './src/bar.js': function(module, exports, __mypack_require__) {
    const baz = __mypack_require__('./src/baz.js')
    console.log(baz)

    module.exports = 'bar.js 的内容'
  },
  './src/index.js': function(module, exports, __mypack_require__) {
    const bar = __mypack_require__('./src/bar.js')
    console.log(bar)
    function foo() {
      console.log('打包成功')
    }
    foo()
  }
});

```

在浏览器也总算可以打印出
```js
baz.js 里面的内容
bar.js 的内容
打包成功
```
这些内容

## 简易 loader 机制

那现在我们再往入口文件里面添加 `.css` 文件

```js
// src/index.js
const bar = require('./bar.js')
console.log(bar)

require('./index.css')

function foo() {
  console.log('打包成功')
}
foo()
```
```css
/* src/index.css */
body {
  background: red;
}
```

这当中的 `.css` 文件就是要经过 `loader` 去处理的

写过 `webpack loader` 的应该都知道，其实就是一个函数

那我们就定义一个简易的 `styleLoader` 和 `cssLoader`

```js
...
function cssLoader(source) {
  source = JSON.stringify(source).replace(/\\r|\\n|\\r\\n/g, '')
  return styleLoader(source)
}

function styleLoader(source) {
  return `
    let style = document.createElement('style');
    style.innerText = ${source};
    document.head.appendChild(style);
  `
}

function parseModules(script) {
  return script.replace(/require\(['"](.*?)['"]\)/g, function (...args) {
    let name = './' + path.join('./src', args[1])
    let content = fs.readFileSync(name, 'utf8')

    if (/.css$/.test(name)) {
      content = cssLoader(content)
    }

    content = parseModules(content)

    modules.push({
      name, content
    })
    return `__mypack_require__('${name}')`
  })
}
...
```

打包完，可以看见多了一个模块

```js
"./src/index.css": (function(module, exports, __mypack_require__) {
  let style = document.createElement('style');
  style.innerText = "body {  background: red;}";
  document.head.appendChild(style);
})
```

在浏览器执行一下，可以发现 css 文件已经生效，背景变红

下面在来把 `ES6` 的代码转移为 `ES5` 的代码
这里我们用 `Babel` 来做这个事情
先安装依赖，一个预设，一个核心库
```sh
npm install --save-dev @babel/preset-env @babel/core
```
写我们的 `babelLoader`
```js
function babelLoader(source) {
  let result = babel.transform(source, {
    presets: [
      require("@babel/preset-env")
    ]
  })
  return result.code
}

function parseModules(script) {
  script = babelLoader(script)

  return script.replace(/require\(['"](.*?)['"]\)/g, function (...args) {
    let name = './' + path.join('./src', args[1])
    let content = fs.readFileSync(name, 'utf8')

    if (/.css$/.test(name)) {
      content = cssLoader(content)
    }

    if (/.js$/.test(name)) {
      content = babelLoader(content)
    }

    content = parseModules(content)

    modules.push({
      name, content
    })
    return `__mypack_require__('${name}')`
  })
}
```

打包之后长这个样子

```js
// ...
// 这里只看模块参数的部分
{
  './src/baz.js': function(module, exports, __mypack_require__) {
    'use strict'

    module.exports = 'baz.js 里面的内容'
  },
  './src/bar.js': function(module, exports, __mypack_require__) {
    'use strict'

    var baz = __mypack_require__('./src/baz.js')

    console.log(baz)
    module.exports = 'bar.js 的内容'
  },
  './src/index.css': function(module, exports, __mypack_require__) {
    'use strict'

    var style = document.createElement('style')
    style.innerText = 'body {  background: red;}'
    document.head.appendChild(style)
  },
  './src/index.js': function(module, exports, __mypack_require__) {
    'use strict'

    var bar = __mypack_require__('./src/bar.js')

    console.log(bar)

    __mypack_require__('./src/index.css')

    function foo() {
      console.log('打包成功')
    }

    foo()
  }
}
```

可以看到，已经转化成了 `ES5` 的代码

到这里我们就实现了一个简易的 webpack

完整代码

```sh
#! /usr/bin/env node
let fs = require('fs')
let path = require('path')
var babel = require("@babel/core")

let entry = './src/index.js'
let output = './dist/main.js'

let script = fs.readFileSync(entry, 'utf8')

let modules = []

function cssLoader(source) {
  source = JSON.stringify(source).replace(/\\r|\\n|\\r\\n/g, '')
  return styleLoader(source)
}

function styleLoader(source) {
  return `
    let style = document.createElement('style');
    style.innerText = ${source};
    document.head.appendChild(style);
  `
}

function babelLoader(source) {
  let result = babel.transform(source, {
    presets: [
      require("@babel/preset-env")
    ]
  })
  return result.code
}

function parseModules(script) {
  script = babelLoader(script)

  return script.replace(/require\(['"](.*?)['"]\)/g, function (...args) {
    let name = './' + path.join('./src', args[1])
    let content = fs.readFileSync(name, 'utf8')

    if (/.css$/.test(name)) {
      content = cssLoader(content)
    }
    if (/.js$/.test(name)) {
      content = babelLoader(content)
    }

    content = parseModules(content)


    modules.push({
      name, content
    })
    return `__mypack_require__('${name}')`
  })
}

script = parseModules(script)

let template = `
(function(modules) {

  function __mypack_require__(moduleId) {

    var module = {
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __mypack_require__);

    return module.exports;
  }

  return __mypack_require__("${entry}");
})({
  ${(
    modules.map(item => {
      return `
        "${item.name}": (function(module, exports, __mypack_require__) {
          ${item.content}
        })
      `
    })
  )},
  "${entry}": (function(module, exports, __mypack_require__) {
    ${script}
  })
});
`
fs.writeFileSync(output, template)
console.log('打包成功')
```

## 总结
1. webpack 的实现肯定要比这个复杂很多，这里相当于提供一个简易的思路
2. webpack 的机制是基于事件流，而这个机制是由 tapable 库提供
3. 有机会的话，我们再来结合 tapable 库来更好地组织代码，并且重构当前代码，实现简易可自定义配置的 `loader` 和 `plugin` 机制

