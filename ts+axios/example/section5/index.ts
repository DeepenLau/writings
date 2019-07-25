interface Card {
  suit: string
  card: number
}

interface Deck {
  suits: string[]
  cards: number[]

  createCardPicker(this: Deck): () => Card
}

function add(x: number[]): number
function add(x: number): {a: string}

function add(x) {
  if (Array.isArray(x)) {
    return x.reduce((prev, next) => {
      return prev + next
    }, 0)
  } else {
    return true
  }
}

console.log(add([1,2,3]))
console.log(add(1))