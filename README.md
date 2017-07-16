# spyfu-vue-factory

[![Build status](https://img.shields.io/circleci/project/github/spyfu/spyfu-vue-factory.svg)](https://circleci.com/gh/spyfu/spyfu-vue-factory)
[![Coverage](https://img.shields.io/codecov/c/token/ZnYz3FuhI5/github/spyfu/spyfu-vue-factory.svg)](https://codecov.io/gh/spyfu/spyfu-vue-factory)
[![Dev dependencies](https://img.shields.io/david/dev/spyfu/spyfu-vue-factory.svg)](#)
[![npm](https://img.shields.io/npm/v/spyfu-vue-factory.svg)](https://www.npmjs.com/package/spyfu-vue-factory)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/spyfu/spyfu-vue-factory/blob/master/LICENSE)

<a name="installation"></a>
### Installation

This utility creates factory functions for Vue components. To get started, install through NPM your Yarn.

```bash
# install through npm
$ npm install spyfu-vuex-helpers

# or with yarn
$ yarn add spyfu-vuex-helpers
```

<a name="basic-usage"></a>
### Basic usage

To create a component factory, pass any child components, routes, and vuex modules to the `factory` function. All three of these properties are optional.

```js
import factory from 'spyfu-vue-factory';

const mount = factory({
    components: {
        'child-component': childComponent,
    },
    modules: {
        exampleVuexModule,
    },
    routes: [
        exampleRoute,
    ],
});
```

Once you've made your factory, you may use it to instantiate Vue components.

```js
const vm = mount({
    template: `<div>Hello from a test component</div>`,
});
```

Initial Vuex state may be supplied as the second argument. This state will be merged with the default Vuex state.

```js
const vm = mount({
    template: `<div>Hello from a test component</div>`,
}, {
    'moduleNamespace': {
        stateKey: 'new value',
    },
});
```
