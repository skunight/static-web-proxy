const express = require('express')
const log4js = require('log4js')
const history = require('connect-history-api-fallback')
const httpproxy = require('./libs/proxy')
const http = require('http')
const https = require('https')
const qs = require('querystring')
class Proxy {
  constructor({
    bind = { host: '0.0.0.0', port: 3000 }, web = { dir: `${__dirname}/public` }, proxy, redirect
  }) {
    this.bind = bind
    this.web = web
    this.proxy = proxy
    this.redirect = redirect
    this.app = express()
  }

  start() {
    log4js.configure({
      appenders: { console: { type: 'console' } },
      categories: { default: { appenders: [ 'console' ], level: 'info' } }
    })
    const logger = log4js.getLogger()
    this.app.use(log4js.connectLogger(logger));
    if(Array.isArray(this.proxy)){
      for(let p of this.proxy) {
        this.app.use(p.path, httpproxy({
          host: p.host,
          port: p.port,
          path: p.path,
          auth: p.auth,
          scheme: p.scheme || 'http',
          targetPath: p.targetPath
        }))
        this._heartBeat(p)
        
      }
    } else {
      this.app.use(this.proxy.path, httpproxy({
        host: this.proxy.host,
        port: this.proxy.port,
        path: this.proxy.path,
        auth: this.proxy.auth,
        scheme: this.proxy.scheme || 'http',
        targetPath: this.proxy.targetPath
      }))
      this._heartBeat(this.proxy)
    }
    this.app.use((req, res, next) => {
      res.set('Cache-Control', 'no-cache')
      next()
    })
    if (this.redirect) {
      for(const r of Reflect.ownKeys(this.redirect)) {
        this.app.get(r, (req, res, next) => {
          const { target, query = {} } = this.redirect[req.route.path] ? this.redirect[req.route.path] : {}
          if (target) {
            for (const key of Reflect.ownKeys(req.query)) {
              if(query[key]) {
                Reflect.defineProperty(req.query, query[key], { 
                  configurable: true,
                  enumerable: true,
                  value: req.query[key],
                  writable: true,
                })
                Reflect.deleteProperty(req.query, key)
              }
            }
            for (const key of Reflect.ownKeys(req.params)) {
              Reflect.defineProperty(req.query, key, {
                configurable: true,
                enumerable: true,
                value: req.params[key],
                writable: true,
              })
            }
            let url = target
            if (Reflect.ownKeys(req.query).length > 0) {
              url = `${target}?${qs.stringify(req.query)}`
            } 
            console.log('redirect', req.path, 'to', url)
            res.redirect(301, url)
          }
          next()
        })
      }
    }
    this.app.use(history())
    this.app.use(express.static(this.web.dir))
    this.app.listen(this.bind.port,this.bind.host)
  }

  _heartBeat(p) {
    if (p.heartBeat > 0) {
      setInterval(() => {
        const url = `${p.scheme || 'http'}://${p.host}:${p.port}${p.targetPath || '/'}`
        const req = (p.scheme === 'https' ? https : http).request(url, {}, (res) => {
          if(res.statusCode !== 400) {
            console.error(`Proxy "${url}" HeartBeat Error！StatusCode: ${res.statusCode}`)
          }
        })
        req.end()
      }, p.heartBeat)
    }
  }
}
module.exports = Proxy