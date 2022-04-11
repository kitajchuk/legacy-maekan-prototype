/*!
 *
 * App Module: /util
 *
 * @namespace util
 * @memberof app
 *
 *
 */
import "app/dom";
import "app/config";
import "app/detect";
import "lib/proper";


var Controller = require( "Controller" ),
    ScrollController = require( "ScrollController" ),
    ResizeController = require( "ResizeController" ),
    ImageLoader = require( "ImageLoader" ),
    MediaBox = require( "MediaBox" ),


/**
 *
 * Add pixel units when inline styling
 * @member mediabox
 * @memberof util
 *
 */
px = function ( s ) {
    return (s + "px");
},


/**
 *
 * Apply a translate3d transform
 * @method translate3d
 * @param {object} el The element to transform
 * @param {string|number} x The x value
 * @param {string|number} y The y value
 * @param {string|number} z The z value
 * @memberof util
 *
 */
translate3d = function ( el, x, y, z ) {
    if ( el ) {
        el.style[ Hammer.prefixed( el.style, "transform" ) ] = "translate3d(" + x + "," + y + "," + z + ")";
    }
},


/**
 *
 * Single app instanceof MediaBox
 * @member mediabox
 * @memberof util
 *
 */
mediabox = new MediaBox(),


/**
 *
 * Single app instanceof Controller for arbitrary event emitting
 * @member emitter
 * @memberof util
 *
 */
emitter = new Controller(),


/**
 *
 * Single app instanceof Scroller
 * @member scroller
 * @memberof util
 *
 */
scroller = new ScrollController(),


/**
 *
 * Single app instanceof Resizer
 * @member resizer
 * @memberof util
 *
 */
resizer = new ResizeController(),


/**
 *
 * Module onImageLoadHander method, handles event
 * @method isElementLoadable
 * @param {object} el The DOMElement to check the offset of
 * @returns boolean
 * @memberof util
 *
 */
isElementLoadable = function ( el ) {
    var bounds = el.getBoundingClientRect();

    return ( bounds.top < (window.innerHeight * 2) );
},


/**
 *
 * Module isElementInViewport method, handles element boundaries
 * @method isElementInViewport
 * @param {object} el The DOMElement to check the offsets of
 * @returns boolean
 * @memberof util
 *
 */
isElementInViewport = function ( el ) {
    var bounds = el.getBoundingClientRect();

    return ( bounds.top < window.innerHeight && bounds.bottom > 0 );
},


/**
 *
 * Fresh query to lazyload images on page
 * @method loadImages
 * @param {object} images Optional collection of images to load
 * @param {function} handler Optional handler for load conditions
 * @param {function} callback Optional callback when loaded
 * @memberof util
 *
 */
loadImages = function ( images, handler, loadType ) {
    // Normalize the handler
    handler = (handler || isElementLoadable);

    // Normalize the images
    images = (images || $( ".js-lazy-image" ));

    // Normalize loadType
    loadType = (loadType || "async");

    return new ImageLoader({
        elements: images,
        property: "data-img-src",
        loadType: loadType,
        transitionDelay: 0

    // Default handle method. Can be overriden.
    }).on( "data", handler );
},


/**
 *
 * Toggle on/off scrollability
 * @method toggleMouseWheel
 * @param {boolean} enable Flag to enable/disable
 * @memberof util
 *
 */
toggleMouseWheel = function ( enable ) {
    if ( enable ) {
        dom.doc.off( "DOMMouseScroll mousewheel" );

    } else {
        dom.doc.on( "DOMMouseScroll mousewheel", function ( e ) {
            e.preventDefault();
            return false;
        });
    }
},


/**
 *
 * Toggle on/off touch movement
 * @method toggleTouchMove
 * @param {boolean} enable Flag to enable/disable
 * @memberof util
 *
 */
toggleTouchMove = function ( enable ) {
    if ( enable ) {
        dom.doc.off( "touchmove" );

    } else {
        dom.doc.on( "touchmove", function ( e ) {
            e.preventDefault();
            return false;
        });
    }
},


/**
 *
 * Resize elements based on keyword
 * @method resizeElems
 * @param {object} elems Optional collection to resize
 * @memberof util
 *
 */
resizeElems = function ( elems ) {
    var data,
        i;

    elems = (elems || $( ".js-resize" ));

    for ( i = elems.length; i--; ) {
        data = elems[ i ].dataset;

        if ( data.resize === "fullscreen" ) {
            elems[ i ].style.height = px( window.innerHeight );
        }
    }
},


/**
 * Resize arbitary width x height region to fit inside another region.
 * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 * @url: http://opensourcehacker.com/2011/12/01/calculate-aspect-ratio-conserving-resize-for-images-in-javascript/
 * @method calculateAspectRatioFit
 * @memberof util
 * @param {Number} srcWidth Source area width
 * @param {Number} srcHeight Source area height
 * @param {Number} maxWidth Fittable area maximum available width
 * @param {Number} srcWidth Fittable area maximum available height
 * @return {Object} { width, heigth }
 *
 */
calculateAspectRatioFit = function( srcWidth, srcHeight, maxWidth, maxHeight ) {
    var ratio = Math.min( (maxWidth / srcWidth), (maxHeight / srcHeight) );

    return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
    };
},


/**
 *
 * Get the applied transition duration from CSS
 * @method getTransitionDuration
 * @param {object} el The DOMElement
 * @memberof util
 * @returns number
 *
 */
getTransitionDuration = function ( el ) {
    if ( !el ) {
        return 0;
    }

    var duration = getComputedStyle( el )[ Hammer.prefixed( el.style, "transition-duration" ) ],
        isSeconds = duration.indexOf( "ms" ) === -1,
        multiplyBy = isSeconds ? 1000 : 1;

    return parseFloat( duration ) * multiplyBy;
},


/**
 *
 * Get the applied transform values from CSS
 * @method getTransformValues
 * @param {object} el The DOMElement
 * @memberof util
 * @returns object
 *
 */
getTransformValues = function ( el ) {
    if ( !el ) {
        return null;
    }

    var transform = getComputedStyle( el )[ Hammer.prefixed( el.style, "transform" ) ],
        values = transform.replace( /matrix|3d|\(|\)|\s/g, "" ).split( "," ),
        ret = {};

    // No Transform
    if ( values[ 0 ] === "none" ) {
        ret.x = 0;
        ret.y = 0;
        ret.z = 0;

    // Matrix 3D
    } else if ( values.length === 16 ) {
        ret.x = parseFloat( values[ 12 ] );
        ret.y = parseFloat( values[ 13 ] );
        ret.z = parseFloat( values[ 14 ] );

    } else {
        ret.x = parseFloat( values[ 4 ] );
        ret.y = parseFloat( values[ 5 ] );
        ret.z = 0;
    }

    return ret;
},


/**
 *
 * Get the numeric values from CSS style
 * @method getNumericStyleValue
 * @param {object} el The DOMElement
 * @param {string} style The style to lookup
 * @memberof util
 * @returns {number}
 *
 */
getNumericStyleValue = function ( el, style ) {
    if ( el ) {
        return parseFloat( getComputedStyle( el )[ style ] );
    }
},


/**
 *
 * All true all the time
 * @method noop
 * @memberof util
 * @returns boolean
 *
 */
noop = function () {
    return true;
},


/**
 *
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 * @method shuffle
 * @param {object} array The array to shuffle
 * @memberof util
 *
 */
shuffle = function ( array ) {
    var temp,
        i,
        j;

    for ( i = array.length - 1; i > 0; i-- ) {
        j = Math.floor( Math.random() * (i + 1) );
        temp = array[ i ];

        array[ i ] = array[ j ];
        array[ j ] = temp;
    }

    return array;
},


/**
 *
 * Split an array into smaller arrays
 * @method splitArray
 * @param {object} a The array to split
 * @param {number} n The number of splits
 * @memberof util
 *
 */
splitArray = function ( a, n ) {
    var out = [],
        i;

    for ( i = 0; i < n; i++ ) {
        out.push( a.slice( i * n, i * n + n ) );
    }

    return out;
},


/**
 *
 * Parse a floating point time value into a distinguished time representation
 * @method parseTime
 * @param {float} time The floating point time value
 * @memberof util
 *
 */
parseTime = function ( time ) {
    time = (time * 1000);

    var minutes = parseInt( time / (1000 * 60), 10 ),
        seconds = parseInt( time / 1000, 10) % 60;

    if ( seconds < 10 ) {
        seconds = ("0" + seconds);
    }

    return (minutes + ":" + seconds);
};


/******************************************************************************
 * Export
*******************************************************************************/
export {
    // Classes
    mediabox,
    emitter,
    scroller,
    resizer,

    // Loading
    loadImages,
    isElementLoadable,
    isElementInViewport,

    // Disabling
    toggleMouseWheel,
    toggleTouchMove,

    // Random
    px,
    noop,
    shuffle,
    parseTime,
    splitArray,
    resizeElems,
    translate3d,
    calculateAspectRatioFit,
    getTransitionDuration,
    getTransformValues,
    getNumericStyleValue
};