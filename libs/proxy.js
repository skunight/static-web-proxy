const httpProxy = require('http-proxy-middleware');
const _ = require('lodash')
const Sentry = require('@sentry/node')

module.exports = (opts) => {
  const options = {
    target: `${opts.scheme}://${opts.host}:${opts.port}${opts.targetPath || '/'}`,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      [opts.path] : '/'
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (opts.auth && _.isFunction(opts.auth)) {
          opts.auth(proxyReq, res)
        }
      },
      error: (err, req, res) => {
        Sentry.captureException(err)
        console.error(err)
        res.end()
      },
    }
  }
  return httpProxy(options)
}