const httpProxy = require('http-proxy')
const _ = require('lodash')
module.exports = (opts) => (req,res,next) => {
  const proxy = new httpProxy.createProxyServer({
    target: {
      host: opts.host,
      port: opts.port,
      path: '/api'
    }
  })
  proxy.on('proxyReq', function (proxyReq, req, res, options) {
    if (opts.auth && _.isFunction(opts.auth)) {
      opts.auth(proxyReq, res)
    }
  })
  proxy.web(req, res)
}