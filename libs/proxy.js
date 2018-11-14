const httpProxy = require('http-proxy-middleware');
const _ = require('lodash')


module.exports = (opts) => {
  const options = {
    target: `http://${opts.host}:${opts.port}${opt.targetPath || '/'}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      [opts.path] : '/' 
    },
    onProxyReq: (proxyReq, req, res, options) => {
      if (opts.auth && _.isFunction(opts.auth)) {
        opts.auth(proxyReq, res)
      } 
      // console.log('proxyReq: ', proxyReq.getHeaders())
    }
  }
  return httpProxy(options)
}

// module.exports = (opts) => (req,res,next) => {
//   const proxy = new httpProxy.createProxyServer({
//     target: {
//       host: opts.host,
//       port: opts.port,
//       path: '/api'
//     },
//   })
//   proxy.on('proxyReq', function (proxyReq, req, res, options) {
//     console.log('options: ', options)
//     proxyReq.path = proxyReq.path.replace(/\/api/,'')
//     console.log('proxyReq: ', proxyReq.path)
//     if (opts.auth && _.isFunction(opts.auth)) {
//       opts.auth(proxyReq, res)
//     }
//   })
//   proxy.web(req, res)
// }