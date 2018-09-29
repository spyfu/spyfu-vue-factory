import { Component } from 'vue';

declare module 'spyfu-vue-factory' {
    export function factory(options?: Component, state?: object): any;
}
