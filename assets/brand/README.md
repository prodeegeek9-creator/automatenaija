# Automate Naija brand assets

Everything here is generated from the two source SVGs. Change those first, then
re-export the PNGs at the sizes listed below.

```
logo-mark.svg          the mark on its own, transparent. Used in the nav and footer
                       of every page (<img class="mark" ...>)
logo-mark-white.svg    one-colour version for solid green or photographic backgrounds
favicon.svg            the mark on the dark rounded tile - browser tabs
icon-square.svg        same tile, full bleed - source for the apple touch icon
icon-maskable.svg      full bleed with the mark inside the 80% safe zone - Android

favicon-16.png         16x16     favicon fallback
favicon-32.png         32x32     favicon fallback
apple-touch-icon.png   180x180   iOS home screen
icon-192.png           192x192   manifest
icon-512.png           512x512   manifest / install prompt
icon-maskable-512.png  512x512   manifest, purpose="maskable"
og-image.png           1200x630  link previews (WhatsApp, X, LinkedIn, Facebook, Slack)
```

`favicon.ico` lives at the site root (16/32/48) because browsers and some link
scrapers request `/favicon.ico` directly.

## Colours

These belong to the mark and the icons only. The site's accent colour - buttons,
links, highlights - stays the burnt orange `--lime` in `assets/site.css`.

```
#57ED96  green light    gradient highlight on the mark
#22C466  green          the brand green
#17C964  green bright   "Naija" in the wordmark, dark theme
#0B8C45  green deep     the connector node ring, and "Naija" on light theme
#046B33  green dark     bottom of the mark's right stroke
#0A0D0B  ink            the icon tile, matching the site background
```

## Re-exporting the PNGs

Any SVG rasteriser works. With `rsvg-convert`:

```sh
rsvg-convert -w 32  -h 32  favicon.svg      -o favicon-32.png
rsvg-convert -w 180 -h 180 icon-square.svg  -o apple-touch-icon.png
rsvg-convert -w 512 -h 512 icon-maskable.svg -o icon-maskable-512.png
```

Keep `og-image.png` under 300 KB - WhatsApp silently drops the thumbnail on
larger files.
