# Our SCSS

Our stylesheets are [Sass](http://sass-lang.com/documentation/file.SASS_REFERENCE.html).

We have a couple of helper functions:

* `asset-url(type, key)`: creates a `url()` value pointing to the specified
  asset. Example: `background-image: asset-url('digest', 'images/header.jpg')`
  will produce `background-image: url(/images/header-0f0f0f0f0f.jpg)`
* `asset-as-url(type, key)`: creates a `url(data:[mime];base64,[data])` value
  containing all the bytes of the specified asset, with the asset's MIME type.
  Example: `background-image: asset-url('digest', 'images/highlight.png')`
  will produce `background-image: url('data:image/png;base64,XXXXXXXXXX...')`

`asset-url()` forces an extra HTTP request. Use it for large assets or assets
on pages that most users will likely never see; that means most users won't load
it.

`asset-as-url()` makes the stylesheet larger, since it includes the file
contents. Use it for assets under a few kilobytes in size, or assets every user
will see.
