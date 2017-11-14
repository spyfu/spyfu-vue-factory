import merge from 'deepmerge';
import stubRoute from './stub_route';

const Vue = require('vue/dist/vue.common.js');

let vuexIsInstalled = false;

let routerIsInstalled = false;

/**
 * Make a function that returns a component factory.
 *
 * @param  {Object}     factoryOpts
 * @return {Function}
 */
export default function (factoryOpts = {}) {
    factoryOpts.components = factoryOpts.components || {};
    // factoryOpts.modules = factoryOpts.modules || {};
    factoryOpts.routes = factoryOpts.routes || [];

    //
    // component factory
    //
    return function (options, state) {
        const baseOptions = {
            components: factoryOpts.components,
            el: document.createElement('div'),
            template: '<div>no template</div>',
        };

        // create a vuex store
        let store = undefined;

        try  {
            const Vuex = require('vuex');

            if ((factoryOpts.modules || state) && !Vuex.version) {
                throw new Error;
            } else {
                store = createStore(factoryOpts.modules || {}, state || {});

                baseOptions.store = store;
            }
        } catch (e) {
            console.warn ('Missing "vuex" dependency, no state will be injected.');
        }

        // create a vue router
        let router = undefined;

        try {
            const VueRouter = require('vue-router');

            if (factoryOpts.routes && !VueRouter.version) {
                throw new Error;
            } else {
                router = createRouter(factoryOpts.routes);

                baseOptions.router = router;
            }
        } catch (e) {
            console.warn ('Missing "vue-router" dependency, no router will be injected.');
        }

        // sync the store with the router
        if (store && router) {
            try {
                const { sync } = require('vuex-router-sync');

                if (sync) {
                    sync(store, router);
                }
            } catch (e) {
                // continue, regardless of error
            }
        }

        // finally, return the instantiated vue component
        return new Vue(Object.assign(baseOptions, options));
    };
}

// helper function to create a router instance
function createRouter(routes = []) {
    const VueRouter = require('vue-router');

    if (!routerIsInstalled) {
        Vue.use (VueRouter);
        routerIsInstalled = true;
    }

    const normalizedRoutes = routes.map(route => {
        return typeof route === 'string'
            ? stubRoute(route)
            : route;
    });

    return new VueRouter({
        abstract: true,
        routes: normalizedRoutes,
    });
}

// helper function to create a vuex store instance
function createStore(rawModules, state) {
    const Vuex = require('vuex');

    if (!vuexIsInstalled) {
        Vue.use(Vuex);
        vuexIsInstalled = true;
    }

    // create a normalized copy of our vuex modules
    const normalizedModules = normalizeModules(rawModules);

    // merge in any test specific state
    const modules = mergeTestState(normalizedModules, state);

    // return the instantiated vuex store
    return new Vuex.Store({ state, modules, strict: true });
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
        // istanbul ignore next
        throw new Error(`Could not find module "${namespace}" in store.`);
    }, store);
}

// helper function to merge state with vuex modules
function mergeTestState(modules, state) {
    Object.keys(state).forEach((key) => {
        const module = findModule(modules, key);

        if (module) {
            module.state = merge(module.state, state[key]);
        }
    });

    return modules;
}
