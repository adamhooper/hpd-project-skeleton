#!/usr/bin/env node
'use strict'

const chokidar = require('chokidar')
const DevServer = require('in-memory-website').DevServer

const server = new DevServer(`${__dirname}/build.js`)

chokidar.watch('app assets config data views'.split(' '), {
  ignored: /([\/\\]\.|.*.marko.js$)/
})
  .on('change', () => server.queueBuild())
  .on('add', () => server.queueBuild())
  .on('unlink', () => server.queueBuild())

const Port = process.env.PORT || '3000'

server.listen(+Port, err => {
  if (err) throw err

  console.log(`Listening at http://localhost:${Port}`)
  server.listenForLiveReload()
})
