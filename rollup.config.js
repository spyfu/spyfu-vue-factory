import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import commonjs from 'rollup-plugin-commonjs';
import istanbul from 'rollup-plugin-istanbul';
import nodeResolve from 'rollup-plugin-node-resolve';
import resolve from 'rollup-plugin-node-resolve';

let pkg = require('./package.json');
let isProduction = process.env.NODE_ENV === 'production';

let output = [];

let plugins = [
    babel(babelrc()),

    nodeResolve({
        browser: true,
        jsnext: true,
        main: true
    }),

    commonjs({
        include: ['node_modules/**']
    }),
];

//
// production config
//
if (isProduction) {
    output.push(
        {
            file: pkg.main,
            format: 'umd',
            name: 'spyfuVueFactory',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        }
    )
}

//
// non-production config
//
else {
    plugins.push(istanbul({
        exclude: [
            'test/**/*',
            'node_modules/**/*',
        ] ,
    }));
}

export default {
    external: ['vue', 'vue-router', 'vuex', 'vuex-router-sync'],
    input: 'lib/index.js',
    output: output,
    plugins: plugins,
};
