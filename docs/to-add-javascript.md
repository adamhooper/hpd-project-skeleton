# To Add JavaScript

This project uses [hpd-asset-pipeline](https://github.com/huffpostdata/hpd-asset-pipeline)
for its simple, fast JavaScript compilation with automated source maps.

1. Edit `config/assets.yml` and add an entry like this:
    ```yaml
    - logic: javascript
      glob: javascripts/app.js
    ```
    If you browse to http://localhost:3000, you should _not_ see the file (because there's
    nothing on the filesystem for `glob` to match).
2. Create a JavaScript file in `assets/javascripts/app.js`. If you refresh http://localhost:3000,
   you should see a new `app-XXXXXX.js`.
3. Refer to the JavaScript from your `views/index.marko` (or other template):
   ```marko
   script src=assets.hrefTo('javascripts/app.js')
   ```
   Usually, this should go near the bottom of the page.
4. Browse to your page at http://localhost:3000 and verify the JavaScript has loaded.

See [hpd-asset-pipeline](https://github.com/huffpostdata/hpd-asset-pipeline) for the
full set of rules about what `logic: javascript` means. In short:

* You can `require()` relative paths, and they'll be bundled the way you'd expect.
    * This is _not_ Browserify. There's no, say, `require('crypto')`.
* JavaScript will be minified unless you set the environment variable `UGLIFY=false`.
* There's no transpiler: whatever you write should be compatible with the browsers you support. For instance, in 2017:
    * use `var` instead of
      [const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
      and [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let).
    * don't use [for ... of ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of).
    * don't add `,` after the last element in an Array.
