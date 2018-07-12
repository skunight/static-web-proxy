const express = require('express')
const log4js = require('log4js')
const history = require('connect-history-api-fallback')
const httpproxy = require('./libs/proxy')
class Proxy {
  constructor({
    bind = { host: '0.0.0.0', port: 3000 }, web = { dir: `${__dirname}/public`},proxy
  }) {
    this.bind = bind
    this.web = web
    this.proxy = proxy
    this.app = express()
  }

  start() {
    log4js.configure({
      appenders: { console: { type: 'console' } },
      categories: { default: { appenders: [ 'console' ], level: 'info' } }
    })
    const logger = log4js.getLogger()
    this.app.use(log4js.connectLogger(logger));
    this.app.use(this.proxy.path ,httpproxy({
      host: this.proxy.host,
      port: this.proxy.port,
      path: this.proxy.path,
      auth: this.proxy.auth
    }))
    this.app.use(function (req, res, next) {
      res.set('Cache-Control', 'no-cache')
      next()
    })
    this.app.use(history())
    this.app.use(express.static(this.web.dir))
    this.app.listen(this.bind.port,this.bind.host)
  }
}
module.exports = Proxy