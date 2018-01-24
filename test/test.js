const Proxy = require('./../index')
const proxy = new Proxy({
  proxy:{
    host: '127.0.0.1',
    port: 5050,
    path:'/api',
    auth: (req) => {
      req.setHeader('X-Special-Proxy-Header', 'foobar');
    }
  }
})
proxy.start()