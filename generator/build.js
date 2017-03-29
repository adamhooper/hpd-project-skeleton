#!/usr/bin/env node
'use strict'

// Outputs a website merging assets and pages to stdout.

const Site = require('./Site')
const StaticWebsite = require('in-memory-website').StaticWebsite
const validate = require('in-memory-website').validate

Site.loadStaticWebsitesAsync((err, output) => {
  if (err) throw err

  const website = StaticWebsite.merge(output.assets, output.pages)
  const validationError = validate.headersAreUseful(website)
  if (validationError) throw validationError

  process.stdout.write(website.toBuffer())
  process.exitCode = 0
})
