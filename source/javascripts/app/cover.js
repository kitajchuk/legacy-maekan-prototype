/*!
 *
 * App Controller: cover
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/resizes";
import "app/detect";
import { emitter, loadImages } from "app/util";


var $_jsCover = null,

    _isActive = false,
    _isMobilized = false,


/**
 *
 * @public
 *
 */
cover = {
    name: "cover",


    init: function () {
        console.log( "cover initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        $_jsCover.data( "$mobile-image", $_jsCover.find( ".js-lazy-image-mobile" ) );

        dom.html.addClass( "is-cover-page" );

        emitter.on( "app--scroll", onScroller );
        emitter.on( "app--resize-tall", onResizeTall );
        emitter.on( "app--resize-wide", onResizeWide );

        onScroller( window.scrollY );

        if ( resizes.isTall() ) {
            onResizeTall();

        } else {
            onResizeWide();
        }
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsCover = dom.body.find( ".js-cover" );

        return ( $_jsCover.length );
    },


    remove: function () {
        $_jsCover.remove();
    },


    teardown: function () {
        $_jsCover = null;

        dom.html.removeClass( "is-cover-page is-cover-moment is-navbar-light" );

        _isActive = false;
        _isMobilized = false;

        emitter.off( "app--scroll", onScroller );
        emitter.off( "app--resize-tall", onResizeTall );
        emitter.off( "app--resize-wide", onResizeWide );
    }
},


/**
 *
 * @private
 *
 */
onResizeTall = function () {
    var $mobileImage = $_jsCover.data( "$mobile-image" );

    if ( !$mobileImage.length ) {
        return;
    }

    if ( !_isMobilized ) {
        _isMobilized = true;

        loadImages( $mobileImage );
    }

    onScroller();

    $_jsCover.addClass( "is-fullscreen" );
},


/**
 *
 * @private
 *
 */
onResizeWide = function () {
    onScroller();

    $_jsCover.removeClass( "is-fullscreen" );
},


/**
 *
 * @private
 *
 */
onScroller = function ( scrollPos ) {
    var navState = $_jsCover.data( "nav" );

    if ( scrollPos >= (window.innerHeight / 2) ) {
        dom.html.removeClass( "is-cover-moment" );

    } else {
        dom.html.addClass( "is-cover-moment" );
    }

    if ( navState ) {
        if ( scrollPos < window.innerHeight ) {
            dom.html.addClass( navState );

        } else {
            dom.html.removeClass( navState );
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default cover;