# How To Use A Font

We include fonts in our stylesheets as [WOFF](https://www.w3.org/TR/WOFF/). It's
2017, so all browsers support WOFF; few browsers support WOFF2 (which would be
better, because it's smaller).

Each font increases page load time. Exercise restraint.

For each font family+weight+style:

1. Find the family+weight+style `.ttf` or `.otf` file.
1. Turn it into a CSS file that looks like this:
   ```css
   @font-face {
     font-family: My Font;
     font-weight: normal;
     font-family: normal;
     src: url("data:application/font-woff;base64,...") format("woff");
   }
   ```
   One visual way is with FontSquirrel:
    1. Browse to https://www.fontsquirrel.com/tools/webfont-generator
    1. Upload your `.ttf` or `.otf` file
    1. Choose "Expert" conversion
    1. Set "Font Format" to nothing but "WOFF".
    1. Disable all FontSquirrel features: most importantly, "No Subsetting", "No Vertical Metrics Adjustment"
    1. Agree to generate a zipfile
    1. Load the `.css` file from the zipfile
    1. Edit the `font-family`, `font-weight` and `font-style`
    1. Save as `assets/stylesheets/_font-family-weight-style.scss`
1. Include the font stylesheet in `assets/stylesheets/index.scss`
1. To use the font everywhere, set the `$body-font-family` in `assets/stylesheets/_variables.scss`

## Don't Do Things The Easy Way

Do use [Google Fonts](https://fonts.google.com/) to _find_ fonts, but don't use
Google's instructions to _publish_ them. Google's instructions rely on Google's
servers, which are bad for coding-on-an-airplane and
avoiding-errors-when-Google-is-down. Also, Google's instructions cause extra
HTTP requests on page load, and the user has to wait for all the responses before
the page renders correctly.
