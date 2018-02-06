import { expect } from 'chai';
import { factory } from '../../lib';
import sinon from 'sinon';
import mock from 'mock-require';

describe('optional dependencies', () => {
    let warn;

    beforeEach(() => {
        warn = sinon.stub(console, 'warn');
    });

    afterEach(() => {
        mock.stop('vuex');
        mock.stop('vue-router');
        mock.stop('vuex-router-sync');
        warn.restore();
    });

    it('vuex', () => {
        mock('vuex', undefined);

        const render = factory();
        const vm = render({}, { /* state */ });

        expect(warn.called).to.be.true;
        expect(vm.$store).to.be.undefined;
    });

    it('vue-router', () => {
        mock('vue-router', undefined);

        const render = factory({ routes: [] });
        const vm = render({});

        expect(warn.called).to.be.true;
        expect(vm.$router).to.be.undefined;
    });

    it('vuex-router-sync', () => {
        mock('vuex-router-sync', undefined);

        const render = factory({ modules: {}, routes: [] });
        const vm = render({});

        expect(vm.$store.state.route).to.be.undefined;
    });
});
