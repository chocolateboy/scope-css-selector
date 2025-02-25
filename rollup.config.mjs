import { nodeResolve } from '@rollup/plugin-node-resolve'
import autoExternal    from 'rollup-plugin-auto-external'
import { dts }         from 'rollup-plugin-dts'
import esbuild         from 'rollup-plugin-esbuild'
import size            from 'rollup-plugin-filesize'
import { terser }      from 'rollup-plugin-terser'
import pkg             from './package.json' with { type: 'json' }

const ENTRY = './src/index.ts'
const NAME = 'ScopeCssSelector'
const PRESERVE_NAMES = ['scope', 'scoper']

const isDev = process.env.NODE_ENV !== 'production'
const external = isDev ? ['source-map-support/register'] : []
const banner = `/* ${pkg.name} ${pkg.version}. @copyright 2025 ${pkg.author}. @license ${pkg.license} */`

const $dts = dts()
const $external = autoExternal()
const $size = size({ showMinifiedSize: false })
const $esbuild = esbuild()
const $nodeResolve = nodeResolve()

const $terser = terser({
    ecma: 2015,
    compress: {
        passes: 2,
    },
    mangle: {
        reserved: PRESERVE_NAMES,
    }
})

const cjs = {
    input: ENTRY,
    plugins: [$esbuild, $external],
    external,
    output: {
        dir: 'dist/cjs',
        entryFileNames: '[name].cjs',
        format: 'cjs',
        preserveModules: true,
        sourcemap: isDev,
        banner,
    },
}

const esm = {
    input: ENTRY,
    plugins: [$esbuild, $external],
    output: {
        dir: 'dist/esm',
        entryFileNames: '[name].mjs',
        format: 'esm',
        preserveModules: true,
        banner,
    }
}

const bundle = {
    input: ENTRY,
    plugins: [$esbuild, $nodeResolve],
    output: [
        {
            dir: 'dist/umd',
            entryFileNames: '[name].umd.js',
            format: 'umd',
            name: NAME,
            banner,
        },
        {
            dir: 'dist/umd',
            entryFileNames: '[name].umd.min.js',
            format: 'umd',
            name: NAME,
            plugins: [$terser, $size],
            sourcemap: true,
            banner,
        },
    ]
}

const dtsBundle = {
    input: './types/index.d.ts',
    output: [
        {
            file: './dist/index.d.ts',
            format: 'esm'
        }
    ],
    plugins: [$dts],
}

const config = isDev ? cjs : [cjs, esm, bundle, dtsBundle]

export default config
