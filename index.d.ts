import { ComponentOptions } from 'vue';

declare module 'spyfu-vue-factory' {
    export function factory(options: ComponentOptions, state: object | undefined): any;
}
