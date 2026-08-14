# Tabletop Teachings — website

A plain static site: HTML, CSS and a little vanilla JavaScript. No build step,
no framework, no `npm install`. Any browser (and Netlify) serves these files
exactly as they are.

---

## ⚠️ Before you publish — fill in the blanks

Every value I couldn't know is marked `[[LIKE_THIS]]`. **Find them all with:**

```sh
grep -rn '\[\[' --include=*.html --include=*.js --include=*.xml --include=*.txt .
```

| Placeholder | What it is | Where |
|---|---|---|
| `[[SITE_URL]]` | Your domain, no `https://` and no trailing slash (e.g. `tabletopteachings.com.au`) | both HTML pages, `sitemap.xml`, `robots.txt` |
| `[[SUBURB]]` | The suburb or city you run in | `index.html` |
| `[[EMAIL]]` / `[[PHONE]]` / `[[PHONE_RAW]]` | Contact details. `PHONE_RAW` is the dial-able version, e.g. `+61412345678` | `index.html` |
| `[[XX]]` ×3 | Your prices | `index.html` pricing |
| `[[N]]` | Number of sessions per term; also spots open per campaign | `index.html`, `js/adventures-data.js` |
| `[[SESSION_LENGTH]]` | e.g. `2 hours` | `index.html` |
| `[[SCHEDULE]]` / `[[VENUE]]` | e.g. `Saturday mornings` / the venue name | FAQ |
| `[[RESPONSE_TIME]]` | e.g. `one business day` | hero |
| `[[NOTICE_PERIOD]]` | e.g. `two weeks` | pricing |
| `[[WWCC_NUMBER]]` | Your Working With Children Check number | safety, footer |
| `[[COVER]]` | Public liability cover amount, e.g. `20 million` | safety |
| `[[ABN]]` | Your ABN | footer |
| `[[YEARS]]` | How long you've been running tables | "What's included" |

**`[[SITE_URL]]` matters most.** It appears in canonical tags, Open Graph tags
and the sitemap. Left unreplaced, search engines and social platforms get
broken URLs — worse than having no tags at all.

**If a claim isn't true, delete the line rather than softening it.** The safety
section is only worth having because every item in it is verifiable.

### Then, in order of value

1. **Install an analytics tag.** There's a commented block in the `<head>` of
   `index.html` — paste your GA4 / Google Ads / Meta tag there and into
   `adventures/index.html`. `js/track.js` does the rest. Without this you're
   buying traffic you can't measure.
2. **Add two or three real parent quotes.** The testimonials section is built
   and commented out in `index.html`; delete the comment markers and fill it
   in. Get written permission, use first name + year level only, never a
   child's full name.
3. **Add one photo of you and one of a table mid-session.** The site has no
   images of real people. For a stranger running activities with kids, this is
   the biggest remaining trust gap.
4. **Decide your offer.** Every CTA currently says "Ask About a Spot". A free
   15-minute intro call converts better if you're willing to run them — change
   the button text in both HTML files and keep it identical everywhere.
5. **Pick one host.** This repo is configured for Netlify (`netlify.toml`). If
   you're also running the GitHub Pages workflow, turn one of them off so
   there's a single canonical domain.

---

## Previewing it

`_preview.html` is a self-contained clickable preview: both pages inlined into
one file, with the `[[PLACEHOLDERS]]` filled in with **invented** example
values so the layout reads properly. Open it in any browser — no server needed.
Toggle between the two pages and between desktop and phone width using the bar
at the top.

**It is not part of the site — don't upload `_preview.html` to your host**, and
don't treat the example prices, suburb, phone number, ABN or WWCC number shown
in it as real.

---

## File map

```
index.html               → homepage / main landing page
adventures/index.html    → "Live Adventures" page (shell only — content is
                            rendered by JS from adventures-data.js)
404.html                 → shown for any missing page
css/style.css            → all styling (colours, fonts, layout)
js/adventures-data.js    → the campaign content — edit THIS to update the
                            Adventures page AND the homepage teaser
js/adventures.js         → renders campaigns onto the Adventures page,
                            handles campaign/tab switching
js/home-quests.js        → renders the first 3 campaigns into the homepage
                            teaser grid
js/track.js              → fires conversion events on CTA clicks
assets/og-image.png      → the 1200×630 image shown when the site is shared
favicon.ico, robots.txt, sitemap.xml
netlify.toml             → hosting config (caching, security headers)
```

---

## Making everyday content edits

**Homepage text** — edit `index.html` directly. Each section is a plain HTML
block; change the words between the tags.

**Campaigns** — don't touch `adventures/index.html`. Edit
`js/adventures-data.js`. It's a list of campaigns with a comment block at the
top explaining every field. Copy a campaign to add one, delete a block to
remove one.

Two fields drive the sales behaviour:

- `"status": "recruiting"` → the card shows a spots badge and an "Ask About a
  Spot" button, and the Learning tab shows the goals the quest is built around
  instead of a 0% progress bar.
- `"status": "playing"` → the card shows a progress bar and the latest world
  log entry, and the button becomes "Join the Waitlist".

`"spots"` is the text in the badge. **Keep it honest** — "3 spots open" only
works while it's true, and a parent who turns up to a full table won't come
back.

**Never put a real child's name in `player`.** Use `Player A` style labels, or
leave it as `""` for NPCs. The site states publicly that you don't publish
players' names; that promise has to hold.

**Colours / fonts** — all at the top of `css/style.css` under `:root`. Six
"quest" tones (`--quest-1` … `--quest-6`) are reused across cards, tags and
badges.

---

## Running it locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. A server is required — opening the HTML
files directly breaks the Adventures page and the root-relative paths.

---

## Notes on tracking the enquiry form

The enquiry form is hosted on Google Forms, on a domain you don't control, so
the furthest point measurable from this site is the **click** on the button.
`js/track.js` sends `generate_lead` (GA4/Google Ads) and `Lead` (Meta) at that
moment.

To count actual **submissions** instead, either:

- embed the Google Form in an `<iframe>` on a page of your own and track the
  confirmation, or
- switch to a form that redirects to a `/thanks` page on this site, and fire
  the conversion there.

The second is more reliable and gives you a cleaner conversion signal to
optimise ad bidding against.

---

## Accessibility and performance notes

- Critical above-the-fold CSS is inlined in both pages so they paint without
  waiting on a network request. If you change the nav or hero styling in
  `css/style.css`, update the inline `<style>` block too or you'll see a flash
  of unstyled content.
- `.sr-only` in `css/style.css` is load-bearing. Deleting it makes screen
  reader text ("Not yet completed:") render visibly on the objectives list.
- The Adventures campaign picker becomes a sticky sidebar at ≥1024px so
  switching campaigns doesn't lose your scroll position.
- Same-page nav links are hidden below 640px (the nav wrapped into three
  ragged lines otherwise). The sticky bottom CTA covers booking on mobile.
