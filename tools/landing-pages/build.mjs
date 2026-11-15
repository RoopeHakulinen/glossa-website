// Builds the course and exam landing pages from the JSON files in pages/<locale>/<kind>/<slug>.json.
// Run with `node tools/landing-pages/build.mjs` from the repository root and commit the generated HTML:
// the site is served as static files, so there is no build step on the host.
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolDirectory = dirname(fileURLToPath(import.meta.url))
const root = join(toolDirectory, '..', '..')
const read = (name) => readFileSync(join(toolDirectory, name), 'utf8')

const css = read('base.css') + read('extra.css')
const symbols = read('symbols.svg').trim()
const wordmark = read('wordmark.svg').trim()
const strings = JSON.parse(read('strings.json'))

const LOCALES = ['en', 'de', 'es', 'fr', 'it', 'pt', 'fi', 'ru', 'uk']
const KINDS = ['exams', 'courses']

const escapeAttribute = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const stripTags = (html) => html.replace(/<[^>]+>/g, '')

const prefix = (locale) => (locale === 'en' ? '' : `${locale}/`)
const pagePath = (locale, kind, slug) => `${prefix(locale)}${kind}/${slug === 'index' ? '' : `${slug}.html`}`
const pageUrl = (locale, kind, slug) => `https://glossa.study/${pagePath(locale, kind, slug)}`

function loadPages() {
  return LOCALES.flatMap((locale) =>
    KINDS.flatMap((kind) => {
      const directory = join(toolDirectory, 'pages', locale, kind)
      if (!existsSync(directory)) {
        return []
      }
      return readdirSync(directory)
        .filter((file) => file.endsWith('.json'))
        .sort()
        .map((file) => ({ ...JSON.parse(readFileSync(join(directory, file), 'utf8')), locale, kind, slug: file.replace(/\.json$/, '') }))
    })
  )
}

const flagOf = (locale) => strings[locale].flag

const RIGHT_TO_LEFT = ['ar', 'he', 'fa', 'ur']

function languageMenu(page, available) {
  const own = strings[page.locale]
  const items = available
    .map((locale) => {
      const current = locale === page.locale ? ' aria-current="page"' : ''
      const hreflang = strings[locale].hreflang
      return `<li><a href="/${pagePath(locale, page.kind, page.slug)}" hreflang="${hreflang}" lang="${hreflang}"${current}><span class="flag flag-sm"><svg aria-hidden="true"><use href="#flag-${flagOf(locale)}" /></svg></span>${strings[locale].languageName}</a></li>`
    })
    .join('\n            ')
  if (available.length < 2) {
    return ''
  }
  return `<details class="languages">
          <summary aria-label="${escapeAttribute(own.languageLabel)}"><span class="flag flag-sm"><svg aria-hidden="true"><use href="#flag-${flagOf(page.locale)}" /></svg></span>${page.locale.toUpperCase()}</summary>
          <ul>
            ${items}
          </ul>
        </details>`
}

function alternates(page, available) {
  if (available.length < 2) {
    return ''
  }
  const links = available.map((locale) => `<link rel="alternate" hreflang="${strings[locale].hreflang}" href="${pageUrl(locale, page.kind, page.slug)}" />`)
  const fallback = available.includes('en') ? 'en' : available[0]
  links.push(`<link rel="alternate" hreflang="x-default" href="${pageUrl(fallback, page.kind, page.slug)}" />`)
  return links.join('\n    ')
}

const button = (locale) => `<a class="button" href="https://app.glossa.study">${strings[locale].start}<svg aria-hidden="true"><use href="#icon-arrow" /></svg></a>`

function panel(page) {
  const sample = page.panel
  if (!sample) {
    return ''
  }
  const direction = RIGHT_TO_LEFT.includes(sample.lang) ? ' dir="rtl"' : ''
  const lang = sample.lang ? ` lang="${sample.lang}"${direction}` : ''
  const parts = [`<p class="demo-label">${sample.label}</p>`]
  if (sample.title) {
    parts.push(`<p class="sample-title"${lang}>${sample.title}</p>`)
  }
  if (sample.text) {
    parts.push(`<p class="sample-text"${lang}>${sample.text}</p>`)
  }
  if (sample.question) {
    parts.push(`<p class="sample-question"${lang}>${sample.question}</p>`)
  }
  if (sample.options) {
    parts.push(`<ol class="sample-options" type="A"${lang}>${sample.options.map((option) => `<li>${option}</li>`).join('')}</ol>`)
  }
  if (sample.items) {
    parts.push(`<ol class="ladder">${sample.items.map((item) => `<li><b>${item.title}</b><span>${item.text}</span></li>`).join('')}</ol>`)
  }
  if (sample.note) {
    parts.push(`<p class="sample-note">${sample.note}</p>`)
  }
  return `<div class="demo" role="group" aria-label="${escapeAttribute(stripTags(sample.label))}">
            ${parts.join('\n            ')}
          </div>`
}

function sectionHead(section, id) {
  const eyebrow = section.eyebrow ? `<p class="eyebrow">${section.eyebrow}</p>\n            ` : ''
  const intro = (section.intro ? [section.intro].flat() : []).map((paragraph) => `\n            <p>${paragraph}</p>`).join('')
  return `<div class="section-head">
            ${eyebrow}<h2 id="${id}">${section.heading}</h2>${intro}
          </div>`
}

function sectionBody(section) {
  switch (section.type) {
    case 'table': {
      const [rowLabel, ...columnLabels] = section.columns
      // With two columns of cells, the second is Glossa's side of the comparison and is highlighted.
      const glossaColumn = (index) => (columnLabels.length > 1 && index === columnLabels.length - 1 ? ' class="glossa-col"' : '')
      const head = `<tr><th scope="col">${rowLabel}</th>${columnLabels.map((label, index) => `<th scope="col"${glossaColumn(index)}>${label}</th>`).join('')}</tr>`
      const rows = section.rows
        .map(([header, ...cells]) => `<tr><th scope="row">${header}</th>${cells.map((cell, index) => `<td data-label="${escapeAttribute(stripTags(columnLabels[index]))}"${glossaColumn(index)}>${cell}</td>`).join('')}</tr>`)
        .join('\n              ')
      const note = section.note ? `\n          <p class="compare-note">${section.note}</p>` : ''
      return `<table class="compare facts">
            <thead>
              ${head}
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>${note}`
    }
    case 'reasons':
      return `<ul class="reasons">
            ${section.items
              .map((item, index) => `<li>
              <span class="number" aria-hidden="true">${index + 1}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </li>`)
              .join('\n            ')}
          </ul>`
    case 'list':
      return `<ul class="plain-list">
            ${section.items.map((item) => `<li>${item}</li>`).join('\n            ')}
          </ul>`
    case 'checklist':
      return `<ul class="check-list">
            ${section.items.map((item) => `<li><svg aria-hidden="true"><use href="#icon-check" /></svg><span>${item}</span></li>`).join('\n            ')}
          </ul>`
    case 'faq':
      return `<dl class="faq">
            ${section.items.map((item) => `<div>
              <dt>${item.question}</dt>
              <dd>${item.answer}</dd>
            </div>`).join('\n            ')}
          </dl>`
    case 'links':
      return `<ul class="link-grid">
            ${section.items.map((item) => `<li><a href="${item.href}"><b>${item.title}</b><span>${item.text}</span></a></li>`).join('\n            ')}
          </ul>`
    default:
      throw new Error(`Unknown section type ${section.type}`)
  }
}

function sections(page) {
  return page.sections
    .map((section, index) => {
      const id = `section-${index + 1}`
      const sunken = index % 2 === 0
      const content = `${sectionHead(section, id)}
          ${sectionBody(section)}`
      return sunken
        ? `<section class="section sunken" aria-labelledby="${id}">
        <div class="wrap">
          ${content}
        </div>
      </section>`
        : `<div class="wrap">
        <section class="section" aria-labelledby="${id}">
          ${content}
        </section>
      </div>`
    })
    .join('\n\n      ')
}

// Every page links to the other pages of its kind in its language, so a visitor (and a crawler) finds
// the rest from wherever they land.
function relatedSection(page, pages) {
  const siblings = pages.filter((other) => other.locale === page.locale && other.kind === page.kind && other.slug !== page.slug && other.slug !== 'index')
  if (siblings.length === 0) {
    return []
  }
  const headingKey = page.slug === 'index' ? (page.kind === 'exams' ? 'allExams' : 'allCourses') : page.kind === 'exams' ? 'moreExams' : 'moreCourses'
  return [
    {
      type: 'links',
      heading: strings[page.locale][headingKey],
      items: siblings.map((other) => ({ href: `/${pagePath(other.locale, other.kind, other.slug)}`, title: other.card.title, text: other.card.text })),
    },
  ]
}

function render(page, pages) {
  const own = strings[page.locale]
  const available = LOCALES.filter((locale) => pages.some((other) => other.locale === locale && other.kind === page.kind && other.slug === page.slug))
  const allSections = [...page.sections, ...relatedSection(page, pages)]
  const kindIndexes = KINDS.filter((kind) => pages.some((other) => other.locale === page.locale && other.kind === kind && other.slug === 'index'))
  const footerIndexes = kindIndexes.map((kind) => `<a href="/${pagePath(page.locale, kind, 'index')}">${own[kind === 'exams' ? 'examsIndex' : 'coursesIndex']}</a>`).join('\n        ')
  const hero = `<section class="hero${page.panel ? '' : ' hero-single'}" aria-labelledby="hero-title">
          <div>
            <p class="eyebrow">${page.eyebrow}</p>
            <h1 id="hero-title">${page.heading}</h1>
            <p class="lead">${page.lead}</p>
            <div class="cta-row">
              ${button(page.locale)}
            </div>
            ${page.fineprint ? `<p class="fineprint">${page.fineprint}</p>` : ''}
          </div>
          ${panel(page)}
        </section>`
  const closing = page.closing
    ? `<section class="closing" aria-labelledby="closing-title">
        <div class="wrap">
          <h2 id="closing-title">${page.closing.heading}</h2>
          <p>${page.closing.text}</p>
          <div class="cta-row">
            ${button(page.locale)}
          </div>
        </div>
      </section>`
    : ''
  const depth = '../'.repeat(pagePath(page.locale, page.kind, page.slug).split('/').length - 1)
  return `<!doctype html>
<!-- Generated by tools/landing-pages/build.mjs from tools/landing-pages/pages/${page.locale}/${page.kind}/${page.slug}.json. Edit the JSON, not this file. -->
<html lang="${own.hreflang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeAttribute(page.title)}</title>
    <meta name="description" content="${escapeAttribute(page.description)}" />
    <link rel="canonical" href="${pageUrl(page.locale, page.kind, page.slug)}" />
    <meta name="theme-color" content="#f7f5fc" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0b0716" media="(prefers-color-scheme: dark)" />
    ${alternates(page, available)}
    <link rel="icon" href="${depth}favicon.ico" sizes="any" />
    <link rel="icon" href="${depth}favicon-32.png" type="image/png" />
    <link rel="apple-touch-icon" href="${depth}apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap"
    />
    <style>
${css
  .trimEnd()
  .split('\n')
  .map((line) => (line ? `      ${line}` : ''))
  .join('\n')}
    </style>
    <script src="/consent.js"></script>
    <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-KZKW55CH"></script>
  </head>
  <body>
    <a class="skip" href="#main">${own.skip}</a>
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <defs>
        ${symbols.split('\n').join('\n        ')}
      </defs>
    </svg>

    <div class="wrap">
      <header class="top">
        <a class="brand" href="/${prefix(page.locale)}">${wordmark}</a>
        ${languageMenu(page, available)}
        <a class="sign-in" href="https://app.glossa.study/login">${own.signIn}</a>
      </header>
    </div>

    <main id="main">
      <div class="wrap">
        ${hero}
      </div>

      ${sections({ ...page, sections: allSections })}

      ${closing}
    </main>

    <div class="wrap">
      <footer>
        <a href="/${prefix(page.locale)}">glossa.study</a>
        ${footerIndexes}
        <a href="https://app.glossa.study/privacy">${own.privacy}</a>
        <a href="https://app.glossa.study/terms">${own.terms}</a>
        <a href="https://app.glossa.study/refunds">${own.refunds}</a>
        <a href="https://app.glossa.study/support">${own.support}</a>
        <a href="mailto:support@glossa.study">support@glossa.study</a>
        <span class="company">${own.company}</span>
        ${page.trademark ? `<span class="trademark">${page.trademark}</span>` : ''}
      </footer>
    </div>
${read('scripts.html').trimEnd()}
  </body>
</html>
`
}

const pages = loadPages()
pages.forEach((page) => {
  const file = join(root, `${prefix(page.locale)}${page.kind}/${page.slug}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, render(page, pages))
})

const sitemapPages = [
  ...LOCALES.map((locale) => `https://glossa.study/${prefix(locale)}`),
  ...pages.map((page) => pageUrl(page.locale, page.kind, page.slug)),
]
writeFileSync(
  join(root, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by tools/landing-pages/build.mjs. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`
)
console.log(`Built ${pages.length} pages and sitemap.xml`)
