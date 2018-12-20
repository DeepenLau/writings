const proto = {}

// function defineGetter(prop, name){
//     proto.__defineGetter__(name, function(){
//         return this[prop][name]
//     })
// }
// defineGetter('request', 'url')
// defineGetter('request', 'path')

function getter(prop, name) {
  Object.defineProperty(proto, name, {
    get: function() {
      return this[prop][name]
    }
  })
}
function access(prop, name) {
  Object.defineProperty(proto, name, {
    get: function() {
      return this[prop][name]
    },
    set: function(val) {
      this[prop][name] = val
    }
  })
}

getter('request', 'url')
access('response', 'body')

module.exports = proto
