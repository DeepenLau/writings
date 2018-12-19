const {
  Tapable,
  SyncHook,
  SyncBailHook,
  AsyncParallelHook,
  AsyncSeriesHook
} = require('tapable')

const Compilation = require('./Compilation')

class Compiler extends Tapable {
  constructor(context) {
    super()
    this.hooks = {
      beforeRun: new AsyncSeriesHook(['compiler']),
      run: new AsyncSeriesHook(['compiler']),
      compilation: new SyncHook(['compilation']),

      beforeCompile: new AsyncSeriesHook(),
      compile: new SyncHook(),
      make: new AsyncParallelHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),
			emit: new AsyncSeriesHook(["compilation"]),

      entryOption: new SyncBailHook(["context", "entry"])
    }

    // this.resolverFactory = new ResolverFactory()

    this.name = undefined

    this.outputPath = ""

    this.context = context

    this.options = ({})
  }

  run(callback) {
    const finalCallback = (err) => {
      if (callback !== undefined) return callback(err)
    }

    const onCompiled = (err, compilation) => {
      if (err) return finalCallback(err)
      console.log('完成编译，开始输出')
      // console.log(compilation)
      this.emitAssets(compilation, err => {
        if (err) return finalCallback(err)

        this.emitRecords(err => {
          if (err) return finalCallback(err)

          this.hooks.done.callAsync(stats, err => {
            if (err) return finalCallback(err)
            return finalCallback(null, stats)
          })
        })
      })
    }

    this.hooks.beforeRun.callAsync(this, err => {
      if (err) return finalCallback(err)
      console.log('beforeRun')

      this.hooks.run.callAsync(this, err => {
        if (err) return finalCallback(err)
        console.log('run')
        this.compile(onCompiled)
      })
    })
  }


  compile(callback) {
    console.log('beforeCompile')
    this.hooks.beforeCompile.callAsync(err => {
      if (err) return callback(err)
      this.hooks.compile.call()
      console.log('compile')

      const compilation = new Compilation(this)

      this.hooks.make.callAsync(compilation, err => {
        if (err) return callback(err)

        compilation.finish()

        compilation.seal(err => {
          if (err) return callback(err)
          console.log('完成了 seal')
          this.hooks.afterCompile.callAsync(compilation, err => {
            if (err) return callback(err)

            return callback(null, compilation)
          })
        })
      })
    })
  }

  emitAssets(compilation, callback) {
    this.hooks.emit.callAsync(compilation, err => {
      if (err) return callback(err);
      // console.log(compilation.assets)
			// outputPath = compilation.getPath(this.outputPath);
      // this.outputFileSystem.mkdirp(outputPath, emitFiles);

		});
  }

  emitRecords(callback) {}
}

module.exports = Compiler
