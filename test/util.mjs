import { scope, scoper } from '..'
import { inspect }       from 'node:util'

const fail = message => ({ pass: false, message: () => message })

const checkCache = (gotCache, wantCache) => {
    if (!wantCache) {
        return null
    }

    const $gotCache = inspect(gotCache)
    const $wantCache = inspect(wantCache)
    const error = $gotCache === $wantCache ? null : `${$gotCache} is not ${$wantCache}`

    gotCache.clear()

    return error
}

export const toBeScoped = (got, want) => {
    const $got = JSON.stringify(got)
    const $want = JSON.stringify(want)

    for (const options of [{}, { cache: true }, { cache: false }, { cache: new Map() }]) {
        const $options = inspect(options)
        const customScope = scoper(options)

        let wantCache = (options.cache instanceof Map) ? new Map([[got, want]]) : null
        let error = null

        if (scope(got) !== want) {
            return fail(`scope(${$got}) is not ${$want}`)
        }

        if (scope(got, options) !== want) {
            return fail(`scope(${$got}, ${$options}) is not ${$want}`)
        }

        if ((error = checkCache(options.cache, wantCache))) {
            return fail(`invalid cache for scope(${$got}, ${$options}): ${error}`)
        }

        if (customScope(got) !== want) {
            return fail(`scoper(${$options})(${$got}) is not ${$want}`)
        }

        if ((error = checkCache(options.cache, wantCache))) {
            return fail(`invalid cache for scoper(${$options})(${$got}): ${error}`)
        }

        // the only testable options override is to enable a (user-supplied)
        // cache when one wasn't enabled or disable it when one was
        if (wantCache) {
            const overrideOptions = { cache: false }
            const $overrideOptions = inspect(overrideOptions)
            const overrideWantCache = new Map()

            if (customScope(got, overrideOptions) !== want) {
                return fail(`scoper(${$options})(${$got}, ${$overrideOptions}) is not ${$want}`)
            }

            if ((error = checkCache(options.cache, overrideWantCache))) {
                return fail(`invalid cache for scoper(${$options})(${$got}, ${$overrideOptions}): ${error}`)
            }
        } else {
            const overrideOptions = { cache: new Map() }
            const $overrideOptions = inspect(overrideOptions)
            const overrideWantCache = new Map([[got, want]])

            if (customScope(got, overrideOptions) !== want) {
                return fail(`scoper(${$options})(${$got}, ${$overrideOptions}) is not ${$want}`)
            }

            if ((error = checkCache(overrideOptions.cache, overrideWantCache))) {
                return fail(`invalid cache for scoper(${$options})(${$got}, ${$overrideOptions}): ${error}`)
            }
        }
    }

    return { pass: true, message: () => `scope(${got}) is ${$want}` }
}
