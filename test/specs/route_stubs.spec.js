import { expect } from 'chai';
import { factory, stubRoute } from '../../lib';
import sinon from 'sinon';

//
// fixture
//
const fooComponent = {
    render: h => h('div', [
        h('router-link', {
            props: {
                to: {
                    name: 'some:named:route',
                },
            },
        }),
    ]),
};

//
// factory
//
const render = factory({
    components: {
        'v-foo': fooComponent,
    },
    routes: [
        stubRoute('foo'),
        'some:named:route',
    ],
})

//
// tests
//
describe('stubbed routes', () => {
    it('converts strings to stubbed routes', (done) => {
        const vm = render({
            data: () => ({ render: false }),
            template: `<v-foo v-if="render" />`,
        });

        const warn = sinon.stub(console, 'warn');

        vm.render = true;
        vm.$nextTick(() => {
            // if some:named:route wasn't found, vue will log a warning
            expect(warn.called).to.be.false;
            warn.restore();

            done();
        });
    });

    it('returns a route object with a render function', () => {
        const route = stubRoute('foo:bar');
        const h = sinon.spy();

        expect(route.name).to.equal('foo:bar');
        expect(route.path).to.equal('/foo-bar');
        expect(route.component.functional).to.be.true;

        route.component.render(h);

        expect(h.called).to.be.true;
        expect(h.lastCall.args[0]).to.equal('div');
    });
});
