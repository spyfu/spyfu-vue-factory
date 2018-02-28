# spyfu-vue-factory

[![Build status](https://img.shields.io/circleci/project/github/spyfu/spyfu-vue-factory.svg)](https://circleci.com/gh/spyfu/spyfu-vue-factory)
[![Coverage](https://img.shields.io/codecov/c/token/ZnYz3FuhI5/github/spyfu/spyfu-vue-factory.svg)](https://codecov.io/gh/spyfu/spyfu-vue-factory)
[![Dev dependencies](https://img.shields.io/david/dev/spyfu/spyfu-vue-factory.svg)](https://david-dm.org/spyfu/spyfu-vue-factory?type=dev)
[![npm](https://img.shields.io/npm/v/spyfu-vue-factory.svg)](https://www.npmjs.com/package/spyfu-vue-factory)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/spyfu/spyfu-vue-factory/blob/master/LICENSE)

<a name="installation"></a>
### Installation

This utility creates factory functions for Vue components. To get started, install through NPM or Yarn.

```bash
# install through npm
$ npm install spyfu-vue-factory

# or with yarn
$ yarn add spyfu-vue-factory
```

<a name="basic-usage"></a>
### Basic usage

To create a component factory, pass any child components, routes, and vuex modules to the `factory` function. All three of these properties are optional.

```js
import { factory } from 'spyfu-vue-factory';

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

Initial Vuex state may be supplied as the second argument. This state will be deeply merged with the default Vuex state.

```js
const vm = mount({
    template: `<div>Hello from a test component</div>`,
}, {
    moduleNamespace: {
        key: 'new value',
    },
});
```

### Stubbing named routes

Occasionally in tests that interact with `vue-router`, you'll see the following error.

```bash
[vue-router] Route with name 'whatever' does not exist
```

This is usually caused by trying to render a `<router-link>` component using a named route that your test factory does not know about. To remedy this, simply pass in the route name to the `routes` array.

```js
const mount = factory({
    routes: [
        'whatever',
    ],
});
```

### Stubbing transitions

To replace Vue's `<transition>` component with a synchronous stub, set the `stubTransitions` option to `true`.

```js
const mount = factory({
    stubTransitions: true,
});
```

### License

[MIT](https://github.com/spyfu/spyfu-vue-factory/blob/master/LICENSE)

Copyright (c) 2017-present, [SpyFu](https://spyfu.com)
