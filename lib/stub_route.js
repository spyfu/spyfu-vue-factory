/**
 * Stub a named route.
 *
 * @param  {string} name    the name of the route being stubbed
 * @return {Array}
 */
export default function (name) {
    return {
        name,
        component: {
            render: h => h('div'),
            functional: true,
        },
        path: '/' + name.replace(/[^\w]/g, "-"),
    };
}
