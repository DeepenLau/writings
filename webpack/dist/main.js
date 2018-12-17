
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
  
        "./src/baz.js": (function(module, exports, __mypack_require__) {
          "use strict";

module.exports = 'baz.js 里面的内容';
        })
      ,
        "./src/bar.js": (function(module, exports, __mypack_require__) {
          "use strict";

var baz = __mypack_require__('./src/baz.js');

console.log(baz);
module.exports = 'bar.js 的内容';
        })
      ,
        "./src/index.css": (function(module, exports, __mypack_require__) {
          "use strict";

var style = document.createElement('style');
style.innerText = "body {  background: red;}";
document.head.appendChild(style);
        })
      ,
  "./src/index.js": (function(module, exports, __mypack_require__) {
    "use strict";

var bar = __mypack_require__('./src/bar.js');

console.log(bar);

__mypack_require__('./src/index.css');

function foo() {
  console.log('打包成功');
}

foo();
  })
});
