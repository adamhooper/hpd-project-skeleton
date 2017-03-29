'use strict'

const AssetPipeline = require('hpd-asset-pipeline')
const PageGenerator = require('hpd-page-generator')
const read_config = require('./read_config')

const BaseUrl = process.env.BASE_URL || 'http://localhost:3000'
if (!/^https?:/.test(BaseUrl)) {
  throw new Error(`You set BASE_URL to '${BaseUrl}', but Facebook and Twitter need a URL schema like "http://" or "https://". Change the start of BASE_URL.`)
}

const Config = {
  site: read_config('site'),
  assets: read_config('assets'),
  pages: read_config('pages')
}

if (!Config.site.baseHref) throw new Error(`site.yml must include baseHref`)

function loadAssetBucketAsync(callback) {
  AssetPipeline.render({
    host: BaseUrl,
    baseHref: Config.site.baseHref,
    basePath: `${__dirname}/../assets`,
    assets: Config.assets,
  }, callback)
}

function loadPagesStaticWebsiteSync(assets) {
  return PageGenerator.generate({
    baseUrl: BaseUrl,
    baseHref: Config.site.baseHref,
    basePath: `${__dirname}/../views`,
    database: require('../app/database'),
    pages: Config.pages,
    globals: {
      assets: assets,
      helpers: require('../app/helpers')
    }
  })
}

function loadStaticWebsitesAsync(callback) {
  loadAssetBucketAsync((err, assets) => {
    if (err) return callback(err)

    const pagesWebsite = loadPagesStaticWebsiteSync(assets)

    return callback(null, {
      assets: assets.toWebsite(),
      pages: pagesWebsite
    })
  })
}

module.exports = {
  config: Config,
  loadAssetBucketAsync: loadAssetBucketAsync,
  loadPagesStaticWebsiteSync: loadPagesStaticWebsiteSync,
  loadStaticWebsitesAsync: loadStaticWebsitesAsync
}
