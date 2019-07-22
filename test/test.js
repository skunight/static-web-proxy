const Proxy = require('./../index')
const proxy = new Proxy({
  proxy:[
    {
      host: '127.0.0.1',
      port: 3000,
      path: '/api',
      targetPath: '/wechat',
      auth: (req) => {
        req.setHeader('X-Special-Proxy-Header', 'foobar');
      }
    }
  ],
  bind:{
    port:8080
  },
  redirect: {
    '/a/b': {
      target: '/c/d',
      query: {
        'name': 'type'
      }
    }
  }
})
proxy.start()