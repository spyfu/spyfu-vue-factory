/**
 * Stub a named route.
 *
 * @param  {string} name    the name of the route being stubbed
 * @return {Array}
 */
var stubRoute = function (name) {
    return {
        name: name,
        component: {
            render: function render(h) {
                return h('div');
            },
            functional: true
        },
        path: '/' + name.replace(/[^\w]/g, "-")
    };
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var Vue = require('vue/dist/vue.common.js');
var optionalRequire = require('optional-require');
var merge = require('deepmerge');

var vuexIsInstalled = false;
var routerIsInstalled = false;

/**
 * Make a function that returns a component factory.
 *
 * @param  {Object}     factoryOpts
 * @return {Function}
 */
var factory = function () {
    var factoryOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    factoryOpts.components = factoryOpts.components || {};
    // factoryOpts.modules = factoryOpts.modules || {};
    factoryOpts.routes = factoryOpts.routes || [];

    //
    // component factory
    //
    return function (options, state) {
        var baseOptions = {
            components: factoryOpts.components,
            el: document.createElement('div'),
            template: '<div>no template</div>'
        };

        // create a vuex store
        var store = undefined;

        try {
            var Vuex = optionalRequire('vuex') || null;

            if ((factoryOpts.modules || state) && !Vuex) {
                throw new Error();
            } else {
                store = createStore(factoryOpts.modules || {}, state || {});

                baseOptions.store = store;
            }
        } catch (e) {
            console.warn('Missing "vuex" dependency, no state will be injected.');
        }

        // create a vue router
        var router = undefined;

        try {
            var VueRouter = optionalRequire('vue-router') || null;

            if (factoryOpts.routes && !VueRouter) {
                throw new Error();
            } else {
                router = createRouter(factoryOpts.routes);

                baseOptions.router = router;
            }
        } catch (e) {
            console.warn('Missing "vue-router" dependency, no router will be injected.');
        }

        // sync the store with the router
        if (store && router) {
            try {
                var VuexRouterSync = optionalRequire('vuex-router-sync') || null;

                if (VuexRouterSync) {
                    VuexRouterSync.sync(store, router);
                }
            } catch (e) {
                // continue, regardless of error
            }
        }

        // finally, return the instantiated vue component
        return new Vue(Object.assign(baseOptions, options));
    };
};

// helper function to create a router instance
function createRouter() {
    var routes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var VueRouter = require('vue-router');

    if (typeof VueRouter.default === 'function') {
        VueRouter = VueRouter.default;
    }

    if (!routerIsInstalled) {
        Vue.use(VueRouter);
        routerIsInstalled = true;
    }

    var normalizedRoutes = routes.map(function (route) {
        return typeof route === 'string' ? stubRoute(route) : route;
    });

    return new VueRouter({
        abstract: true,
        routes: normalizedRoutes
    });
}

// helper function to create a vuex store instance
function createStore(rawModules, state) {
    var Vuex = require('vuex');

    if (typeof Vuex.default !== 'undefined') {
        Vuex = Vuex.default;
    }

    if (!vuexIsInstalled) {
        Vue.use(Vuex);
        vuexIsInstalled = true;
    }

    // create a normalized copy of our vuex modules
    var normalizedModules = normalizeModules(rawModules);

    // merge in any test specific state
    var modules = mergeTestState(normalizedModules, state);

    // return the instantiated vuex store
    return new Vuex.Store({ state: state, modules: modules, strict: true });
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
        // istanbul ignore next
        throw new Error('Could not find module "' + namespace + '" in store.');
    }, store);
}

// helper function to merge state with vuex modules
function mergeTestState(modules, state) {
    Object.keys(state).forEach(function (key) {
        var module = findModule(modules, key);

        if (module) {
            module.state = merge(module.state, state[key]);
        }
    });

    return modules;
}

export { factory, stubRoute };
//# sourceMappingURL=spyfu-vue-factory.esm.js.map
