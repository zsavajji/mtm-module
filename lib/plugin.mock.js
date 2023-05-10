// This is a mock version because mtm module is disabled
// You can explicitly enable module using `mtm.enabled: true` in nuxt.config
import { log } from './mtm.utils'

const _url = '<%= options.url %>'

function startPageTracking (ctx) {
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
  log('Using mocked API. Real mtm events will not be reported.')
  const mtm = {
    init: (url) => {
      log('init', url)
    },
    push: (event) => {
      log('push', process.client ? event : JSON.stringify(event))
      if (typeof event.eventCallback === 'function') {
        event.eventCallback()
      }
    }
  }

  ctx.$mtm = mtm
  inject('mtm', mtm)
  <% if (options.pageTracking) { %>if (process.client) { startPageTracking(ctx); }<% } %>
}
