const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  head: {
    title: '@nuxtjs/mtm-module'
  },
  srcDir: __dirname,
  render: {
    resourceHints: false
  },
  modules: [
    { handler: require('../') }
  ],
  plugins: [
    '~/plugins/mtm'
  ],
  mtm: {
    enabled: true,
    url: process.env.MATOMO_URL || 'https://cdn.matomo.cloud/we-go.matomo.cloud/container_pr2d9rN3.js',
    scriptDefer: true,
    pageTracking: true
  },
  publicRuntimeConfig: {
    mtm: {
      url: 'https://cdn.matomo.cloud/we-go.matomo.cloud/container_pr2d9rN3.js'
    }
  }
}
