import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import istanbul from 'rollup-plugin-istanbul';
import resolve from 'rollup-plugin-node-resolve';
// import vue from 'rollup-plugin-vue';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);
let isProduction = process.env.NODE_ENV === 'production';

let output = [];

let plugins = [
    babel(babelrc()),
    resolve({
        browser: true,
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
