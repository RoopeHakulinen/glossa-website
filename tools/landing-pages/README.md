# Course and exam landing pages

`build.mjs` turns each `pages/<locale>/<kind>/<slug>.json` into `<locale>/<kind>/<slug>.html` (English at the site root), writes `sitemap.xml`, and adds to every page a list of the other pages of its kind in its language. Run it after editing any JSON and commit the generated HTML with it:

```bash
node tools/landing-pages/build.mjs
```

`kind` is `exams` (one page per exam or exam family, such as `yki` or `dele`) or `courses` (one page per target language, such as `georgian`). The same slug in several locales makes one page in several languages: the language menu and `hreflang` links list only the languages the page exists in. Unlike the home page, these pages exist only in the languages of the learners they are written for, so a page for YKI exists in English, Finnish and Russian, not in all nine. `index.json` in a kind folder is the list page for that kind.

These pages are indexed by search engines, unlike `vs-duolingo.html`. Their claims follow the app's content in the glossa repository (`content/<course>/course.yaml`, `content/<course>/exams/<exam>/exam.yaml`) and its terms (what is free and what is Premium), so a change there that makes a page untrue updates the page.

## Page JSON

```jsonc
{
  "title": "…",            // <title>: what the page is about first, then "· Glossa"
  "description": "…",      // meta description, about 150–160 characters
  "card": { "title": "…", "text": "…" },  // how other pages and the index link to this one
  "eyebrow": "…",
  "heading": "…",          // the h1; may hold one <em>
  "lead": "…",
  "fineprint": "…",        // what is free and what is Premium, in one or two sentences
  "panel": {               // optional box beside the heading
    "label": "…",
    "lang": "fi",          // language of title/text/question/options
    "title": "…", "text": "…", "question": "…", "options": ["…"],  // a sample exam question, or
    "items": [{ "title": "…", "text": "…" }],                          // a ladder of course tiers
    "note": "…"
  },
  "sections": [            // alternate sunken and plain backgrounds
    { "type": "table", "eyebrow": "…", "heading": "…", "intro": "…", "columns": ["Row label", "Column", "Glossa's column"], "rows": [["…", "…", "…"]], "note": "…" },
    { "type": "reasons", "heading": "…", "items": [{ "title": "…", "text": "…" }] },
    { "type": "list", "heading": "…", "intro": "…", "items": ["…"] },
    { "type": "checklist", "heading": "…", "items": ["…"] },
    { "type": "faq", "heading": "…", "items": [{ "question": "…", "answer": "…" }] }
  ],
  "closing": { "heading": "…", "text": "…" },
  "trademark": "…"         // who runs the exam, and that Glossa is not affiliated with it
}
```

Strings are HTML. Target-language words are wrapped in `<span lang="…">`. `intro` may be a string or a list of paragraphs. A table with two columns of cells highlights the last one as Glossa's.
