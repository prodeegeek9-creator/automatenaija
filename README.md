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
assets/brand/              logo, icons and the link preview image (see its README)
favicon.ico                root favicon, requested directly by browsers and scrapers
site.webmanifest           name, theme colour and icons for installed/home screen
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

## Branding

The mark, the favicons, the app icons and the share image all live in
`assets/brand/`, generated from the SVGs in that folder. `assets/brand/README.md`
lists every file, the brand colours and how to re-export the PNGs.

The nav and footer lockup on every page is the mark plus the wordmark:

```html
<a href="index.html" class="brand">
  <img class="mark" src="assets/brand/logo-mark.svg" alt="" width="30" height="30" decoding="async">
  <span class="brand-name">Automate<span class="brand-name-accent">Naija</span></span>
</a>
```

The green in the mark and in "Naija" belongs to the logo alone. The site's
accent colour is unchanged and still burnt orange: the `--lime` variable in
`assets/site.css`, and in the inline `:root` block at the top of `index.html`,
which index keeps its own copy of.

## Link previews (WhatsApp, X, LinkedIn, Facebook, Slack)

Every page carries its own Open Graph and Twitter card tags, built from that
page's `<title>` and `<meta name="description">`, plus a shared 1200x630 image at
`assets/brand/og-image.png`.

Two things to know before launch:

- **The image URL must be absolute**, so the tags hardcode
  `https://automatenaija.com/assets/brand/og-image.png`. If the site ships on a
  different domain, search and replace `https://automatenaija.com` across the
  HTML files - it appears in `og:url`, `og:image`, `twitter:image` and
  `rel="canonical"`.
- **The canonical and `og:url` values use extensionless paths** (`/about`, not
  `/about.html`), which is how Cloudflare Pages serves them. On a host that
  serves the `.html` URLs instead, add the extension back.

WhatsApp caches a preview per URL for about a week. To force a refresh after
changing the tags, run the link through
[Facebook's sharing debugger](https://developers.facebook.com/tools/debug/) and
hit "Scrape Again" - WhatsApp reads the same cache.

A new page needs the same block copied into its `<head>`, with `og:url`,
`og:title` and `og:description` pointed at that page. Blog posts use
`og:type="article"`; everything else uses `website`.
