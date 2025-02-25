import { expect, it } from 'vitest'
import { toBeScoped } from './util.mjs'

expect.extend({ toBeScoped })

it('preserves an empty selector', () => {
    expect('').toBeScoped('')
    expect(' ').toBeScoped('')
})

it('scopes single selectors', () => {
    expect('div').toBeScoped(':scope div')
    expect('span.foo').toBeScoped(':scope span.foo')
    expect('li:has(.bar)').toBeScoped(':scope li:has(.bar)')
    expect('img[data-baz]').toBeScoped(':scope img[data-baz]')
})

it('scopes single combinators', () => {
    expect('  div').toBeScoped(':scope div')
    expect('> span.foo').toBeScoped(':scope > span.foo')
    expect('+ li:has(.bar)').toBeScoped(':scope + li:has(.bar)')
    expect('~ img[data-baz]').toBeScoped(':scope ~ img[data-baz]')
})

it('preserves single anchored selectors', () => {
    expect(':scope div').toBeScoped(':scope div')
    expect(':root span.foo').toBeScoped(':root span.foo')
    expect(':scope:scope li:has(.bar)').toBeScoped(':scope:scope li:has(.bar)')
    expect(':root :scope img[data-baz]').toBeScoped(':root :scope img[data-baz]')
})

it('preserves single anchored combinators', () => {
    expect(':scope div').toBeScoped(':scope div')
    expect(':root > span.foo').toBeScoped(':root > span.foo')
    expect(':scope + li:has(.bar)').toBeScoped(':scope + li:has(.bar)')
    expect(':root ~ img[data-baz]').toBeScoped(':root ~ img[data-baz]')
})

it('scopes multiple selectors', () => {
    expect('div, div').toBeScoped(':scope div, :scope div')

    expect('span.foo, span.bar').toBeScoped(
        ':scope span.foo, :scope span.bar'
    )

    expect('li:has(.foo), li:has(.bar)').toBeScoped(
        ':scope li:has(.foo), :scope li:has(.bar)'
    )

    expect('img[data-foo], img[data-bar]').toBeScoped(
        ':scope img[data-foo], :scope img[data-bar]'
    )
})

it('scopes multiple combinators', () => {
    expect('+ div, div').toBeScoped(':scope + div, :scope div')

    expect('span.foo, > span.bar').toBeScoped(
        ':scope span.foo, :scope > span.bar'
    )

    expect('+ li:has(.foo), + li:has(.bar)').toBeScoped(
        ':scope + li:has(.foo), :scope + li:has(.bar)'
    )

    expect('+ img.foo, > img.bar').toBeScoped(
        ':scope + img.foo, :scope > img.bar'
    )
})

it('preserves multiple anchored selectors', () => {
    expect(':scope div, div').toBeScoped(
        ':scope div, :scope div'
    )

    expect('span.foo, :root span.bar').toBeScoped(
        ':scope span.foo, :root span.bar'
    )

    expect(':scope li:has(.foo), :scope li:has(.bar)').toBeScoped(
        ':scope li:has(.foo), :scope li:has(.bar)'
    )

    expect(':root img.foo, :scope img.bar').toBeScoped(
        ':root img.foo, :scope img.bar'
    )
})

it('preserves multiple anchored combinators', () => {
    expect(':scope + div, div').toBeScoped(':scope + div, :scope div')

    expect('span.foo, :root > span.bar').toBeScoped(
        ':scope span.foo, :root > span.bar'
    )

    expect(':scope + li:has(.foo), :scope + li:has(.bar)').toBeScoped(
        ':scope + li:has(.foo), :scope + li:has(.bar)'
    )

    expect(':root + img.foo, :scope > img.bar').toBeScoped(
        ':root + img.foo, :scope > img.bar'
    )
})
