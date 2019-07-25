let list = document.getElementById('list')

let xhr = new XMLHttpRequest()

xhr.open('get', '/api/images', true)
xhr.responseType = 'json'
xhr.onload = () => {
  let arr = xhr.response
  let str = ''
  arr.forEach(item => {
    str += `<li><img src="${item}"></li>`
  })

  list.innerHTML = str
}

xhr.send()