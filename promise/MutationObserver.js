var observer = new MutationObserver((mutations, observer) => {
  console.log(111)
  mutations.forEach(function(mutation) {
    console.log(mutation)
  })
})

var dom = document.createElement('div')

var options = {
  'attributes':true
}

observer.observe(dom, options)

setTimeout(() => {
  dom.style.color = 'red'
}, 2000)

