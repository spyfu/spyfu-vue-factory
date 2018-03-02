var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value) && !isSpecial(value);
};

function isNonNullObject(value) {
	return !!value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE;
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
	var clone = !optionsArgument || optionsArgument.clone !== false;

	return clone && isMergeableObject(value) ? deepmerge(emptyTarget(value), value, optionsArgument) : value;
}

function defaultArrayMerge(target, source, optionsArgument) {
	return target.concat(source).map(function (element) {
		return cloneUnlessOtherwiseSpecified(element, optionsArgument);
	});
}

function mergeObject(target, source, optionsArgument) {
	var destination = {};
	if (isMergeableObject(target)) {
		Object.keys(target).forEach(function (key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument);
		});
	}
	Object.keys(source).forEach(function (key) {
		if (!isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument);
		} else {
			destination[key] = deepmerge(target[key], source[key], optionsArgument);
		}
	});
	return destination;
}

function deepmerge(target, source, optionsArgument) {
	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var options = optionsArgument || { arrayMerge: defaultArrayMerge };
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, optionsArgument);
	} else if (sourceIsArray) {
		var arrayMerge = options.arrayMerge || defaultArrayMerge;
		return arrayMerge(target, source, optionsArgument);
	} else {
		return mergeObject(target, source, optionsArgument);
	}
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array');
	}

	return array.reduce(function (prev, next) {
		return deepmerge(prev, next, optionsArgument);
	}, {});
};

var deepmerge_1 = deepmerge;

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

// unfortunately, we can't use the version of this that is
// included with vue-test-utils, because they do not use
// the compiler-included version of Vue as their base.
// https://github.com/vuejs/vue-test-utils/blob/dev/src/create-local-vue.js
var cloneDeep = require('lodash.clonedeep');
// import errorHandler from './lib/error-handler'

var cloneConstructor = function (factoryOpts) {
    var Vue = factoryOpts && factoryOpts.Vue ? factoryOpts.Vue : require('vue/dist/vue.common.js');

    var instance = Vue.extend();

    // clone global APIs
    Object.keys(Vue).forEach(function (key) {
        if (!instance.hasOwnProperty(key)) {
            var original = Vue[key];
            instance[key] = (typeof original === 'undefined' ? 'undefined' : _typeof(original)) === 'object' ? cloneDeep(original) : original;
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

    var use = instance.use;

    instance.use = function (plugin) {
        for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            rest[_key - 1] = arguments[_key];
        }

        if (plugin.installed === true) {
            plugin.installed = false;
        }

        if (plugin.install && plugin.install.installed === true) {
            plugin.install.installed = false;
        }

        use.call.apply(use, [instance, plugin].concat(rest));
    };

    return instance;
};

/**
 * Make a function that returns a component factory.
 *
 * @param  {Object}     factoryOpts
 * @return {Function}
 */
var factory = function () {
    var factoryOpts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    factoryOpts.components = factoryOpts.components || {};
    factoryOpts.routes = factoryOpts.routes || [];

    //
    // component factory
    //
    return function (options, state) {
        var ClonedVue = cloneConstructor(factoryOpts);

        var baseOptions = {
            components: factoryOpts.components,
            el: document.createElement('div'),
            template: '<div>no template</div>'
        };

        // create a vuex store
        var Vuex = null;
        var store = undefined;

        try {
            Vuex = require('vuex');
        } catch (e) {}

        if ((factoryOpts.modules || state) && !Vuex) {
            console.warn('Missing "vuex" dependency, no state will be injected.');
        } else {
            store = createStore(ClonedVue, factoryOpts.modules || {}, state || {});

            baseOptions.store = store;
        }

        // create a vue router
        var VueRouter = null;
        var router = undefined;

        try {
            VueRouter = require('vue-router');
        } catch (e) {}

        if (factoryOpts.routes && !VueRouter) {
            console.warn('Missing "vue-router" dependency, no router will be injected.');
        } else {
            router = createRouter(ClonedVue, factoryOpts.routes);

            baseOptions.router = router;
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

        // stub transition components
        if (factoryOpts.stubTransitions) {
            ClonedVue.component('transition', {
                render: function render() {
                    return this.$slots.default[0];
                },

                abstract: true
            });
        }

        // finally, return the instantiated vue component
        return new ClonedVue(Object.assign(baseOptions, options));
    };
};

// helper function to create a router instance
function createRouter(ClonedVue) {
    var routes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var VueRouter = require('vue-router');

    if (typeof VueRouter.default === 'function') {
        VueRouter = VueRouter.default;
    }

    ClonedVue.use(VueRouter);

    var normalizedRoutes = routes.map(function (route) {
        return typeof route === 'string' ? stubRoute(route) : route;
    });

    return new VueRouter({
        abstract: true,
        routes: normalizedRoutes
    });
}

// helper function to create a vuex store instance
function createStore(ClonedVue, rawModules, state) {
    var Vuex = require('vuex');

    if (typeof Vuex.default !== 'undefined') {
        Vuex = Vuex.default;
    }

    ClonedVue.use(Vuex);

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
            module.state = deepmerge_1(module.state, state[key]);
        }
    });

    return modules;
}

export { factory, stubRoute };
//# sourceMappingURL=spyfu-vue-factory.esm.js.map
