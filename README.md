# automatenaija

The Automate Naija marketing site. Plain static HTML, no build step: open the
files or drop the folder on any static host (Cloudflare Pages).

```
index.html                 home page (keeps its own inline CSS)
about.html                 about us
careers.html               careers + open application
partners.html              partner with us
contact.html               contact
privacy.html  terms.html   legal
blog/index.html            blog index
blog/*.html                posts
assets/site.css            shared shell styles for every page except index.html
assets/site.js             shared links config + theme toggle, mobile menu, reveal
```

## Editing links

Every link to the app, the WhatsApp community, the inbox and the social accounts
comes from the `SITE` object at the top of `assets/site.js`. Change it there once
and every page follows.

```js
var SITE = {
  app:      "https://app.automatenaija.com/login",
  whatsapp: "https://chat.whatsapp.com/",   // paste the real invite link
  email:    "hello@automatenaija.com",
  socials:  { twitter:"", linkedin:"", youtube:"", instagram:"" }
};
```

A social handle left empty is dropped from the footer instead of rendering a
dead link, so fill in only the accounts that actually exist. Until
`SITE.whatsapp` has an invite code, the "Join on WhatsApp" buttons point at the
contact page rather than at a broken invite.

## Adding a blog post

Copy an existing file in `blog/`, change the content, then add a card for it at
the top of the list in `blog/index.html`.
