import { expect } from 'chai';
import factory from '../../lib';
import Vuex from 'vuex';
import sinon from 'sinon';

// console.log (Vuex);

describe('optional dependencies', () => {
    let cachedVuexVersion = Vuex.version;
    let warn;

    beforeEach(() => {
        warn = sinon.stub(console, 'warn');
    });

    afterEach(() => {
        Vuex.version = cachedVuexVersion;
        warn.restore();
    });

    it('treats vuex as an optional dependency', () => {
        Vuex.version = undefined;

        const render = factory();
        const vm = render({}, { /* state */ });

        expect(warn.called).to.be.true;
        expect(vm.$store).to.be.undefined;
    });
})
