# Developing

1. Install NodeJS >= 7.0 from https://nodejs.org/en/
2. `npm install`
3. `generator/dev.js`

Then browse to http://localhost:3000

## Auto-refresh page during dev

It's so handy if you have your browser window open beside the code....

1. Install the [Chrome extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
2. Reload the page and click the LiveReload button

Now every time you edit code, Chrome will refresh the page.

# Directory layout and docs for dependencies

This framework goes from zero to website in milliseconds. Each build does this:

1. Generate assets (CSS, JavaScript, images, etc.), in `config/assets.yml`. An
   "asset" is a file that we serve with never-expires cache.
2. Loads and computes all models, in `app/database.js`
3. Generates pages configured in `config/pages.yml`
4. Serves these as a web server.

All of this happens in memory. `generator/build.js` runs these steps and dumps
its [in-memory-website](https://github.com/huffpostdata/in-memory-website) to
standard output. `generator/dev.js` is the web server: it builds and serves the
result. `generator/upload.js` is similar: it builds and uploads the result to S3.

When developing, look to:

* `config/pages.yml`: all endpoints and how to generate them. This uses
  [hpd-page-generator](https://github.com/huffpostdata/hpd-page-generator).
  Templates can use `partial(...)` to render sub-templates and
  `routes.hrefTo(...)` and `routes.urlTo(...)` to refer to pages within this
  project.
* `config/assets.yml`: all our content that never changes, such as images and fonts.
  This uses
  [hpd-asset-pipeline](https://github.com/huffpostdata/hpd-asset-pipeline).
  Templates can use `assets.hrefTo(...)` to generate URLs to assets and
  `assets.dataFor(...)` and `assets.dataUriFor(...)` to generate inline data.
* `app/database.js`: database used when generating endpoints. This is a JavaScript
  object loaded synchronously.
* `app/helpers.js`: the `helpers` variable used when generating endpoints. This is
  a JavaScript object loaded synchronously.

## Using our Google Docs

If you're adding/removing stories, look to `config/google-docs.yml`.

Run `npm run update-google-docs` to download newer data from Google Docs.

You'll have to commit the newly-downloaded JSON to this repository to publish it.

Once you do, use code like this to read a doc in `database.js`:

```javascript
const GoogleDocs = require('../generator/GoogleDocs')
const doc = GoogleDocs.load('my-doc-slug')

// doc.metadata is a PageMetadata; see docs/google-docs-and-meta.md

module.exports = {
  index: doc
}
```

And in your MarkoJS -- in this example, `views/index.marko`:

```markojs
...
<article>
  -- $!{model.render(input)}
</article>
...
```

(In that MarkoJS, `<article>` is HTML; `-- ` means "output this"; `$!{}` means
"string not HTML-escaped"; `model` is `database.js`'s `module.exports.index`;
and `.render(input)` is a magical incantation that may never make sense.)

## Updating our Google Sheets

If you're adding/removing sheets, look to `config/google-sheets.yml`.

Then run `npm run update-google-sheets` to download newer data from Google
Sheets.

You'll have to commit the newly-downloaded TSV to this repository to publish it.

Once you do, use code like this to read a sheet in `database.js`:

```javascript
const GoogleSheets = require('../generator/GoogleSheets')

module.exports = {
  index: {
    ...,
    // items is an Array; each Object within has a value per column header in the TSV
    items: GoogleSheets.slugToArray('items')
  }
}
```

# Deploying

The idea is: developers push to a Git repo clone on a utility machine, and when
it receives the push it runs `npm install && generator/upload.js`.

Since you'll probably end up publishing lots of projects with this framework, put
this script on your utility machine and use it to launch all projects. Set `$ENV`
(the `git remote` name: usually `"staging"` or `"production"`), `$BASE_URL` and
`$S3_BUCKET` once per utility machine. A good path for these projects is
`/opt/$SLUG`, but you may wish to change that.

**launch-project.sh**:
```sh
set -e

if [ $# -ne 1 ]; then
        echo "Usage: $0 SLUG" >&2
        exit 1
fi

SLUG="$1"
ENV="production"

echo "Setting up project: $SLUG" >&2
sudo mkdir -p /opt/$SLUG
sudo chown rails:rails /opt/$SLUG
[ -d /opt/$SLUG/.git ] || (cd /opt/$SLUG && git init && git config receive.denyCurrentBranch updateInstead)

cat <<EOT > /opt/$SLUG/.git/hooks/post-receive
#!/bin/sh

set -e

pushd /opt/$SLUG >/dev/null

npm install --production

BASE_URL="https://example.com" \
S3_BUCKET="s3://example.com" \
DEBUG="*" \
UGLIFY=true \
generator/upload.js
EOT

chmod +x /opt/$SLUG/.git/hooks/post-receive

echo "Installed. On each dev machine, run this setup line:" >&2
echo >&2
echo "git remote add $ENV $USER@$ENV-elections-utility-01.use1.huffpo.net:/opt/$SLUG" >&2
echo >&2
echo "Then run this to deploy:" >&2
echo >&2
echo "git push $ENV master" >&2
```

Make sure all developers log in with the same username, to avoid permission
problems. A good place for these projects is `/opt/$SLUG`.

Now, every time you want to deploy:

1. Log into your staging utility machine and run `./launch-project.sh my-project-slug`.
2. Follow the instructions (`git remote add staging ... && git push staging master`). You'll
   see debug messages as files are uploaded to S3.
3. Make everybody on your team run the `git remote add staging ...` command.
4. Test (including social pictures and metadata).
5. Repeat on `production` instead of `staging`.

## Careful!

You'll need some expertise if you stray off the beaten path. Things are simplest if you
adhere to these guidelines:

* **git push to origin before you git push to staging/master**: a git push needs to be
  "fast-forward", meaning you shouldn't push a commit that overwrites another developer's
  commit. You should push to the `origin` repository before pushing to staging. If you break
  this rule, the simplest fix is to `git push --force` to reset staging/master. (This
  destroys history on the staging server.)
* **git push to staging before production**: first, you should do this for testing. Second,
  you should do it for the same reason you push to origin before staging: to keep your repo
  history simple.

## Common problems

* **my post-receive script failed and I want to re-run it**: log in to the utility machine,
  edit `/opt/$SLUG/.git/hooks/post-receive` if necessary, and then run it.
* **I pushed an error and I need to undo the last deploy**: use `git revert` to create a commit
  that reverses the erroneous commit. Test locally; push to origin; push to staging; push to
  production.
* **I need to delete a page from S3**: the framework won't do that. Log in to the utility
  machine, make sure AWS [CLI tools](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)
  are installed, and run `aws s3 rm s3://BUCKET/ENDPOINT`

# License

This code is copyright (c) 2017 The Huffington Post, released under the MIT license.
See LICENSE.

Exception: [Proxima Nova](https://typekit.com/fonts/proxima-nova) is _not_ a free font.
If you're forking this project and you don't work for The Huffington Post, please either
acquire a license or delete the Proxima Nova files in `assets/stylesheets/`.
