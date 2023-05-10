# @zsavajji/mtm

> Matomo Tag Manager Module for Nuxt.js

## Setup

1. Add `@zsavajji/mtm` dependency to your project

```bash
yarn add @zsavajji/mtm # or npm install @zsavajji/mtm
```

2. Add `@zsavajji/mtm` to the `modules` section of `nuxt.config.js`

```js
export default {
  modules: [
    '@zsavajji/mtm',
  ],
  mtm: {
    url: 'https://cdn.matomo.cloud/<my.cloud>/container_<id>.js'
  }
}
```
### Runtime Config

You can use [runtime config](https://nuxtjs.org/guide/runtime-config) if need to use dynamic environment variables in production. Otherwise, the options will be hardcoded during the build and won't be read from `nuxt.config` anymore.

```js
export default {
  modules: [
    '@zsavajji/mtm'
  ],

  mtm: {
    url: 'https://cdn.matomo.cloud/<my.cloud>/container_<id>.js'
  },

  publicRuntimeConfig: {
    mtm: {
      id: process.env.MATOMO_URL
    }
  },
}
```

## Options

Defaults:

```js
export default {
  mtm: {
    enabled: undefined, /* see below */
    debug: false,

    url: undefined,

    pageTracking: false,
    pageViewEventName: 'nuxtRoute',

    autoInit: true,
    respectDoNotTrack: true,

    scriptId: 'mtm-script',
    scriptDefer: false,
    crossOrigin: false
  }
}
```

### `enabled`

mtm module uses a debug-only version of `$mtm` during development (`nuxt dev`).

You can explicitly enable or disable it using `enabled` option:

```js
export default {
  mtm: {
    // Always send real mtm events (also when using `nuxt dev`)
    enabled: true
  }
}
```

### `debug`

Whether `$mtm` API calls like `init` and `push` are logged to the console.

### Manual mtm Initialization

There are several use cases that you may need more control over initialization:

- Block Matomo before user directly allows (GDPR realisation or other)
- Dynamic ID based on request path or domain
- Enable mtm on page level

`nuxt.config.js`:

```js
export default {
 modules: [
  '@zsavajji/mtm'
 ],
 plugins: [
  '~/plugins/mtm'
 ]
}
```

`plugins/mtm.js`:

```js
export default function({ $mtm, route }) {
  $mtm.init('https://cdn.matomo.cloud/<my.cloud>/container_<id>.js')
}
```

- **Note:** All events will be still buffered in data layer but won't send until `init()` method getting called.

### Router Integration

You can optionally set `pageTracking` option to `true` to track page views.

**Note:** This is disabled by default to prevent double events when using alongside with Google Analytics so take care before enabling this option.

The default event name for page views is `nuxtRoute`, you can change it by setting the `pageViewEventName` option.

## Usage

### Pushing events

You can push events into the configured layer:

```js
this.$mtm.push({ event: 'myEvent', ...someAttributes })
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install` or `npm install`
3. Start development server using `yarn dev` or `MATOMO_URL=<your mtm url> yarn dev` if you want to provide custom MATOMO_URL.

## License

[MIT License](./LICENSE)
