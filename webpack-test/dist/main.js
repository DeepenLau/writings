
      (function(modules) {

        function __mypack_require__(moduleId) {

          var module = {
            exports: {}
          };

          modules[moduleId].call(module.exports, module, module.exports, __mypack_require__);

          return module.exports;
        }

        return __mypack_require__("./src/baz.js");
      })({
        
            "./src/baz.js": (function(module, exports, __mypack_require__) {
              module.exports = 'baz.js 里面的内容'
            })
          ,
            "./src/bar.js": (function(module, exports, __mypack_require__) {
              const baz = __mypack_require__('./src/baz.js')
console.log(baz)

module.exports = 'bar.js 的内容'
            })
          ,
            "./src/index.js": (function(module, exports, __mypack_require__) {
              const bar = __mypack_require__('./src/bar.js')
console.log(bar)

function foo() {
  console.log('打包成功')
}
foo()
            })
          
      });
      