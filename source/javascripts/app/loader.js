/*!
 *
 * App Controller: loader
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import { navbarSize, midiDuration, hammerDefaults } from "app/config";
import { px, translate3d, scroller, emitter } from "app/util";


var $_jsLoader = dom.body.find( ".js-controller--load" ),

    _isActive = false,

    Hammered = require( "Hammered" ),
    hammered = null,


/**
 *
 * @public
 *
 */
loader = {
    init: function () {
        emitter.on( "app--scroll", onScroller );

        hammered = new Hammered( $_jsLoader[ 0 ], hammerDefaults );
        hammered.on( "tap", ".js-controller--load", onLoadMore );

        console.log( "loader initialized" );
    },


    reset: function () {
        _isActive = false;

        $_jsLoader.removeClass( "is-inactive" );

        clearTransforms();
    },


    activate: function ( bool ) {
        _isActive = bool;

        if ( !bool ) {
            clearTransforms();
        }
    },


    deactivate: function () {
        $_jsLoader.addClass( "is-inactive" );

        setTimeout(function () {
            clearTransforms();

            $_jsLoader.removeClass( "is-inactive" );

        }, midiDuration );
    }
},


/**
 *
 * @private
 *
 */
clearTransforms = function () {
    $_jsLoader.attr( "style", "" );
    dom.refBtn.attr( "style", "" );
},


/**
 *
 * @private
 *
 */
onLoadMore = function () {
    emitter.fire( "app--load-more" );

    loader.deactivate();
},


/**
 *
 * @private
 *
 */
onScroller = function ( scrollPos ) {
    var scrollMax = scroller.getScrollMax();

    if ( !_isActive || scrollPos > scrollMax ) {
        return;
    }

    if ( scrollPos >= (scrollMax - navbarSize) ) {
        dom.html.addClass( "is-loader-moment" );

        translate3d( $_jsLoader[ 0 ], 0, px( scrollMax - scrollPos ), 0 );
        translate3d( dom.refBtn[ 0 ], 0, px( -(navbarSize + (scrollPos - scrollMax)) ), 0 );

    } else {
        dom.html.removeClass( "is-loader-moment" );

        clearTransforms();
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default loader;