class Template {
  constructor(compiler) {
    this.compiler = compiler
  }

  render(modules) {
    let template = `
      (function(modules) {

        function __mypack_require__(moduleId) {

          var module = {
            exports: {}
          };

          modules[moduleId].call(module.exports, module, module.exports, __mypack_require__);

          return module.exports;
        }

        return __mypack_require__("${modules[0].id}");
      })({
        ${modules.map(item => {
          return `
            "${item.id}": (function(module, exports, __mypack_require__) {
              ${item.content}
            })
          `
        })}
      });
      `
    return template
  }

  generate() {

  }
}
module.exports = Template