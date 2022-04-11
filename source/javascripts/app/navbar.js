/*!
 *
 * App Controller: navbar
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import { hammerDefaults } from "app/config";
import { loadImages, toggleMouseWheel, toggleTouchMove, emitter } from "app/util";


var _isNavbarOpen = false,

    Hammered = require( "Hammered" ),
    hammereds = {},


/**
 *
 * @public
 *
 */
navbar = {
    init: function () {
        hammereds.navbar = new Hammered( dom.navbar[ 0 ], hammerDefaults );
        hammereds.navbar.on( "tap", ".js-navbar-item", onNavbarItem );

        hammereds.overlay = new Hammered( dom.overlay[ 0 ], hammerDefaults );
        hammereds.overlay.on( "tap", ".js-overlay", onCloseNavbar );

        hammereds.navBtn = new Hammered( dom.navBtn[ 0 ], hammerDefaults );
        hammereds.navBtn.on( "tap", ".js-controller--navbar", onToggleNavbar );

        // Profile pic
        loadImages( dom.navbar.find( ".js-lazy-image" ) );

        changeTopic( dom.navBtn.filter( ".is-active" ) );

        console.log( "navbar initialized" );
    },


    close: function () {
        onCloseNavbar();
    },


    clearActive: function () {
        dom.navItems.removeClass( "is-active" );
    }
},


/**
 *
 * @private
 *
 */
changeTopic = function ( $elem ) {
    var topic = $elem.data( "topic" );

    if ( topic ) {
        emitter.fire( "app--refine-topic", topic );
    }
},


/**
 *
 * @private
 *
 */
onNavbarItem = function () {
    var $this = $( this );

    dom.navItems.removeClass( "is-active" );
    $this.addClass( "is-active" );

    changeTopic( $this );
},


/**
 *
 * @private
 *
 */
onCloseNavbar = function () {
    _isNavbarOpen = false;

    dom.html.removeClass( "is-navbar-open" );

    toggleTouchMove( true );
    toggleMouseWheel( true );
},


/**
 *
 * @private
 *
 */
onToggleNavbar = function () {
    if ( _isNavbarOpen ) {
        onCloseNavbar();

    } else {
        _isNavbarOpen = true;

        toggleTouchMove( false );
        toggleMouseWheel( false );

        dom.html.addClass( "is-navbar-open" );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default navbar;