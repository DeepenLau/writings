#! /usr/bin/env node
let entry = './src/index.js'
let output = './dist/main.js'

let fs = require('fs')
let path = require('path')
let ejs = require('ejs')
let script = fs.readFileSync(entry, 'utf8')
let modules = []

function styleLoader(source) {
  return `
    let style = document.createElement('style');
    style.innerText = ${JSON.stringify(source).replace(/\\r|\\n|\\r\\n/g, '')};
    document.head.appendChild(style);
  `
}

script = script.replace(/require\(['"](.+?)['"]\)/g, function (...args) {
  let name = './' + path.join('./src', args[1])
  let content = fs.readFileSync(name, 'utf8')
  if (/.css$/.test(name)) {
    content = styleLoader(content)
  }
  modules.push({
    name, content
  })
  return `__webpack_require__('${name}')`
})

let template = `
  (function (modules){
    function __mypack_require__(moduleId) {

      var module = {
        exports: {}
      }

      modules[moduleId].call(module.exports, module, module.exports, __mypack_require__)

      return module.exports
    }

    return __mypack_require__("<%-entry%>");
  })({
    "<%-entry%>": (function(module, exports, __webpack_require__) {
      eval(\`<%-script%>\`)
    })
    <%for(let i = 0; i < modules.length; i++) {
      let module = modules[i]%>,
      "<%-module.name%>": (function(module, exports) {
        eval(\`<%-module.content%>\`)
      })
    <%}%>
  })
`

let result = ejs.render(template, {
  entry,
  script,
  modules
})

fs.writeFileSync(output, result)
console.log('成功')