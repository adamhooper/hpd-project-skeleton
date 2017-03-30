# To create a new page

The skeleton project only has a `_root` page, at the base href of the project,
with a template in `views/index.marko`. Here's how you can add another.

1. Say where the new page goes
  a. Open `config/pages.yml`
  b. Add an entry. For instance: `{ path: page-slug }`. This will create the endpoint, `http://localhost:3000/2017/project-slug/page-slug`.
  c. Save `config/pages.yml` and notice the error at http://localhost:3000. It will warn about a missing `.marko` file.
2. Write the `.marko` template, `views/page-slug.marko`.
  a. Copy the bits you like from `index.marko`
  b. Visit http://localhost:3000 and verify that your new page is there
