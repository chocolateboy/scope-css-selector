import { type Options, scope } from './scope.js'

export const scoper = (options: Options): typeof scope => {
    if (!options) {
        return scope
    }

    const $options = Object(options)

    return (selector: string, options?: Options): string => {
        return scope(selector, options || $options)
    }
}
