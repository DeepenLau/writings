const url = require('url')

module.exports = {
  get url() {
    // this 为 request
    return this.req.url
  }
}