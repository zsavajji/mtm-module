import { log } from './mtm.utils'

const _url = '<%= options.url %>'

function mtmClient(ctx, initialized) {
  return {
    init(url = _url) {
      if (initialized[url] || !window._mtm_inject) { return }
      window._mtm_inject(url)
      initialized[url] = true
      log('init', url)
    },
    push(obj) {
      if (!window._mtm) { window._mtm = [] }
      window._mtm.push(obj)
      log('push', obj)
    }
  }
}

function mtmServer(ctx, initialized) {
  const events = []
  const inits = []

  ctx.beforeNuxtRender(() => {
    if (!inits.length && !events.length) {
      return
    }

    const mtmScript = ctx.app.head.script.find(s => s.hid == '<%= options.scriptId %>')
    mtmScript.innerHTML = `window._mtm=${JSON.stringify(events)};${mtmScript.innerHTML}`

    if (inits.length) {
      mtmScript.innerHTML += `;${JSON.stringify(inits)}.forEach(function(i){window._mtm_inject(i)})`
    }
  })

  return {
    init(url = _url) {
      if (initialized[url]) { return }
      inits.push(url)
      initialized[url] = true
      log('init', url)
    },
    push(obj) {
      events.push(obj)
      log('push', JSON.stringify(obj))
    }
  }
}

function startPageTracking(ctx) {
  ctx.app.router.afterEach((to) => {
    setTimeout(() => {
      ctx.$mtm.push(to.mtm || {
        routeName: to.name,
        pageType: 'PageView',
        pageUrl: '<%= options.routerBase %>' + to.fullPath,
        pageTitle: (typeof document !== 'undefined' && document.title) || '',
        event: '<%= options.pageViewEventName %>'
      })
    }, 500)
  })
}

export default function (ctx, inject) {
  const runtimeConfig = (ctx.$config && ctx.$config.mtm) || {}
  const autoInit = <%= options.autoInit %>
  const url = '<%= options.url %>'
  const runtimeUrl = runtimeConfig.url
  const initialized = autoInit && url ? {[url]: true} : {}
  const $mtm = process.client ? mtmClient(ctx, initialized) : mtmServer(ctx, initialized)
  if (autoInit && runtimeUrl && runtimeUrl !== url) { $mtm.init(runtimeUrl) }
  ctx.$mtm = $mtm
  inject('mtm', ctx.$mtm)
  <% if (options.pageTracking) { %>if (process.client) { startPageTracking(ctx); }<% } %>
}
