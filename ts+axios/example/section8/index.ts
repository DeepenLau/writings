// function extend<T, U>(first: T, second: U): T & U {
//   let result = {} as T & U

//   for (let id in first) {
//     result[id] = first[id] as any
//   }

//   for (let id in second) {
//     if (!result.hasOwnProperty(id)) {
//       result[id] = second[id] as any
//     }
//   }

//   return result
// }

// class Person {
//   constructor(public name: string) {}
// }

// interface Loggable {
//   log(): void
// }

// class ConsoleLogger implements Loggable {
//   log() {}
// }

// var jim = extend(new Person('xxx'), new ConsoleLogger())

// jim.name
// jim.log()


// function padLeft(value: string, padding: string | number) {
//   if(typeof padding === 'number') {
//     return Array(padding + 1).join(' ') + value
//   }

//   if(typeof padding === 'string') {
//     return padding + value
//   }

//   throw new Error(`aksdljfkala ${padding}`)
// }

// console.log(padLeft('Hello world', true))


// class Bird {
//   fly() {
//     console.log('bird fly')
//   }
//   layEggs() {
//     console.log('bird layEggs')
//   }
// }

// class Fish {
//   swim() {
//     console.log('fish swim')
//   }
//   layEggs() {
//     console.log('fish layEggs')
//   }
// }

// function getRandomPet(): Fish | Bird {
//   return Math.random() > 0.5 ? new Bird() : new Fish()
// }

// let pet = getRandomPet()
// if (pet instanceof Bird) {
//   pet.fly()
// }

// if (pet instanceof Fish) {
//   pet.swim()
// }

// function isFish(pet: Fish | Bird): pet is Fish {
//   return (pet as Fish).swim !== undefined
// }

// if (isFish(pet)) {
//   pet.swim()
// } else {
//   pet.fly()
// }

// function isNumber(x: any): x is number {
//   return typeof x === 'number'
// }
// function isString(x: any): x is string {
//   return typeof x === 'string'
// }

// function padLeft(value: string, padding: (number | string)) {
//   if (isNumber(padding)) {
//     return Array(padding + 1).join(' ') + value
//   }
//   if (isString(padding)) {
//     return padding + value
//   }

//   throw new Error(`aksdljfkala ${padding}`)
// }

// console.log(padLeft('xxxx', 1))


// function f(x: number, y?: number) {
//   return x + (y || 0)
// }

// f(1,2)
// f(1)
// f(1, undefined)
// f(1, null)

// class C {
//   a: number
//   b?: number
// }

// let c = new C()
// c.a = 12
// c.a = undefined
// c.b = 13
// c.b = undefined
// c.b = null

// function broken(name: string | null): string {
//   function postfix(epithet: string) {
//     return name.charAt(0) + '. the' + epithet
//   }

//   name = name || 'Bob'
//   return postfix(name)
// }

type Easing = 'ease-in' | 'ease-out'

class UIElement {
  animate(dx: number, dy: number, easing: Easing) {
    // if (easing === 'ease-in') {

    // }
  }
}

let button = new UIElement()
button.animate(0,0,'ease-in')
button.animate(0,0,null)
