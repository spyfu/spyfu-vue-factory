import { expect } from 'chai';
import { factory } from '../../lib';
import { sync } from 'vuex-router-sync';

//
// factory
//
const render = factory({
    components: {
        'v-foo': {
            template: `<div>foo</div>`,
        },
    },
    modules: {
        foo: {
            namespaced: true,
            state: {
                one: 1,
                deeply: {
                    nested: {
                        state: {
                            foo: 'foo',
                            bar: 'bar',
                        },
                    },
                },
            },
        },
        bar: {
            namespaced: true,
            modules: {
                baz: {
                    namespaced: true,
                    state: () => ({ three: 3 }),
                },
            },
            state: () => ({ two: 2 }),
        },
    },
    stubTransitions: true,
    sync,
});

//
// tests
//
describe('factory', () => {
    it('can be used to instantiate vue components', () => {
        const vm = render({ template: `<div>Hello from a Vue component</div>` });

        expect(vm.$el.textContent).to.equal('Hello from a Vue component');
    });

    it('registers custom components', () => {
        const vm = render({ template: `<v-foo />` });

        expect(vm.$el.textContent).to.equal('foo');
    });

    it('injects a router into the component', () => {
        const vm = render();

        expect(typeof vm.$router).to.equal('object');
    });

    it('injects a vuex store into the component', () => {
        const vm = render();

        expect(vm.$store.state.foo.one).to.equal(1);
        expect(vm.$store.state.bar.two).to.equal(2);
    });

    it('accepts custom vuex state as the second argument', () => {
        const vm = render({}, {
            foo: { one: 'updated one' },
            bar: { two: 'updated two' },
        });

        expect(vm.$store.state.foo.one).to.equal('updated one');
        expect(vm.$store.state.bar.two).to.equal('updated two');
    });

    it('can overwrite the state of nested modules', () => {
        const vm = render({}, {
            'bar/baz': { three: 'updated three' },
        });

        expect(vm.$store.state.bar.baz.three).to.equal('updated three');
    });

    it('can overwrite a nested piece of state', () => {
        const vm = render({}, {
            foo: {
                deeply: {
                    nested: {
                        state: {
                            foo: 'whatever',
                        },
                    },
                },
            },
        });

        expect(vm.$store.state.foo.deeply.nested.state.foo).to.equal('whatever');
        expect(vm.$store.state.foo.deeply.nested.state.bar).to.equal('bar');
    });

    it('throws an error when the vuex module was not found', () => {
        const badRender = () => render({}, { 'badModule': { foo: 'bar' }});

        expect(badRender).to.throw;
    });

    it('replaces transitions with a synchronous stub by default', function(done) {
        const vm = render({
            data: () => ({ foo: true }),
            template: `
                <transition duration="1000" name="foo">
                    <div v-if="foo" key="hello">Foo</div>
                    <div v-else key="bar">Bar</div>
                </transition>
            `,
        });

        expect(vm.$el.outerHTML).to.equal('<div>Foo</div>');

        vm.foo = false;

        // our transition has a duration of 1000ms, but since it's
        // stubbed in our factory we should be able to use $nextTick
        vm.$nextTick(() => {
            expect(vm.$el.outerHTML).to.equal('<div>Bar</div>');
            done();
        });
    });

    it('accepts a customized constructor', () => {
        const cloneVue = require('../../lib/clone_constructor').default;
        const CustomVue = cloneVue();

        CustomVue.component('whatever', {
            template: `<div>hello from whatever</div>`,
        });

        const customVue = factory({
            Vue: CustomVue,
        });

        const vm = customVue({
            template: `<whatever />`
        });

        expect(vm.$el.textContent).to.equal('hello from whatever');
    })

    it('uses abstract mode for vue router', function () {
        const vm = render();

        expect(vm.$router.mode).to.equal('abstract');
    });

    it('it applies vuex-router-sync', () => {
        const vm = render();
        
        expect(typeof vm.$store.state.route).to.equal('object');
    });
});
