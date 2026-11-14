// Google's tag may only set cookies after the visitor agrees, so consent starts denied and a stored answer is
// applied before the tag loads. The answer is a cookie on glossa.study, shared with app.glossa.study, so one
// answer covers both. Ads are measured but never personalised.
window.dataLayer = window.dataLayer || []
function gtag() {
  dataLayer.push(arguments)
}
gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
;(() => {
  const cookie = 'glossaConsent'
  const stored = (/(?:^|; )glossaConsent=(granted|denied)(?:;|$)/.exec(document.cookie) ?? [])[1] ?? null
  if (stored === 'granted') {
    gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted' })
  }
  gtag('js', new Date())

  const texts = {
    en: ['Cookies for analytics and ads', 'Glossa uses Google Analytics and Google Ads to see how Glossa is used and which ads bring learners here, with cookies only if you agree. Ads are never personalised.', 'Accept', 'Decline', 'Privacy policy', 'Cookie settings'],
    de: ['Cookies für Analyse und Werbung', 'Glossa nutzt Google Analytics und Google Ads, um zu sehen, wie Glossa verwendet wird und welche Anzeigen Lernende herbringen – mit Cookies nur, wenn du zustimmst. Werbung wird nie personalisiert.', 'Akzeptieren', 'Ablehnen', 'Datenschutzerklärung', 'Cookie-Einstellungen'],
    es: ['Cookies de análisis y anuncios', 'Glossa usa Google Analytics y Google Ads para ver cómo se usa Glossa y qué anuncios traen estudiantes, con cookies solo si aceptas. Los anuncios nunca se personalizan.', 'Aceptar', 'Rechazar', 'Política de privacidad', 'Configuración de cookies'],
    fi: ['Analytiikka- ja mainosevästeet', 'Glossa käyttää Google Analyticsia ja Google Adsia nähdäkseen, miten Glossaa käytetään ja mitkä mainokset tuovat oppijoita, ja evästeitä vain, jos hyväksyt ne. Mainoksia ei koskaan kohdenneta sinulle.', 'Hyväksy', 'Hylkää', 'Tietosuojaseloste', 'Evästeasetukset'],
    fr: ['Cookies de mesure d’audience et publicitaires', 'Glossa utilise Google Analytics et Google Ads pour voir comment Glossa est utilisé et quelles annonces amènent des apprenants, avec des cookies seulement si vous les acceptez. Les annonces ne sont jamais personnalisées.', 'Accepter', 'Refuser', 'Politique de confidentialité', 'Paramètres des cookies'],
    it: ['Cookie di analisi e pubblicità', 'Glossa usa Google Analytics e Google Ads per vedere come viene usato Glossa e quali annunci portano studenti, con i cookie solo se accetti. Gli annunci non sono mai personalizzati.', 'Accetta', 'Rifiuta', 'Informativa sulla privacy', 'Impostazioni cookie'],
    pt: ['Cookies de análise e anúncios', 'O Glossa usa o Google Analytics e o Google Ads para ver como o Glossa é usado e quais anúncios trazem alunos, com cookies só se você aceitar. Os anúncios nunca são personalizados.', 'Aceitar', 'Recusar', 'Política de privacidade', 'Configurações de cookies'],
    ru: ['Cookie для аналитики и рекламы', 'Glossa использует Google Analytics и Google Ads, чтобы видеть, как используется Glossa и какая реклама приводит учащихся, а cookie — только с вашего согласия. Реклама никогда не персонализируется.', 'Принять', 'Отклонить', 'Политика конфиденциальности', 'Настройки cookie'],
    uk: ['Cookie для аналітики та реклами', 'Glossa використовує Google Analytics і Google Ads, щоб бачити, як використовують Glossa і яка реклама приводить учнів, а cookie — лише за вашою згодою. Реклама ніколи не персоналізується.', 'Прийняти', 'Відхилити', 'Політика конфіденційності', 'Налаштування cookie'],
  }

  const answer = (value) => {
    const domain = location.hostname.endsWith('glossa.study') ? '; Domain=glossa.study' : ''
    document.cookie = `${cookie}=${value}; Max-Age=${365 * 24 * 60 * 60}; Path=/; SameSite=Lax${domain}${location.protocol === 'https:' ? '; Secure' : ''}`
    gtag('consent', 'update', { analytics_storage: value, ad_storage: value, ad_user_data: value })
    if (value === 'denied') {
      // Google keeps its cookies on the widest domain it can set them on, so each is cleared there and on the host.
      const parts = location.hostname.split('.')
      const domains = ['', ...parts.slice(0, -1).map((_, index) => `; Domain=${parts.slice(index).join('.')}`)]
      document.cookie
        .split(';')
        .map((entry) => entry.split('=')[0].trim())
        .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gcl_'))
        .forEach((name) => domains.forEach((attribute) => (document.cookie = `${name}=; Max-Age=0; Path=/${attribute}`)))
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const [title, body, accept, decline, privacy, settings] = texts[document.documentElement.lang.slice(0, 2)] ?? texts.en
    const style = document.createElement('style')
    style.textContent = `
      .consent { position: fixed; inset: auto 0 0; z-index: 50; padding: 14px var(--gutter) calc(14px + env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: var(--surface); box-shadow: var(--shadow); font-family: var(--sans); color: var(--text); }
      .consent-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; max-width: 1120px; margin: 0 auto; }
      .consent-text { flex: 1 1 320px; }
      .consent h2 { margin: 0 0 4px; font-size: 1rem; }
      .consent p { margin: 0; font-size: 0.875rem; color: var(--muted); }
      .consent-actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .consent button { font: inherit; font-weight: 600; padding: 10px 18px; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); }
      .consent button.consent-accept { border-color: transparent; background: var(--primary); color: var(--on-primary); }
      footer .consent-settings { font: inherit; padding: 0; border: 0; background: none; color: var(--muted); text-decoration: underline; cursor: pointer; }
    `
    document.head.append(style)

    const banner = document.createElement('section')
    banner.className = 'consent'
    banner.setAttribute('aria-labelledby', 'consent-title')
    banner.innerHTML = `<div class="consent-inner"><div class="consent-text"><h2 id="consent-title"></h2><p><span></span> <a href="https://app.glossa.study/privacy"></a></p></div><div class="consent-actions"><button type="button" class="consent-accept"></button><button type="button" class="consent-decline"></button></div></div>`
    banner.querySelector('h2').textContent = title
    banner.querySelector('p span').textContent = body
    banner.querySelector('p a').textContent = privacy
    banner.querySelector('.consent-accept').textContent = accept
    banner.querySelector('.consent-decline').textContent = decline
    const choose = (value) => {
      answer(value)
      banner.remove()
    }
    banner.querySelector('.consent-accept').addEventListener('click', () => choose('granted'))
    banner.querySelector('.consent-decline').addEventListener('click', () => choose('denied'))
    if (stored === null) {
      document.body.append(banner)
    }

    const footer = document.querySelector('footer')
    if (footer) {
      const reopen = document.createElement('button')
      reopen.type = 'button'
      reopen.className = 'consent-settings'
      reopen.textContent = settings
      reopen.addEventListener('click', () => document.body.append(banner))
      footer.querySelector('.company')?.before(reopen)
    }
  })
})()
