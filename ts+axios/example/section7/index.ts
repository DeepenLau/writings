let x = [0, 1, null]

class Animal {
  numLegs: number
}

class Bee extends Animal {

}

class Lion extends Animal {

}

window.onmousedown = function (mouseEvent: any) {
  console.log(mouseEvent.clickTime)
}

function createZoo(): A[] {
  return [new Bee(), new Lion()]
}

