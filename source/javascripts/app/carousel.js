/*!
 *
 * App Controller: carousel
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/resizes";
import { hammerDefaults } from "app/config";
import { noop, emitter, loadImages, getTransitionDuration, isElementLoadable } from "app/util";


var $_jsCarousels = null,

    _isActive = false,

    Hammered = require( "Hammered" ),


/**
 *
 * @public
 *
 */
carousel = {
    name: "carousel",


    init: function () {
        console.log( "carousel initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        emitter.on( "app--scroll", onScroller );
    },


    unload: function () {
        this.teardown();
    },


    teardown: function () {
        _isActive = false;

        stopCarousels();

        emitter.off( "app--scroll", onScroller );

        $_jsCarousels = null;
    },


    getElements: function () {
        $_jsCarousels = dom.page.find( ".js-carousel" );

        return ( $_jsCarousels.length );
    }
},


stopCarousels = function () {
    var $carousel,
        data;

    for ( var i = $_jsCarousels.length; i--; ) {
        $carousel = $_jsCarousels.eq( i );
        data = $carousel.data();

        if ( data.hammered ) {
            data.hammered.off( "tap", onTapItem );

            $carousel.removeData();
        }
    }
},


execCarousel = function ( $carousel ) {
    var $items = $carousel.find( ".js-carousel-item" ),
        $images = $carousel.find( ".js-carousel-image" ),
        hammered = new Hammered( $carousel[ 0 ], hammerDefaults );

    $carousel.addClass( "is-loaded" );

    loadImages( $images, noop );

    $carousel.data({
        index: 0,
        length: $items.length,
        timeout: null,
        duration: getTransitionDuration( $items[ 0 ] ),
        hammered: hammered,
        $images: $images
    });

    $items.first().addClass( "is-active" );

    hammered.on( "tap", ".js-carousel-item", onTapItem );
},


onScroller = function () {
    var $notLoaded = $_jsCarousels.not( ".is-loaded" ),
        $carousel,
        i;

    // All carousels loaded
    if ( !$notLoaded.length ) {
        emitter.off( "app--scroll", onScroller );
    }

    for ( i = $notLoaded.length; i--; ) {
        $carousel = $_jsCarousels.eq( i );

        if ( isElementLoadable( $carousel[ i ] ) ) {
            execCarousel( $carousel );
        }
    }
},


onTapItem = function () {
    var $curr = $( this ),
        $carousel = $curr.closest( ".js-carousel" ),
        $items = $carousel.find( ".js-carousel-item" ),
        $next = null,
        $idx = $carousel.find( ".js-carousel-idx" ),
        index = $carousel.data( "index" ),
        length = $carousel.data( "length" ),
        duration = $carousel.data( "duration" );

    try {
        clearTimeout( $carousel.data( "timeout" ) );

        $items.removeClass( "is-entering is-exiting is-active" );

    } catch ( error ) {}

    if ( index === (length - 1) ) {
        index = 0;

    } else {
        index = (index + 1);
    }

    $idx.text( ((index + 1) + " / " + length) );

    $next = $items.eq( index );

    $curr.removeClass( "is-active" ).addClass( "is-exiting" );
    $next.addClass( "is-entering" );

    $carousel.data({
        index: index,
        timeout: setTimeout(function () {
            $curr.removeClass( "is-exiting" );
            $next.removeClass( "is-entering" ).addClass( "is-active" );

        }, duration )
    });
};


/******************************************************************************
 * Export
*******************************************************************************/
export default carousel;