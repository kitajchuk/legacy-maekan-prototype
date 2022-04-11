/*!
 *
 * App Controller: drawer
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import { hammerDefaults } from "app/config";


var _drawer = null,
    _header = null,
    _label = null,
    _wrap = null,

    Hammered = require( "Hammered" ),
    hammered = null,


/**
 *
 * @public
 *
 */
drawer = {
    init: function () {
        _drawer = dom.doc[ 0 ].createElement( "div" );
        _drawer.className = "drawer-content";

        _wrap = dom.doc[ 0 ].createElement( "div" );
        _wrap.className = "drawer-content__wrap";

        _drawer.appendChild( _wrap );

        _header = dom.doc[ 0 ].createElement( "div" );
        _header.className = "drawer-header js-drawer-header";
        _header.innerHTML = '<button class="drawer-header__button button"><span class="icon icon--arrow-left"></span></button>';

        _label = dom.doc[ 0 ].createElement( "div" );
        _label.className = "drawer-header__label title";

        _header.appendChild( _label );

        hammered = new Hammered( _header, hammerDefaults );
        hammered.on( "tap", ".js-drawer-header", this.close );

        console.log( "drawer initialized" );
    },


    attach: function () {
        dom.body[ 0 ].appendChild( _header );
        dom.body[ 0 ].appendChild( _drawer );
    },


    detach: function () {
        dom.body[ 0 ].removeChild( _header );
        dom.body[ 0 ].removeChild( _drawer );
    },


    append: function ( el ) {
        _wrap.appendChild( el );
    },


    empty: function () {
        _wrap.innerHTML = "";
        _label.innerHTML = "";
    },


    label: function ( txt ) {
        _label.innerHTML = txt;
    },


    open: function () {
        dom.html.addClass( "is-drawer-open" );
    },


    close: function () {
        dom.html.removeClass( "is-drawer-open" );
    },


    teardown: function () {
        this.detach();
        this.close();
        this.empty();
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default drawer;