// unfortunately, we can't use the version of this that is
// included with vue-test-utils, because they do not use
// the compiler-included version of Vue as their base.
// https://github.com/vuejs/vue-test-utils/blob/dev/src/create-local-vue.js
const cloneDeep = require('lodash.clonedeep');
// import errorHandler from './lib/error-handler'

export default function(factoryOpts) {
    const Vue = factoryOpts && factoryOpts.Vue
        ? factoryOpts.Vue
        : require('vue/dist/vue.common.js');
        
    const instance = Vue.extend();

    // clone global APIs
    Object.keys(Vue).forEach(key => {
        if (!instance.hasOwnProperty(key)) {
            const original = Vue[key]
            instance[key] = typeof original === 'object'
                ? cloneDeep(original)
                : original
        }
    });

    // config is not enumerable
    instance.config = cloneDeep(Vue.config);

    // instance.config.errorHandler = errorHandler

    // option merge strategies need to be exposed by reference
    // so that merge strats registered by plguins can work properly
    instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies;

    // make sure all extends are based on this instance.
    // this is important so that global components registered by plugins,
    // e.g. router-link are created using the correct base constructor
    instance.options._base = instance;

    // compat for vue-router < 2.7.1 where it does not allow multiple installs
    if (instance._installedPlugins && instance._installedPlugins.length) {
        instance._installedPlugins.length = 0;
    }

    const use = instance.use;

    instance.use = (plugin, ...rest) => {
        if (plugin.installed === true) {
            plugin.installed = false;
        }

        if (plugin.install && plugin.install.installed === true) {
            plugin.install.installed = false;
        }

        use.call(instance, plugin, ...rest);
    }

    return instance;
}