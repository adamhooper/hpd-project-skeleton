# To create a new page

The skeleton project only has a `_root` page, at the base href of the project,
with a template in `views/index.marko`. Here's how you can add another.

1. Say where the new page goes
    1. Open `config/pages.yml`
    1. Add an entry. For instance:
        ```yaml
        - page: page-slug
        ```
        This will create the endpoint, `http://localhost:3000/2017/project-slug/page-slug`.
    1. Save `config/pages.yml` and notice the error at http://localhost:3000. It will warn about a missing `.marko` file.
1. Write the `.marko` template, `views/page-slug.marko`.
    1. Copy the bits you like from `index.marko`
    1. Visit http://localhost:3000 and verify that your new page is there

# To fill a page with Google Docs metadata and content

(We’re still working off the previous example)

1. Create a Google Doc.
    1. Create the Google Doc at https://docs.google.com
    1. Share it with your team
    1. Write the document, with underlined metadata and with non-underlined text.
        * See this project's `docs/google-docs-and-meta.md` for our templating engine.
        * See https://github.com/huffpostdata/google-docs-markup for inner workings and a pointer to a sample file.
        * Underlined text at the top of the file is metadata (valid keys are in google-docs-and-meta.md)
        * Underlined text in the rest of the document is JavaScript (it can access `assets`, `helpers`, `href`, `model` and `routes`)
1. Download, parse and commit the Google Doc file as JSON
    1. edit `config/google-docs.yml`
    1. Add an entry. For instance:
        ```yaml
        - slug: my-doc
          googleId: abcdabcda1234...
        ```
        (where `googleId` is the long, random ID in the document URL at https://docs.google.com)
    1. `npm run update-google-docs` and follow instructions. That script will parse the Google Doc into JSON and store it at `data/google-docs/my-doc.json`.
1. Set the Google Doc to be your model
    1. edit `config/pages.yml` and set `model: my-model` on the page in question.
    2. edit `app/database.js`
        * Add `const GoogleDocs = require('../generator/GoogleDocs')` near the top of the file. That will make `GoogleDocs` a variable you can use.
        * Add `module.exports['my-model'] = GoogleDocs.load('something-happened')` near the bottom of the file. That will set the variable that becomes the `model` variable in `views/page-slug.marko`.
1. Use the Google Docs HTML in your marko file
    * Add this to `views/page-slug.marko`:
        ```marko
        -- $!{model.render(input)}
        ```
        (No, it doesn't make much sense.)
1. Use the Google Docs metadata in your marko file
    * To use the title in your `<head>`:
        ```marko
        html
          head
            title -- ${model.metadata.title}
        ...
        ```
    * To use social-media metadata in your `<head>`:
        ```marko
        html
          head
            -- $!{partial('_social-meta')}
        ```
    * To use the hed and dek as `<h1>` and `<h2>`:
        ```marko
        html
          body
            h1 -- ${model.metadata.hed}
            h2 -- ${model.metadata.dek}
        ```
        (On multi-page projects that share a header, we put those `<h1>` and `<h2>` in `views/_header.marko` and render it as a partial. We do the same with `date_published` and others.)
