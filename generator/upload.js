#!/usr/bin/env node
'use strict'

// Generates the assets and pages and uploads them to S3.
//
// We upload all the assets first, and then all the pages. That way, assets
// are there when the pages refer to them.

const S3Uploader = require('in-memory-website').S3Uploader
const Site = require('./Site')

if (!process.env.S3_BUCKET) {
  throw new Error('You must set the S3_BUCKET environment variable to use AWS')
}
const BucketName = process.env.S3_BUCKET

Site.loadStaticWebsitesAsync((err, output) => {
  if (err) throw err

  S3Uploader.uploadWebsiteToBucket(output.assets, BucketName, {}, err => {
    if (err) throw err

    S3Uploader.uploadWebsiteToBucket(output.pages, BucketName, {}, err => {
      if (err) throw err
    })
  })
})
