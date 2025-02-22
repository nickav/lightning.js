# ⚡ Lightning Links ⚡

_Supercharge your static websites!_

## Features
- ✅ Works with existing static websites
- ✅ Single-page app feel
- ✅ Minimizes network requests
- ✅ Public-domain license
- ✅ 2.5KB of JavaScript (minified)

## Usage

1. Download and place the [`lightning.js`](./lightning.js) file in your public files.
2. Include the [`lightning.js`](./lightning.js) file in your all your HTML pages:

```html
<script src="./lightning.js?v=1.0.0&run=1"></script>
```

3. That's it!

### Usage With Options

You can explicitly invoke the library like this:

```html
<script src="./lightning.js?v=1.0.0"></script>
<script>Lightning({ cacheTimeout: 60*60 });</script>
```

Or you can set options ahead of time on `window.LIGHTNING_OPTIONS`:

```html
<script>window.LIGHTNING_OPTIONS = { cacheTimeout: 60*60 };</script>
<script src="./lightning.js?v=1.0.0"></script>
```

See the full list of [options](#options).

## Options

```js
const options = {
    /** The query selector to find links on the page. */
    linkSelector: 'a:not([data-lightning="false"])',
    /**
     * The query selector to find the content to replace.
     * By default, the whole body is replaced when switching pages.
     * If you use this only a subset of the page will be replaced (for example, for animations).
     */ 
    contentSelector: 'body',
    /** Whether or not to prefetch pages on mousehover. */
    prefetch: true,
    /** The prefetch delay in miliseconds. Will only prefetch content if the mouse is over a link for at least this much time. */
    prefetchDelay: 20,
    /** Whether or not to cache pages that have been visited. */
    cache: true,
    /** The timeout in seconds to invalidate a cached page. */
    cacheTimeout: 0,
    /** Whether or not to scroll to the top of the page when transitioning between pages. */
    scrollToTop: true,
    /** Whether or not to restore the className on the body and the content when switching pages. */
    restoreClassName: true,
    /** When true, prints debug information to the console. */
    debug: false,
};
```

## Credit

Written by Nick Aversano. Credit is appreciated but not required.

Inspired by [TurboLinks](https://github.com/turbolinks/turbolinks).

