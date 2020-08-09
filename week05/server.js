const http = require('http')
http.createServer((req, res) => {
  let body = []
  req.on('error', err => {
    console.log('err:', err)
  }).on('data', chunk => {
    body.push(chunk)
  }).on('end', () => {
    console.log('body type:', typeof body)
    body = Buffer.concat(body).toString()
    console.log('body:', body)
    res.writeHead(200, { 'Cotent-Type': 'text/html' })
    // res.end(' Hello World\n')
    res.end(
`<html maaa=a>
<head>
  <style>
#container {
  width: 500px;
  height: 300px;
  display: flex;
  background-color:rgb(255,255,255);
}
#container #myid {
  width: 200px;
  height: 100px;
  background-color:rgb(255,0,0)
}
#container #c1 {
  flex: 1;
  background-color:rgb(0,255,0);
}
body div #myid {
  width:100px;
  background-color:#ff5000;
}
body div img {
  width: 30px;
  background-color:#ff1111;
}
  </style>
</head>
<body>
  <div id="container">
    <div id="myid" />
    <div id="c1" />
  </div>
</body>
</html>`)
  })
}).listen(8088)

console.log('Server start at: http://127.0.0.1:8088')
