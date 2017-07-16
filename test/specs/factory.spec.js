import { expect } from 'chai';
import factory from '../../lib';

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
            state: { one: 1 },
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

    it('throws an error when the vuex module was not found', () => {
        const badRender = () => render({}, { 'badModule': { foo: 'bar' }});

        expect(badRender).to.throw;
    });
});
