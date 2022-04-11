/*!
 *
 * App Controller: detect
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";


/**
 *
 * @public
 *
 */
var detect = {
    init: function () {
        checkTouch();

        console.log( "detect initialized" );
    },


    isTouch: function () {
        return ("ontouchstart" in window) || (window.DocumentTouch && document instanceof DocumentTouch);
    },


    teardown: function () {
        dom.html.removeClass( "is-touchable is-hoverable" );
    }
},


/**
 *
 * @private
 * @reference: https://github.com/Modernizr/Modernizr/blob/master/feature-detects/touchevents.js
 *
 */
checkTouch = function () {
    if ( detect.isTouch() ) {
        dom.html.addClass( "is-touchable" );

    } else {
        dom.html.addClass( "is-hoverable" );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default detect;