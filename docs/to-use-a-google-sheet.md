# To Use A Google Sheet

Through the `helpers` and `model` variables, Marko can generate database-driven
documents.

[Google Sheets](https://sheets.google.com) is an easy-to-use database platform.
Just make a folder per project, and put each sheet in that folder. Repeat these
instructions for each sheet.

1. Create a Google Sheet
    1. Create a new sheet: our program will only download the first (leftmost) sheet of a spreadsheet
    1. Fill the sheet with tabular data: first row column headers, subsequent rows values
        * Our Google Sheets code will read all values as text
        * `YYYY-MM-DD` is easiest for JavaScript to parse. Set it on date cells using the "Format" menu in Google Sheets
    1. Share the sheet with your team
1. Download it into your project as a TSV file
    1. Edit `config/google-sheets.yml`
    1. Add an entry in the `sheets` value:
        ```yaml
        sheets:
          - slug: my-sheet
            googleId: 123adsf1234...
        ```
        The `googleId` is the long, hex-encoded part of the Google Sheets URL.
    1. `npm run update-google-sheets` and follow instructions to download to `data/google-sheets/my-sheet.tsv`.
1. Add it to your model in the database.
    1. edit `app/database.js`
        1. Make sure `const GoogleSheets = require('../generator/GoogleSheets')` is near the top of the file. That lets you use the `GoogleSheets` variable.
        2. Add something _like_ `module.exports.index.items = GoogleSheets.slugToArray('my-sheet')`
            * `index` here is the model you're editing (see `page.yml`)
            * `items` here is the name of the variable that will hold the data from Google Sheets
            * The `items` will be an `Array` of JavaScript `Object`s. Object properties will be named after column headers.
1. Edit your `views/index.marko` and add code that refers to the database. It might look something like this:
    ```marko
    ul
      for(item in model.items)
        li data-item-id=item.id -- ${item.text}
    ```
