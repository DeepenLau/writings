class Compilation {
  constructor(compiler) {
    this.hooks = {
      addEntry: new SyncHook(["entry", "name"])
    }

    this.compiler = compiler
    this.name = undefined
    this.dependency = []
    this.template
  }

  seal() {}

  addEntry() {}
}