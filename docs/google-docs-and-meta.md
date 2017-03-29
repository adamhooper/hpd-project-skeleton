# Inserting a Google Doc and using it for meta information

Journalists should enter text in
[google-docs-markup](https://github.com/huffpostdata/google-docs-markup).

You should begin the Google Docs document with
[special underlined code](https://github.com/huffpostdata/google-docs-markup#use-underline-to-build-a-templating-engine).
It should look like this, all underlined:

    hed: hed TK
    dek: dek TK
    author: author TK
    twitter-author: @authorTK
    date-published: TKweekday, TKmonth TKday, TKyear TKH:TKMM TKAMorPM TKESTorEDT
    ... (optional meta)

## Meta tags

Here are the *required* meta tags. If you omit them, the output HTML will contain
`TK`s:

* **hed**: The &lt;h1&gt; on the page. *Default: `hed TK`*
* **dek**: The &lt;h2&gt; -- which shows up right under the hed. *Default: `dek TK`*
* **author**: The list of authors, plain text, starting with "By". Use links: that will create &lt;a rel="author"...&gt; tags. *Default: `author TK`*
* **header-caption**: The photo caption and/or credit, such as "Somebody does something." *Default: ``*
* **header-credit**: The person who created the header image, such as "Photo Credit: Adam Hooper". *Default: ``*
* **twitter-author**: The @username to tell Twitter is creator. *Default: `@authorTK`*
* **date-published**: The plaintext timestamp to show

Here are the *suggested* additional meta tags, in order of most- to least-important.
They all have sensible defaults:

* **title**: The &lt;title&gt; (which shows up in the browser tab). *Default: hed*
* **header-image**: Big splash image to show in header. Useful to choose between `.jpg` and `.png`. *Default: [slug]-header.jpg*
* **social-image**: Image to use on Twitter/Facebook Cards. Useful to choose between `.jpg` and `.png`. *Default: `[slug]-social.jpg`*
* **social-title**: Headline for Facebook/Twitter Cards. *Default: title*
* **description**: Description of the article to use for Search Engine Optimization (and as default for Facebook/Twitter Cards). *Default: dek*
* **suggested-tweet**: What to put before the URL in tweets. *Default: hed*
* **date-updated**: Date of last update, if applicable. *Default: null*

Then there are some *nitpicky* additional meta tags, in alphabetical order:

* **facebook-description**: Description for Facebook Cards. *Default: description*
* **facebook-image**: Image for Facebook Cards. *Default: social-image*
* **facebook-title**: Headline for Facebook Cards. *Default: social-title*
* **twitter-description**: Description for Twitter Cards. *Default: description*
* **twitter-image**: Image for Twitter Cards. *Default: social-image*
* **twitter-title**: Headline for Twitter Cards. *Default: social-title*

## Wiring it up

Edit `config/google-docs.yml` to insert the proper slug and URL.

Run `npm run-script update-google-docs` to download and cache the doc.
