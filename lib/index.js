import { sync } from 'vuex-router-sync';
import Vue from 'vue/dist/vue.common.js';
import VueRouter from 'vue-router';
import Vuex from 'vuex';

Vue.use(Vuex);
Vue.use(VueRouter);

/**
 * Make a function that returns a component factory.
 *
 * @param  {Object}     factoryOpts
 * @return {Function}
 */
export default function (factoryOpts = {}) {
    factoryOpts.components = factoryOpts.components || {};
    factoryOpts.modules = factoryOpts.modules || {};
    factoryOpts.routes = factoryOpts.routes || [];

    //
    // component factory
    //
    return function (options, state = {}) {
        // create a synced router and store for our component
        const router = createRouter(factoryOpts.routes);
        const store = createStore(factoryOpts.modules, state);
        sync(store, router);

        // set up our vm with an in-memory dom element
        const vm = Object.assign({
            components: factoryOpts.components,
            el: document.createElement('div'),
            template: '<div>no template</div>',
            router,
            store,
        }, options);

        // finally, return the instantiated vue component
        return new Vue(vm);
    };
}

// helper function to create a router instance
function createRouter(routes = []) {
    return new VueRouter({ abstract: true, routes });
}

// helper function to create a vuex store instance
function createStore(rawModules, state) {
    // create a normalized copy of our vuex modules
    const normalizedModules = normalizeModules(rawModules);

    // merge in any test specific state
    const modules = mergeTestState(normalizedModules, state);

    // return the instantiated vuex store
    return new Vuex.Store({ modules, strict: true });
}

// helper function to evaluate the state functions of vuex modules
function normalizeModules(modules) {
    const normalized = {};

    Object.keys(modules).forEach((key) => {
        const module = modules[key];

        // make sure each vuex module has all keys defined
        normalized[key] = {
            actions: module.actions || {},
            getters: module.getters || {},
            modules: module.modules ? normalizeModules(module.modules) : {},
            mutations: module.mutations || {},
            namespaced: module.namespaced || false,
            state: {},
        };

        // make sure our state is a fresh object
        if (typeof module.state === 'function') {
            normalized[key].state = module.state();
        } else if (typeof module.state === 'object') {
            normalized[key].state = JSON.parse(JSON.stringify(module.state));
        }
    });

    return normalized;
}

// helper to find vuex modules via their namespace
function findModule(store, namespace) {
    return namespace.split('/').reduce((obj, key) => {
        // root modules will exist directly on the store
        if (obj && obj[key]) {
            return obj[key];
        }

        // child stores will exist in a modules object
        if (obj && obj.modules && obj.modules[key]) {
            return obj.modules[key];
        }

        // if we couldn't find the module, throw an error
        throw new Error(`Could not find module "${namespace}" in store.`);
    }, store);
}

// helper function to merge state with vuex modules
function mergeTestState(modules, state) {
    Object.keys(state).forEach((key) => {
        const module = findModule(modules, key);

        if (module) {
            module.state = Object.assign({}, module.state, state[key]);
        }
    });

    return modules;
}
