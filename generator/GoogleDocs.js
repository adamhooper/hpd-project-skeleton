'use strict'

const fs = require('fs')
const yaml = require('js-yaml')
const PageMetadata = require('./PageMetadata')
const escape_html = require('./escape_html')

const MetadataRegex = /^([-_\.a-zA-Z0-9]+):(.*)$/
const AuthorRegex = /^author:/i
const EndnoteRegex = /^endnote:/i

/**
 * A document, loaded from config.basePath, that we can render.
 *
 * There are two phases to rendering:
 *
 * 1. During construction, read the AST in `basePath/slug.json` and
 *    "pre-render" it. Pre-rendering parses out the metadata and reduces the AST
 *    to a sequence of HTML strings (all non-underlined stuff in the AST) and
 *    HTML-producing functions (all underlined method calls in the AST).
 * 2. During render(), we use the passed `env` to call HTML-producing expressions,
 *    and then we join all the HTML strings together. This is very fast, which is
 *    handy if we're rendering the same Google Doc hundreds or thousands of times.
 */
class GoogleDoc {
  constructor(config, slug) {
    this.config = config
    this.slug = slug
    this._load()
  }

  _load() {
    const input_path = `${this.config.basePath}/${this.slug}.json`
    const json = fs.readFileSync(input_path)
    const ast = JSON.parse(json)

    var result = this._prerender_and_trap_metadata(ast)
    this.metadata = new PageMetadata(this.slug, result.metadata)
    this.output_pieces = result.output_pieces
    this.endnotes_html = result.endnotes_html
  }

  render(env) {
    return this.output_pieces.map((piece) => (
      (typeof piece === 'string') ? piece : piece(env)
    )).join('')
  }

  _prerender_and_trap_metadata(ast) {
    const output_pieces = []
    const this_output_piece_pieces = []
    const metadata = {}
    let endnotes_html = ''
    const _this = this

    function add_html(html) {
      this_output_piece_pieces.push(html)
    }

    function flush_this_output_piece() {
      if (this_output_piece_pieces.length !== 0) {
        output_pieces.push(this_output_piece_pieces.join(''))
        this_output_piece_pieces.splice(0)
      }
    }

    function add_code(code) {
      flush_this_output_piece()
      output_pieces.push((env) => _this._render_code(code, env))
    }

    function add_code_or_metadata(code_or_metadata) {
      const m = MetadataRegex.exec(code_or_metadata)
      if (m !== null) {
        var key = m[1].toLowerCase().replace(/-/g, '_')
        var value = m[2].trim()
        metadata[key] = value
      } else {
        add_code(code_or_metadata)
      }
    }

    function prerender_text(text) {
      if (text.underline) {
        return add_code(text.text)
      }

      const html = escape_html(text.text)

      if (text.bold) {
        add_html(`<strong>${html}</strong>`)
      } else if (text.italic) {
        add_html(`<em>${html}</em>`)
      } else if (text.href) {
        const href = escape_html(text.href)
        add_html(`<a href="${href}">${html}</a>`)
      } else {
        add_html(html)
      }
    }

    /**
     * Turns "Author: by [Somebody]" into "by <a href="somebody">Somebody</a>".
     *
     * This is like prerender_text(), but it only handles hyperlinks.
     */
    function parse_html_metadata(texts, a_attributes_string) {
      const html_parts = []

      texts.forEach((text, i) => {
        const html = escape_html(text.text)
        if (i === 0) {
          html_parts.push(html.slice(html.indexOf(':') + 1))
        } else {
          if (text.href) {
            const href = escape_html(text.href)
            html_parts.push(`<a ${a_attributes_string || ''} href="${href}">${html}</a>`)
          } else {
            html_parts.push(html)
          }
        }
      })

      return html_parts.join('').trim()
    }

    function add_endnote(texts) {
      endnotes_html += `<p>${parse_html_metadata(texts)}</p>`
    }

    function add_author_metadata(texts) {
      const html = parse_html_metadata(texts, 'rel="author"')

      if (metadata.author_html) {
        metadata.author_html += `<br>${html}`
      } else {
        metadata.author_html = html
      }
    }

    function prerender_li(text) {
      add_html('<li>')
      prerender_text(text)
      add_html('</li>')
    }

    ast.forEach((block) => {
      switch (block.type) {
      case 'p':
        if (block.texts[0].underline && AuthorRegex.test(block.texts[0].text)) {
          add_author_metadata(block.texts)
          break
        } else if (block.texts[0].underline && EndnoteRegex.test(block.texts[0].text)) {
          add_endnote(block.texts)
          break
        } else if (block.texts.length === 1 && block.texts[0].underline) {
          // the paragraph is nothing but code. This is block-level code.
          add_code_or_metadata(block.texts[0].text)
          break
        } else {
          // no `break`: fall through to h1/h2/h3/h4 logic
        }
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
        add_html(`<${block.type}${ block.texts[0].text.charAt(0) === '“' ? ' class="starts-with-quote"' : ''}>`)
        block.texts.forEach(prerender_text)
        add_html(`</${block.type}>`)
        break
      case 'hr':
      case 'page-break':
        add_html('<hr>')
        break
      case 'ol':
      case 'ul':
        add_html(`<${block.type}>`)
        block.texts.forEach(prerender_li)
        add_html(`</${block.type}>`)
        break
      default:
        throw new Error(`Unhandled block type ${block.type}. Maybe add support for this type?`)
      }
    })

    flush_this_output_piece()

    return {
      metadata: metadata,
      output_pieces: output_pieces,
      endnotes_html: endnotes_html
    }
  }

  // Code is a JavaScript expression.
  //
  // Tip: use backticks (``) instead of quotes('') in Google Docs, because backticks
  // won't be converted to smart quotes
  _render_code(marked_up_code, env) {
    // TODO compile code in load(), not here.
    const args = Object.keys(env)
    const f = new Function(...args, `return (${marked_up_code})`)

    Object.defineProperty(f, 'name', {
      value: `<Google Doc '${this.slug}'> ${marked_up_code}`
    })

    return f.call(null, ...args.map(a => env[a]))
  }
}

// Downloads Google Docs documents and writes them as abstract syntax trees to
// the repository.
class GoogleDocs {
  constructor(config) {
    this.config = config
  }

  load(slug) {
    return new GoogleDoc(this.config, slug)
  }

  downloadAll(callback) {
    // We run this on dev, not production, so require() within dev alone so that
    // we don't need to install the module on production.
    const gdcd = require('google-drive-console-download')(null)
    const gdm = require('google-docs-markup')

    const todo = this.config.docs.slice()
    const base_dir = this.config.basePath

    function step() {
      if (todo.length === 0) return callback()

      const doc = todo.shift()
      process.stderr.write(`GET ${doc.slug}…`)
      gdcd.download(doc.googleId, 'text/html', (err, html) => {
        if (err) return callback(err)

        process.stderr.write(` ${html.length} characters…`)

        const ast = gdm.parse_google_docs_html(html)

        // Our docs have comments at the bottom. Skip after the first page break
        const page_break_index = ast.findIndex((b) => b.type == 'page-break')
        const useful_ast = ast.slice(0, page_break_index > 0 ? page_break_index : undefined)

        process.stderr.write(` ${useful_ast.length} paragraphs…`)

        const output_path = `${base_dir}/${doc.slug}.json`
        fs.writeFile(output_path, JSON.stringify(useful_ast, undefined, 2), (err) => {
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
module.exports = new GoogleDocs(read_config('google-docs'))

if (require.main === module) {
  module.exports.downloadAll(err => {
    if (err) throw err
  })
}
