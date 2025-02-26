# scope-css-selector

[![Build Status](https://github.com/chocolateboy/scope-css-selector/workflows/test/badge.svg)](https://github.com/chocolateboy/scope-css-selector/actions?query=workflow%3Atest)
[![NPM Version](https://img.shields.io/npm/v/scope-css-selector.svg)](https://www.npmjs.org/package/scope-css-selector)

<!-- TOC -->

- [NAME](#name)
- [FEATURES](#features)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
- [DESCRIPTION](#description)
  - [Why?](#why)
- [TYPES](#types)
- [EXPORTS](#exports)
  - [scope (default)](#scope)
  - [scoper](#scoper)
- [DEVELOPMENT](#development)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- TOC END -->

# NAME

scope-css-selector - automatically :scope CSS selectors

# FEATURES

- &lt; 3K minified + gzipped
- Fully typed (TypeScript)
- CDN builds (UMD): [jsDelivr][], [unpkg][]

# INSTALLATION

```bash
$ npm install scope-css-selector
```

# SYNOPSIS

```javascript
import scope from 'scope-css-selector'

scope('div.foo, span.bar')       // ":scope div.foo, :scope span.bar"
scope('> div.foo')               // ":scope > div.foo"
scope(':scope > div.foo')        // ":scope > div.foo"
scope('div.foo, :root span.bar') // ":scope div.foo, :root span.bar"
```

# DESCRIPTION

This library exports a helper function which prepends the `:scope` pseudoclass
to every top-level (i.e. comma-separated) expression within a CSS selector
which isn't already anchored to `:root` or `:scope`.

It works around a [bug][resig] in the spec of DOM queries in JavaScript, which
— contrary to appearances — are not evaluated relative to the context element.
In addition, it allows selectors to be written in a "context-free" way similar
to jQuery and other DOM libraries, e.g.:

    find(el, '> div.foo') // ":scope > div.foo"

The `scope` function is a pure function which operates on the syntax tree of
the selector and doesn't depend on the DOM in any way. As such, it is more
robust than regexp-based solutions, which typically don't attempt to handle
(comma-separated) selector lists, and safer than solutions which
[modify the DOM][sizzle-dom-mutation] or [patch host objects][patch-html-element]
such as HTMLElement.

In addition to the default [`scope`](#scope) export, this library exports a
builder function ([`scoper`](#scoper)) which can be used to create a custom
`scope` function with different [options](#options) baked in.

## Why?

Because the default behavior of `querySelector` and `querySelectorAll` is
broken<sup>[[1]][resig]</sup>:

> As it stands DOM Element-rooted queries are borderline useless to libraries –
> and users. Their default behavior is unexpected and confusing.

Rather than finding elements relative to the context element, queries are
evaluated relative to the *document root* and the results are then filtered
according to whether they're descendants of the context element. While this
produces the expected results in some cases, there are many common cases where
it doesn't.

For example, given the following HTML:

```html
<div id="context">
    <p id="facepalm">Don't select me!</p>

    <div>
        <p id="ok">Select me!</p>
    </div>
</div>
```

\- querying the context element for its first `div p` returns the first
paragraph rather than the second:

```javascript
const context = document.getElementById('context')
const result = context.querySelector('div p')

console.log(result.id) // "facepalm"
```

This is because the first paragraph is a P inside a DIV and it's a descendant
of the context element. Getting the correct/expected result requires a `:scope`
anchor, e.g.:

```javascript
const query = (el, selector) => el.querySelector(scope(selector))
const result = query(context, 'div p') // ":scope div p"

console.log(result.id) // "ok"
```

Note that, as shown in this example, this library is intended to be used by DOM
libraries and helper functions to automatically scope selectors, rather than as
a way to manually fix selector literals in user code.

# TYPES

The following types are referenced in the descriptions below.

```typescript
type Cache = Map<string, string>;

interface Options {
    cache?: boolean | Cache;
}
```

# EXPORTS

<a name="scope"></a>
## scope (default)

- **Type**: `(selector: string, options?: Options) => string`
- **Alias**: `scope`

```javascript
import scope from 'scope-css-selector'

scope('div.foo, :root span.bar, > .baz') // ":scope div.foo, :root span.bar, :scope > .baz"
```

Takes a CSS selector and returns the selector with `:scope` prepended to each
top-level expression which isn't already anchored to `:scope` or `:root.` It
also accepts an optional options object with the following (optional)
properties:

<!-- TOC:ignore -->
### Options

<!-- TOC:ignore -->
#### cache

- **Type**: `boolean | Cache`
- **Default**: `true`

```javascript
scope('div.foo, span.bar', { cache: false }) // disable caching for this call
```

The `cache` option determines whether or not/how the results are cached. If
false, caching is disabled. If true (default), an internal cache is used. If a
Map is supplied, it is used to cache the results.

## scoper

- **Type**: `(options: Options) => (selector: string, options?: Options) => string`

```javascript
import { scoper } from 'scope-css-selector'

const cache = new Map()
const scope = scoper({ cache })

scope('div.foo')   // ":scope div.foo"
console.log(cache) // Map (1) { "div.foo" => ":scope div.foo" }
```

Returns a custom `scope` function which can be used to scope CSS selectors with
the specified [options](#options) baked in.

As with the default `scope` function, the default options can be overridden by
supplying new options as the second argument:

```javascript
import { scoper } from 'scope-css-selector'

const cache = new Map()
const scope = scoper({ cache })

scope('div.foo')   // ":scope div.foo"
console.log(cache) // Map (1) { "div.foo" => ":scope div.foo" }

// disable caching for this call
scope('div.bar, span.baz', { cache: false })
console.log(cache) // Map (1) { "div.foo" => ":scope div.foo" }
```

# DEVELOPMENT

<details>

<!-- TOC:ignore -->
## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:doc - generate the README's TOC (table of contents)
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- rebuild - clean the target directory and recompile the library
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# COMPATIBILITY

- [Maintained Node.js versions](https://github.com/nodejs/Release#readme) and compatible browsers

# SEE ALSO

<!-- TOC:ignore -->
## Libraries

- [element-qsa-scope](https://github.com/jonathantneal/element-qsa-scope)
- [scoped-queryselectorall](https://github.com/lski/scoped-queryselectorall)
- [scopedQuerySelectorShim](https://github.com/lazd/scopedQuerySelectorShim)

<!-- TOC:ignore -->
## Articles

- [John Resig - Thoughts on querySelectorAll](https://johnresig.com/blog/thoughts-on-queryselectorall/)

# VERSION

0.0.1

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2025 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the terms
of the [MIT license](https://opensource.org/licenses/MIT).

[jsDelivr]: https://cdn.jsdelivr.net/npm/scope-css-selector
[unpkg]: https://unpkg.com/scope-css-selector
[resig]: https://johnresig.com/blog/thoughts-on-queryselectorall/
[patch-html-element]: https://github.com/lazd/scopedQuerySelectorShim?tab=readme-ov-file#notes
[sizzle-dom-mutation]: https://github.com/jquery/sizzle/issues/483
