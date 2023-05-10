const path = require('path')
const { setup, loadConfig, get, url } = require('@nuxtjs/module-test-utils')
const defaultSettings = require(path.join(__dirname, '../', 'lib', 'defaults.js'))

function expectPageTrackingEvent (eventsArray, expectedEvent) {
  return new Promise((resolve) => {
    // Need to wait at least 500ms as that's how long plugin delays before triggering event.
    setTimeout(() => {
      expect(eventsArray).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining(expectedEvent)
        ])
      )
      expect(eventsArray.filter(event => event.event === 'nuxtRoute').length).toBe(1)
      resolve()
    }, 550)
  })
}

const modes = ['universal', 'spa']

for (const mode of modes) {
  describe(`Module (${mode} mode)`, () => {
    let nuxt

    const nuxtConfig = loadConfig(__dirname, '../../example')
    nuxtConfig.mode = mode

    const mtmUrl = nuxtConfig.mtm.url
    const runtimeUrl = nuxtConfig.publicRuntimeConfig.mtm.url
    const scriptId = nuxtConfig.mtm.scriptId || defaultSettings.scriptId

    beforeAll(async () => {
      ({ nuxt } = (await setup(nuxtConfig)))
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('Render', async () => {
      const html = await get('/')
      const expected = { universal: 'Works!', spa: 'Loading...' }[mode]
      expect(html).toContain(expected)
    })

    test('Has mtm script', async () => {
      const html = await get('/')
      expect(html).toContain(`data-hid="${scriptId}"`)
    })

    // test with real mtm id
    test('mtm should be defined ($nuxt.$mtm)', async () => {
      const window = await nuxt.renderAndGetWindow(url('/'))
      expect(window.$nuxt.$mtm).toBeDefined()
    })

    test('Should include runtimeConfig', async () => {
      const window = await nuxt.renderAndGetWindow(url('/'))

      const headmtmScriptsExternal = window.document.querySelectorAll(`head script[src^="${runtimeUrl}"]`)

      expect(headmtmScriptsExternal.length).toBe(1)
    })

    test('Verifying duplicate mtm script', async () => {
      const window = await nuxt.renderAndGetWindow(url('/'))

      const headmtmScriptsExternal = window.document.querySelectorAll(`head script[src^="${mtmUrl}"]`)
      const headmtmScriptsHid = window.document.querySelectorAll(`head script[data-hid="${scriptId}"]`)
      const totalAmoutOfmtmScriptsAtHead = headmtmScriptsExternal.length + headmtmScriptsHid.length

      expect(totalAmoutOfmtmScriptsAtHead).toBeLessThan(4)
    })

    test('Should include pushed event', async () => {
      const window = await nuxt.renderAndGetWindow(url('/'))
      expect(window._mtm).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ event: 'ssr' })
        ])
      )
      expect(window._mtm.filter(event => event.event === 'ssr').length).toBe(1)
    })

    test('Should include page tracking event', async () => {
      const window = await nuxt.renderAndGetWindow(url('/'))

      await expectPageTrackingEvent(window._mtm, {
        event: 'nuxtRoute',
        pageTitle: '@nuxtjs/mtm-module',
        pageType: 'PageView',
        pageUrl: '/',
        routeName: 'index'
      })
    })
  })
}

for (const mode of modes) {
  describe(`Page tracking with router base (${mode} mode)`, () => {
    let nuxt

    const override = {
      mtm: {
        pageTracking: true
      }
    }

    const nuxtConfig = loadConfig(__dirname, '../../example', override, { merge: true })
    if (!nuxtConfig.router) {
      nuxtConfig.router = {}
    }
    nuxtConfig.router.base = '/base/'

    beforeAll(async () => {
      ({ nuxt } = (await setup(nuxtConfig)))
    }, 60000)

    afterAll(async () => {
      await nuxt.close()
    })

    test('Event should contain page URL with base', async () => {
      const window = await nuxt.renderAndGetWindow(url('/base/'))

      await expectPageTrackingEvent(window._mtm, {
        event: 'nuxtRoute',
        pageTitle: '@nuxtjs/mtm-module',
        pageType: 'PageView',
        pageUrl: '/base/',
        routeName: 'index'
      })
    })
  })
}
