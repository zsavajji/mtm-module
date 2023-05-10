const defaults = {
  enabled: undefined,
  debug: false,

  url: undefined,

  pageTracking: false,
  pageViewEventName: 'route-change',

  autoInit: true,
  respectDoNotTrack: true,

  scriptId: 'mtm-script',
  scriptDefer: false,
  crossOrigin: false
}

module.exports = defaults
