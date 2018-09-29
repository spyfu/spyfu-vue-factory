import Vue, { Component } from 'vue';

declare module 'spyfu-vue-factory' {
    export interface FactoryOptions {
        Vue?: Vue,
        components?: any,
        routes?: any[],
        stubTransitions?: boolean,
        sync?: any,
    }

    export function MountFunction (options?: Component, state?: object): Vue;
    
    export function factory(options?: FactoryOptions): MountFunction;
}
