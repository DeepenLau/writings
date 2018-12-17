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