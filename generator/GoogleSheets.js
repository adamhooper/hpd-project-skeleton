'use strict'

const fs = require('fs')
const yaml = require('js-yaml')
const csv_parse = require('csv-parse/lib/sync')

class GoogleSheets {
  constructor(config) {
    this.config = config
  }

  slugToTsv(slug) {
    const inputPath = `${this.config.basePath}/${slug}.tsv`
    const tsv = fs.readFileSync(inputPath, 'utf-8')
    return tsv
  }

  // Returns an Array of Objects for the given slug.
  //
  // You must have called downloadAll() to get data for this method.
  slugToArray(slug) {
    const tsv = this.slugToTsv(slug)
    const array = csv_parse(tsv, { delimiter: '\t', columns: true, quote: null })
    return array
  }

  // Turns a Google Sheets spreadsheet into a JSON object mapping sheet name to
  // an Array of Object values, one per row.
  downloadAll(callback) {
    const gdcd = require('google-drive-console-download')(null) // only require() in dev: not production

    const todo = this.config.sheets.slice()
    const basePath = this.config.basePath

    function step() {
      if (todo.length === 0) return callback()

      const sheet = todo.shift()
      process.stderr.write(`GET ${sheet.slug}…`)
      gdcd.download(sheet.googleId, 'text/tab-separated-values', (err, tsv) => {
        if (err) return callback(err)

        const bytes = Buffer.from(tsv, 'utf-8')

        process.stderr.write(` ${bytes.length} bytes…`)
        const output_path = `${basePath}/${sheet.slug}.tsv`
        fs.writeFile(output_path, bytes, err => {
          if (err) return callback(err)
          process.stderr.write(` ⇒ ${output_path}\n`)
          process.nextTick(step)
        })
      })
    }

    step()
  }
}

const read_config = require('./read_config')
module.exports = new GoogleSheets(read_config('google-sheets'))

if (require.main === module) {
  module.exports.downloadAll(err => {
    if (err) throw err
  })
}
