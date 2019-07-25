enum Color {
  Red = 2,
  Green,
  Blue
}

let c: any = Color[2]

let aaa:(number|string) = 111
aaa = 'xxx'


function warn(): (number|string) {
  console.log('xxxxxx')
  return 'xx'
}

let u: number = 111
u = undefined

declare function create(o: object | null): void

create({a: 11})


let someValue: any = 'ffff'

let len: number = (someValue as string).length