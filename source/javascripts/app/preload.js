/*!
 *
 * App Controller: preload
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import { noop, loadImages, emitter, isElementLoadable } from "app/util";


var $_images = null,
    $_visible = null,

    _imgLoader = null,


/**
 *
 * @public
 *
 */
preload = {
    name: "preload",


    init: function () {
        console.log( "preload initialized" );
    },


    isActive: noop,


    onload: function () {
        this.doPreload();
    },


    unload: function () {
        $_images = null;
        $_visible = null;

        _imgLoader = null;
    },


    triggerEvents: function () {
        emitter.fire( "app--do-scroll" );
        emitter.fire( "app--do-resize" );
    },


    doPreload: function ( $images, callback ) {
        $_images = ($images || dom.page.find( ".js-lazy-image" ));
        $_visible = $( [] );

        var done = 0,
            len = $_images.length,
            i;

        for ( i = 0; i < len; i++ ) {
            if ( isElementLoadable( $_images[ i ] ) ) {
                $_visible.push( $_images[ i ] );
            }
        }

        console.log( "preload will load", $_visible.length, "out of", $_images.length, "images" );

        if ( !$_visible.length ) {
            delayedLoad( callback );

        } else {
            _imgLoader = loadImages( $_visible, function () {
                done++;

                emitter.fire( "app--preload-data", {
                    total: $_visible.length,
                    done: done
                });

                return true;
            });
            _imgLoader.on( "done", function () {
                delayedLoad( callback );
            });
        }
    }
},


/**
 *
 * @private
 *
 */
delayedLoad = function ( callback ) {
    var $notVisible = $_images.not( $_visible );

    if ( $notVisible.length ) {
        _imgLoader = null;
        _imgLoader = loadImages( $notVisible, isElementLoadable );
        _imgLoader.on( "done", function () {
            console.log( "lazyloaded", $notVisible.length, "images" );
        });
    }

    console.log( "preloaded", $_visible.length, "images" );

    emitter.fire( "app--preload-done" );

    if ( $.isFunction( callback ) ) {
        callback();
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default preload;