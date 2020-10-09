require('dotenv').config()

const zlib = require('zlib')
const fileSystem = require('fs')
const express = require('express')
const consola = require('consola')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const request = require('request')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const redirectSSL = require('redirect-ssl')
const throng = require('throng')

const API_ADDRESS = process.env.API_ADDRESS || 'http://localhost:6868'
const PROPERTY_ID = process.env.PROPERTY_ID || 'wolfjaw-studios'

const shouldLogResponses = process.env.LOG_RESPONSES || false
const shouldServeLoggedResponses = process.env.SERVE_LOGGED_RESPONSES || false
const workers = process.env.WEB_CONCURRENCY || 1

// eslint-disable-next-line no-unused-vars
const SEO_REDIRECT_URL =
  process.env.SEO_REDIRECT_URL || 'https://get.pokergo.com'
// eslint-disable-next-line no-unused-vars
const TRACKING_VIDEO_EVENTS = process.env.TRACKING_VIDEO_EVENTS || false
// eslint-disable-next-line no-unused-vars
const VIDEO_PROGRESS_POST_DELAY = process.env.VIDEO_PROGRESS_POST_DELAY || 30000

const date = new Date()
const dateString =
  String(date.getFullYear()) +
  String(date.getMonth()) +
  String(date.getDate()) +
  String(date.getHours()) +
  String(date.getMinutes())
const logFile = process.env.LOG_FILE || 'test/data' + dateString + '.json'

let loggedResponses = {}

// Import and Set Nuxt.js options a
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

app.set('etag', false)

// Security deny iframing site
app.use(function(req, res, next) {
  res.setHeader('X-Frame-Options', 'DENY')
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(
  cookieSession({
    name: 'session',
    keys: ['sessionvalue'],
    httpOnly: true,
    secure: true
  })
)

app.use(redirectSSL.create({ exclude: ['localhost'] }))

app.post('/api/login', bodyParser.json(), (req, res) => {
  const ip = getIp(req)
  const newHeaders = {
    Authorization:
      'Basic ' +
      Buffer.from(req.body.username + ':' + req.body.password).toString(
        'base64'
      ),
    'X-Real-Ip': ip,
    'X-Forwarded-For': ip
  }
  // Serve mock responses
  if (shouldServeLoggedResponses) {
    if (loggedResponses[req.url]) {
      if (loggedResponses[req.url].method === req.method) {
        res.json(JSON.parse(loggedResponses[req.url].data))
      } else {
        // wrong method
        res.sendStatus(405)
      }
    } else {
      // no cached data
      res.sendStatus(404)
    }
    return
  }
  const chunks = []

  request({
    url: API_ADDRESS + '/properties/' + PROPERTY_ID + '/sign-in',
    headers: newHeaders,
    method: 'POST'
  })
    .on('response', (resp) => {
      resp.headers['cache-control'] = 'no-cache'
    })
    .on('data', (data) => {
      if (shouldLogResponses) {
        chunks.push(data)
      }
    })
    .on('end', () => {
      if (shouldLogResponses) {
        const buffer = Buffer.concat(chunks)
        zlib.gunzip(buffer, (err, data) => {
          if (!err) {
            loggedResponses[req.url] = {
              method: req.method,
              status: res.statusCode,
              data: data.toString()
            }
            fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
          } else {
            loggedResponses[req.url] = {
              method: req.method,
              status: res.statusCode,
              data: chunks.toString()
            }
            fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
          }
        })
      }
    })
    .pipe(res)
})

app.post('/api/logout', (req, res) => {
  // Should probably do something here
  req.session = null
  res.cookie('session', null)
  res.sendStatus(200)
})

app.get('/api/user', (req, res) => {
  const ip = getIp(req)
  const newHeaders = {
    'X-Real-Ip': ip,
    'X-Forwarded-For': ip
  }
  const chunks = []
  req
    .pipe(
      request({
        url:
          API_ADDRESS +
          '/properties/' +
          PROPERTY_ID +
          '/subscribers/me?include=entitlements',
        headers: newHeaders,
        method: 'GET'
      })
    )
    .on('response', (resp) => {
      resp.headers['cache-control'] = 'no-cache'
    })
    .on('data', (data) => {
      if (shouldLogResponses) {
        chunks.push(data)
      }
    })
    .on('end', () => {
      if (shouldLogResponses) {
        const buffer = Buffer.concat(chunks)
        zlib.gunzip(buffer, (err, data) => {
          if (!err) {
            loggedResponses[req.url] = {
              method: req.method,
              status: res.statusCode,
              data: data.toString()
            }
            fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
          } else {
            loggedResponses[req.url] = {
              method: req.method,
              status: res.statusCode,
              data: chunks.toString()
            }
            fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
          }
        })
      }
    })
    .pipe(res)
})

app.all('/api/*', (req, res) => {
  const ip = getIp(req)
  // Serve mock responses
  if (shouldServeLoggedResponses) {
    if (loggedResponses[req.url]) {
      if (loggedResponses[req.url].method === req.method) {
        consola.info(req.url)
        if (loggedResponses[req.url].data !== '') {
          res.json(JSON.parse(loggedResponses[req.url].data))
        }
      } else {
        // wrong method
        res.sendStatus(405)
      }
    } else {
      // no cached data
      res.sendStatus(404)
    }
    return
  }
  const chunks = []
  const authHeader =
    req.headers.authorization === undefined
      ? 'Bearer ' + process.env.DEVICE_TOKEN
      : req.headers.authorization

  if (
    req.headers['content-type'] === 'application/json' &&
    req.method === 'POST'
  ) {
    req
      .pipe(
        request({
          url: API_ADDRESS + req.url.substr(4),
          headers: {
            'X-Redirect-Host': process.env.SITE_URL,
            'X-Real-Ip': ip,
            'X-Forwarded-For': ip,
            Authorization: authHeader
          }
        }).on('response', (resp) => {
          resp.headers['cache-control'] = 'no-cache, no-store, must-revalidate'
        })
      )
      .on('response', (resp) => {
        resp.headers['cache-control'] = 'no-cache'
      })
      .on('data', (data) => {
        if (shouldLogResponses) {
          chunks.push(data)
        }
      })
      .on('end', () => {
        if (shouldLogResponses) {
          const buffer = Buffer.concat(chunks)
          zlib.gunzip(buffer, (err, data) => {
            if (!err) {
              loggedResponses[req.url] = {
                method: req.method,
                status: res.statusCode,
                data: data.toString()
              }
              fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
            } else {
              loggedResponses[req.url] = {
                method: req.method,
                status: res.statusCode,
                data: chunks.toString()
              }
              fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
            }
          })
        }
      })
      .pipe(res)
  } else {
    req
      .pipe(
        request({
          url: API_ADDRESS + req.url.substr(4),
          headers: {
            'X-Redirect-Host': process.env.SITE_URL,
            Authorization: authHeader,
            'X-Real-Ip': ip,
            'X-Forwarded-For': ip
          }
        }).on('response', (resp) => {
          resp.headers['cache-control'] = 'no-cache, no-store, must-revalidate'
        })
      )
      .on('response', (resp) => {
        resp.headers['cache-control'] = 'no-cache'
      })
      .on('data', (data) => {
        if (shouldLogResponses) {
          chunks.push(data)
        }
      })
      .on('end', () => {
        if (shouldLogResponses) {
          const buffer = Buffer.concat(chunks)
          zlib.gunzip(buffer, (err, data) => {
            if (!err) {
              loggedResponses[req.url] = {
                method: req.method,
                status: res.statusCode,
                data: data.toString()
              }
              fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
            } else {
              loggedResponses[req.url] = {
                method: req.method,
                status: res.statusCode,
                data: chunks.toString()
              }
              fileSystem.writeFileSync(logFile, JSON.stringify(loggedResponses))
            }
          })
        }
      })
      .pipe(res)
  }
})

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  if (shouldServeLoggedResponses) {
    const buff = fileSystem.readFileSync(logFile)
    const lr = buff.toString()
    loggedResponses = JSON.parse(lr)
    consola.info(`Serving cached responses from ${logFile}`)
  }
  if (shouldLogResponses) {
    consola.info(`[Important] Logging request response to ${logFile}`)
  }
  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://localhost:${port}/schedule`,
    badge: true
  })
}

throng(
  {
    workers,
    lifetime: Infinity
  },
  start
)
const getIp = (req) => {
  return (
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  )
}
