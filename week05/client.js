const Request = require('./utils/request') // 请求 类
const parser = require('./utils/parser')
const render = require('./utils/render')
const images = require('images')

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

  let viewport = images(800, 600)

  render(viewport, dom.children[0].children[3].children[1].children[3])

  viewport.save('viewport.jpg')
  console.log('dom:', dom)
  console.log(JSON.stringify(dom, null, '  '))
  console.log('')
}()
