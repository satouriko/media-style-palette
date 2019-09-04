import pkg from './package.json'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  external: [
    '@csstools/convert-colors',
    'node-vibrant'
  ],
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      banner: `/*!
 * ${pkg.name} - ${pkg.description}
 * --------
 * @version ${pkg.version}
 * @homepage: ${pkg.homepage}
 * @license ${pkg.license}
 * @author ${pkg.author}
 *
 */`
    }
  ],
  plugins: [
    babel({
      runtimeHelpers: true,
      plugins: [
        '@babel/plugin-transform-async-to-generator',
        '@babel/plugin-transform-regenerator',
        ['@babel/plugin-transform-runtime', {
          'helpers': true,
          'regenerator': true
        }]
      ],
      presets: [
        '@babel/preset-env'
      ],
      exclude: 'node_modules/**'
    }),
    nodeResolve({
      mainFields: ['jsnext:main']
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}
