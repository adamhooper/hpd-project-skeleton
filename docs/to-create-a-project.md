# To Create A Project And Deploy It

These instructions are a bit generic: your team will want to adapt them.

1. Fork the skeleton project
    1. Create a new repo on GitHub. Don't add a README or LICENSE.
    1. `git clone https://github.com/huffpostdata/hpd-project-skeleton`.
    1. Rename `hpd-project-skeleton` to the name of your GitHub repo. (We'll call it `my-repo` in this guide.)
    1. Edit `my-repo/.git/config`: change the origin from `https://github.com/huffpostdata/hpd-project-skeleton` to your new GitHub repo's clone URL.
    1. `cd my-repo && git push`.
    1. Browse to your project on GitHub and make sure it's full of files.
1. Edit configuration files you may forget later:
    1. `package.json`: change `name` to `my-repo`
    1. `config/site.yml`: change `baseHref`. (We'll call it `/2017/my-site` in this guide.)
    1. `assets/javascripts/stats.js`: edit things completely
    1. `git commit -am 'Initial config' && git push`
1. Set up your development environment
    1. `npm install`
    1. `generator/dev.js` -- leave that running in the background
    1. Browse to http://localhost:3000. You should see a directory listing.
    1. If you use the [LiveReload](http://livereload.com/extensions/) browser extension, turn it on.
1. Deploy to staging. See `README.md` for an example deployment script that hinges on the command, `git push staging master`.
1. (eventually) Deploy to production with the exact same method. (`README.md` suggests a way to use `git push production master`.)
