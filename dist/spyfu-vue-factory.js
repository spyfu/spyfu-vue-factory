(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vuex-router-sync'), require('vue/dist/vue.common.js'), require('vue-router'), require('vuex')) :
	typeof define === 'function' && define.amd ? define(['vuex-router-sync', 'vue/dist/vue.common.js', 'vue-router', 'vuex'], factory) :
	(global.spyfuVueFactory = factory(global.vuexRouterSync,global.Vue,global.VueRouter,global.Vuex));
}(this, (function (vuexRouterSync,Vue,VueRouter,Vuex) { 'use strict';

Vue = Vue && 'default' in Vue ? Vue['default'] : Vue;
VueRouter = VueRouter && 'default' in VueRouter ? VueRouter['default'] : VueRouter;
Vuex = Vuex && 'default' in Vuex ? Vuex['default'] : Vuex;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

Vue.use(Vuex);
Vue.use(VueRouter);

/**
 * Make a function that returns a component factory.
 *
 * @param  {Object}     factoryOpts
 * @return {Function}
 */
var index = function () {
    var factoryOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    factoryOpts.components = factoryOpts.components || {};
    factoryOpts.modules = factoryOpts.modules || {};
    factoryOpts.routes = factoryOpts.routes || [];

    //
    // component factory
    //
    return function (options) {
        var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // create a synced router and store for our component
        var router = createRouter(factoryOpts.routes);
        var store = createStore(factoryOpts.modules, state);
        vuexRouterSync.sync(store, router);

        // set up our vm with an in-memory dom element
        var vm = Object.assign({
            components: factoryOpts.components,
            el: document.createElement('div'),
            template: '<div>no template</div>',
            router: router,
            store: store
        }, options);

        // finally, return the instantiated vue component
        return new Vue(vm);
    };
};

// helper function to create a router instance
function createRouter() {
    var routes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    return new VueRouter({ abstract: true, routes: routes });
}

// helper function to create a vuex store instance
function createStore(rawModules, state) {
    // create a normalized copy of our vuex modules
    var normalizedModules = normalizeModules(rawModules);

    // merge in any test specific state
    var modules = mergeTestState(normalizedModules, state);

    // return the instantiated vuex store
    return new Vuex.Store({ modules: modules, strict: true });
}

// helper function to evaluate the state functions of vuex modules
function normalizeModules(modules) {
    var normalized = {};

    Object.keys(modules).forEach(function (key) {
        var module = modules[key];

        // make sure each vuex module has all keys defined
        normalized[key] = {
            actions: module.actions || {},
            getters: module.getters || {},
            modules: module.modules ? normalizeModules(module.modules) : {},
            mutations: module.mutations || {},
            namespaced: module.namespaced || false,
            state: {}
        };

        // make sure our state is a fresh object
        if (typeof module.state === 'function') {
            normalized[key].state = module.state();
        } else if (_typeof(module.state) === 'object') {
            normalized[key].state = JSON.parse(JSON.stringify(module.state));
        }
    });

    return normalized;
}

// helper to find vuex modules via their namespace
function findModule(store, namespace) {
    return namespace.split('/').reduce(function (obj, key) {
        // root modules will exist directly on the store
        if (obj && obj[key]) {
            return obj[key];
        }

        // child stores will exist in a modules object
        if (obj && obj.modules && obj.modules[key]) {
            return obj.modules[key];
        }

        // if we couldn't find the module, throw an error
        throw new Error('Could not find module "' + namespace + '" in store.');
    }, store);
}

// helper function to merge state with vuex modules
function mergeTestState(modules, state) {
    Object.keys(state).forEach(function (key) {
        var module = findModule(modules, key);

        if (module) {
            module.state = Object.assign({}, module.state, state[key]);
        }
    });

    return modules;
}

return index;

})));
//# sourceMappingURL=spyfu-vue-factory.js.map
