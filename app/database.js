'use strict'

// Example that uses a Google Doc and Google Sheet:
//
//const GoogleDocs = require('../generator/GoogleDocs')
//const GoogleSheets = require('../generator/GoogleSheets')
//
//module.exports = {
//  index: Object.assign(GoogleDocs.load('index'), {
//    items: GoogleSheets.slugToArray('items')
//  })
//}

// By default, we don't need a database at all. But you'll probably want one
// with at least a PageMetadata. (If you're using Google Docs, then you don't
// need to require and use PageMetadata explicitly.)
const PageMetadata = require('../generator/PageMetadata')
module.exports = {
  index: {
    metadata: new PageMetadata('index', {
      url_route: '_root',
      hed: 'TK Someone Did Something',
      dek: 'TK He or she did it for a reason'
      // Read docs/google-docs-and-meta.md for more.
    })
  }
}
