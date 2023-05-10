const path = require('path')
const defaults = require('./defaults')
const { requireNuxtVersion } = require('./compatibility')

// doNotTrack polyfill
// https://gist.github.com/pi0/a76fd97c4ea259c89f728a4a8ebca741
const dnt = "(function(w,n,d,m,e,p){w[d]=(w[d]==1||n[d]=='yes'||n[d]==1||n[m]==1||(w[e]&&w[e][p]&&w[e][p]()))?1:0})(window,navigator,'doNotTrack','msDoNotTrack','external','msTrackingProtectionEnabled')"

module.exports = async function mtmModule (_options) {
  requireNuxtVersion(this.nuxt, '2.12.0')

  const options = {
    ...defaults,
    ..._options,
    ...this.options.mtm
  }

  // By default enable only for non development
  if (options.enabled === undefined) {
    options.enabled = !this.options.dev
  }

  if (options.dev !== undefined) {
    // eslint-disable-next-line no-console
    console.warn('[mtm] `dev` option is deprecated! Please use `enabled`')
    if (options.dev === true && this.options.dev) {
      options.enabled = true
    }
    delete options.dev
  }

  this.addTemplate({
    src: path.resolve(__dirname, 'plugin.utils.js'),
    fileName: 'mtm.utils.js',
    options
  })

  if (!options.enabled) {
    // Register mock plugin
    this.addPlugin({
      src: path.resolve(__dirname, 'plugin.mock.js'),
      fileName: 'mtm.js',
      options
    })
    return
  }

  // Async id evaluation
  if (typeof (options.url) === 'function') {
    options.url = await options.url()
  }
  // Compile scripts
  const injectScript = `var f=d.getElementsByTagName(s)[0],j=d.createElement(s);${options.crossOrigin ? 'j.crossOrigin=\'' + options.crossOrigin + '\';' : ''}j.${options.scriptDefer ? 'defer' : 'async'}=true;j.src='${options.url}';f.parentNode.insertBefore(j,f)` // deps: d,s,i

  const doNotTrackScript = options.respectDoNotTrack ? 'if(w.doNotTrack||w[x][i])return;' : ''

  const initLayer = "w[l]=w[l]||[];w[l].push({'mtm.startTime':(new Date().getTime()),'event':'mtm.Start'})" // deps: w,l
  let script = `w[x]={};w._mtm_inject=function(i){${doNotTrackScript}w[x][i]=1;${initLayer};${injectScript};}`

  if (options.autoInit && options.url) {
    script += `;w[y]('${options.url}')`
  }

  // Add doNotTrack polyfill and wrap to IIFE
  script = `${dnt};(function(w,d,s,l,x,y){${script}})(window,document,'script','_mtm','_mtm_ids','_mtm_inject')`

  // Guard against double IIFE executation in SPA mode (#3)
  script = `if(!window._mtm_init){window._mtm_init=1;${script}}`

  // Add matomo tag manager <script> to head
  if (typeof this.options.head === 'function') {
    // eslint-disable-next-line no-console
    console.warn('[mtm] head is provided as a function which is not supported by this module at the moment. Removing user-provided head.')
    this.options.head = {}
  }

  this.options.head.script = this.options.head.script || []
  this.options.head.script.push({
    hid: options.scriptId,
    innerHTML: script
  })

  // Disable sanitazions
  this.options.head.__dangerouslyDisableSanitizersByTagID = this.options.head.__dangerouslyDisableSanitizersByTagID || {}
  this.options.head.__dangerouslyDisableSanitizersByTagID[options.scriptId] = ['innerHTML']

  // Remove trailing slash to avoid duplicate slashes when appending route path
  const routerBase = this.options.router.base.replace(/\/+$/, '')

  // Register plugin
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'mtm.js',
    options: {
      ...options,
      routerBase
    }
  })
}

module.exports.meta = require('../package.json')
