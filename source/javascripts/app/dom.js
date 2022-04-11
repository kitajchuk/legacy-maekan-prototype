/*!
 *
 * App Module: /dom
 *
 * @namespace dom
 * @memberof app
 *
 *
 */
var dom = {
    doc: $( document ),
    html: $( document.documentElement ),
    body: $( document.body ),
    page: $( ".js-page" ),
    refine: $( ".js-refine" ),
    refBtn: $( ".js-controller--refine" ),
    navbar: $( ".js-navbar" ),
    navBtn: $( ".js-controller--navbar" ),
    navItems: $( ".js-navbar-item" ),
    overlay: $( ".js-overlay" )
};


export default dom;