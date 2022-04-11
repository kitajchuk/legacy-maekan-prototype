/*!
 *
 * App Controller: loadin
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/config";
import "app/preload";
import { emitter, getTransitionDuration } from "app/util";


var $_jsLoadin = $( ".js-loadin" ),
    $_jsBar = $_jsLoadin.find( ".js-bar" ),

    _transitionTime = getTransitionDuration( $_jsLoadin[ 0 ] ),


/**
 *
 * @public
 *
 */
loadin = {
    init: function () {
        if ( !$_jsLoadin.length ) {
            return;
        }

        //emitter.on( "app--preload-data", onData );
        emitter.on( "app--preload-done", onDone );
    },


    teardown: function () {
        $_jsLoadin.remove();

        $_jsLoadin = null;
        $_jsBar = null;

        //emitter.off( "app--preload-data", onData );
        emitter.off( "app--preload-done", onDone );

        _transitionTime = null;
    }
},


/**
 *
 * @private
 *
 */
/*
onData = function ( data ) {
    $_jsBar[ 0 ].style.width = (data.done / data.total * 100) + "%";
},
*/


/**
 *
 * @private
 *
 */
onDone = function () {
    $_jsLoadin.addClass( "is-loadin-intro" );

    dom.html.addClass( "is-loadin-cover" );

    setTimeout(function () {
        $_jsLoadin.addClass( "is-loadin-outro" );

        setTimeout(function () {
            $_jsLoadin.removeClass( "is-active" );

            dom.html.removeClass( "is-loadin-cover" );

            setTimeout(function () {
                loadin.teardown();

            }, config.easeDuration );

        }, config.easeDuration );

    }, 1000 );
};


/******************************************************************************
 * Export
*******************************************************************************/
export default loadin;