const Request = require('./utils/request') // 请求 类
const parser = require('./utils/parser')

// 发起请求
void async function() {
  let request = new Request({
    method: 'POST',
    host: '127.0.0.1',
    port: '8088',
    path: '/',
    headers: {
      ['X-Foo2']: 'customed'
    },
    body: {
      name: 'Edwin'
    }
  })

  const res = await request.send()
  let dom = parser.parseHTML(res.body)
}()
