const {
  AsyncSeriesHook
} = require('tapable')

const Compilation = require('./Compilation')

class Compiler {
  constructor(context) {
    this.hooks = {
      run: new AsyncSeriesHook(['compiler']),
      make: new AsyncSeriesHook(['compilation']),
      emit: new AsyncSeriesHook(['compilation'])
    }
    this.context = context
  }

  run(callback) {
    this.hooks.run.callAsync(this, err => {
      this.compile()
    })
  }

  compile() {
    this.hooks.compile.callAsync(err => {
      const compilation = new Compilation(this)
      this.hooks.make.callAsync(compilation, err => {
        console.log('编译完了')
      })
    })
  }
}

module.exports = Compiler