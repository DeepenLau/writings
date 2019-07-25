// let fs = require('fs')
// let json = []
// for (let i = 0; i < 80; i++) {
//   json.push(`https://www.fullstackjavascript.cn/conan/${i}.jpeg`)
// }

// fs.writeFileSync('data.json', JSON.stringify(json))

let express = require('express')
let json = require('./data.json')
let app = express()

app.use(express.static(__dirname))
app.get('/api/images', (req, res) => {
  let start = Math.round(Math.random()*(json.length - 20))
  res.json(json.slice(start, start+10))
})

app.listen(5000)