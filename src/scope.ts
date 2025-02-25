import { type Selector, SelectorType, parse, stringify } from 'css-what'

// a helper function which prepends the :scope pseudoclass to every top-level
// (i.e. comma-separated) expression within a selector. as well as making
// selectors sane [1], it allows jQuery like top-level ">", e.g.:
//
//   find(el, "> a[href]")
//
// [1] https://developer.rackspace.com/blog/using-querySelector-on-elements/

export type Cache = Map<string, string>

export interface Options {
    cache?: boolean | Cache;
}

const CACHE: Cache = new Map()
const DEFAULT_OPTIONS = { cache: true }

/*
 * > CssWhat.parse('span, div')
 *
 * [
 *     [
 *         { type: "tag", name: "span", namespace: null }
 *     ],
 *     [
 *         { type: "tag", name: "div", namespace: null }
 *     ]
 * ]
 *
 * > CssWhat.parse(':scope span')
 *
 * [
 *     [
 *         { type: "pseudo", name: "scope", data: null },
 *         { type: "descendant" },
 *         { type: "tag", name: "span", namespace: null }
 *     ]
 * ]
 *
 * > CssWhat.parse(':scope > span')
 *
 * [
 *     [
 *         { type: "pseudo", name: "scope", data: null },
 *         { type: "child" },
 *         { type: "tag", name: "span", namespace: null }
 *     ]
 * ]
 */

export const scope = (selector: string, options?: Options): string => {
    const { cache: $cache = true } = options || DEFAULT_OPTIONS
    const cache = $cache === true ? CACHE : $cache instanceof Map ? $cache : false

    if (cache) {
        const cached = cache.get(selector)

        if (cached) {
            return cached
        }
    }

    const parsed = parse(selector)

    for (const tokens of parsed) {
        const first = tokens[0] || {}
        const isScoped = first.type === SelectorType.Pseudo
            && (first.name === 'scope' || first.name === 'root')

        if (isScoped) {
            continue
        }

        const scoped: Selector[] = [
            {
                type: SelectorType.Pseudo,
                name: 'scope',
                data: null,
            }
        ]

        // combinators (child, sibling etc.) are distinguished by having no
        // +name+ field.
        if ('name' in first) { // not a combinator
            scoped.push({ type: SelectorType.Descendant })
        }

        tokens.unshift(...scoped)
    }

    const result = stringify(parsed)

    if (cache) {
        cache.set(selector, result)
    }

    return result
}
