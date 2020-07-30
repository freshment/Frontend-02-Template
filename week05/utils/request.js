const net = require('net')
const ResponseParser = require('./responseParser') // 响应解析 类

// 请求 类
module.exports = class Request {
  constructor(props) {
    const {
      method = 'GET',
      host,
      port = '80',
      path = '/',
      headers = {},
      body = {}
    } = props

    this.method = method
    this.host = host
    this.port = port
    this.path = path
    this.headers = headers
    this.body = body
    if (!this.headers['Content-Type'])
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (this.headers['Content-Type'] === 'application/json')
      this.bodyText = JSON.stringify(this.body)
    else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded')
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')

    this.headers['Content-Length'] = this.bodyText.length
  }

  // 发送
  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser()
      if (connection) {
        connection.write(this.toString())
      } else {
        // 创建TCP链接
        connection = net.createConnection({
          host: this.host,
          port: this.port
        }, () => {
          connection.write(this.toString())
        })
      }
      connection.on('data', data => {
        console.log('dataToString:', data.toString())
        parser.receive(data.toString())
        if (parser.isFinished) {
          resolve(parser.response)
          connection.end()
        }
      })
      connection.on('error', err => {
        reject(err)
        connection.end()
      })
    })
  }
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
  }
}
