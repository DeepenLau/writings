// 泛型不能给静态属性使用，只能实例属性
class GenericNumber<T> {
  zeroValue: T
  add:(x: T, t:T) => T
}

let myGenericNumber = new GenericNumber<number>()

myGenericNumber.zeroValue = 111
myGenericNumber.add = function (x, y) {
  return x + y
}

let stringNumeric = new GenericNumber<string>()

stringNumeric.zeroValue = 'xxx'
stringNumeric.add = function (x, y) {
  return x + y
}

console.log(stringNumeric.add(stringNumeric.zeroValue, ' eeeee'))

interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

loggingIdentity('xxx')

function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}

let x = { a: 1, b: 2, c: 3, d: 4 }
getProperty(x, 'a')
// getProperty(x, 'A')

function create<T>(c: {new(): T}): T {
  return new c()
}

class BeeKeeper {
  hasMask: boolean
}

class LionKeeper {
  nametag: string
}

class Animal {
  numLengs: number
}

class Bee extends Animal {
  keeper: BeeKeeper
}
class Lion extends Animal {
  keeper: LionKeeper
}

function createInstance<T extends Animal>(c: new() => T): T {
  return new c()
}

createInstance(Lion).keeper.nametag
createInstance(Bee).keeper.hasMask
