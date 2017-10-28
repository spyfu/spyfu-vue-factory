import { expect } from 'chai';
import factory from '../../lib';
import VueRouter from 'vue-router'
import Vuex from 'vuex';
import sinon from 'sinon';

// console.log (Vuex);

describe('optional dependencies', () => {
    let cachedVuexVersion = Vuex.version;
    let cachedVueRouterVersion = VueRouter.version;
    let warn;

    beforeEach(() => {
        warn = sinon.stub(console, 'warn');
    });

    afterEach(() => {
        Vuex.version = cachedVuexVersion;
        VueRouter.version = cachedVueRouterVersion;
        warn.restore();
    });

    it('vuex', () => {
        Vuex.version = undefined;

        const render = factory();
        const vm = render({}, { /* state */ });

        expect(warn.called).to.be.true;
        expect(vm.$store).to.be.undefined;
    });

    it('vue-router', () => {
        VueRouter.version = undefined;

        const render = factory({ routes: [] });
        const vm = render({});
        
        expect(warn.called).to.be.true;
        expect(vm.$router).to.be.undefined;
    });
});
