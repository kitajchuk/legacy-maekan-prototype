/*!
 *
 * App Controller: refine
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/feed";
import "app/preload";
import "app/gallery";
import "app/search";
import "app/account";
import "app/cover";
import "app/scrolls";
import { hammerDefaults } from "app/config";
import { noop, getTransitionDuration, emitter } from "app/util";


var $_jsRefineTopics = dom.refine.find( ".js-refine-topic" ),
    $_jsRefineCats = dom.refine.find( ".js-refine-category" ),
    $_jsRefineLabel = null,

    _isSubmit = false,
    _isActive = false,
    _activeString = null,
    _transitionTime = getTransitionDuration( dom.refine[ 0 ] ),

    Hammered = require( "Hammered" ),
    hammereds = {},


/**
 *
 * @public
 *
 */
refine = {
    name: "refine",


    init: function () {
        dom.refine.detach();

        hammereds.refine = new Hammered( dom.refine[ 0 ], hammerDefaults );
        hammereds.refine.on( "tap", ".js-refine", onRefineTap );
        hammereds.refine.on( "tap", ".js-refine-topic", onRefineTopic );
        hammereds.refine.on( "tap", ".js-refine-category", onRefineCat );

        hammereds.refBtn = new Hammered( dom.refBtn[ 0 ], hammerDefaults );
        hammereds.refBtn.on( "tap", ".js-controller--refine", onRefineControl );

        emitter.on( "app--refine-topic", this.setTopic );

        console.log( "refine initialized" );
    },


    isActive: noop,


    onload: function () {
        this.getElements();

        if ( isRefineAvailable() ) {
            attachBtn();

        } else {
            detachBtn();
        }
    },


    unload: function () {
        detachBtn();
    },


    getElements: function () {
        $_jsRefineLabel = dom.body.find( ".js-refine-label" );
    },


    setTopic: function ( topic ) {
        $_jsRefineTopics.removeClass( "is-active" );
        $_jsRefineTopics.filter( "[data-topic='" + topic + "']" ).addClass( "is-active" );
    }
},


/**
 *
 * @private
 *
 */
getActiveString = function () {
    return $_jsRefineTopics.filter( ".is-active" ).add( $_jsRefineCats.filter( ".is-active" ) ).text();
},


/**
 *
 * @private
 *
 */
detachBtn = function () {
    dom.refBtn.addClass( "is-inactive" );
},


/**
 *
 * @private
 *
 */
attachBtn = function () {
    dom.refBtn.removeClass( "is-inactive" );
},


/**
 *
 * @private
 *
 */
contextRefine = function () {
    var $cats = $_jsRefineCats.filter( ".is-active" ),
        topic = $_jsRefineTopics.filter( ".is-active" ).text(),
        cats = [ "<span>" + topic + "</span>" ],
        len = $cats.length,
        i;

    for ( i = 0; i < len; i++ ) {
        cats.push( $cats[ i ].innerHTML );
    }

    $_jsRefineLabel.addClass( "is-active" )[ 0 ].innerHTML = cats.join( " / " );
},


/**
 *
 * @private
 *
 */
isRefineAvailable = function () {
    var ret = true;

    if ( gallery.isActive() || search.isActive() || account.isActive() || $( ".js-article" ).length || $( ".js-kit-of-parts" ).length ) {
        ret = false;
    }

    return ret;
},


/**
 *
 * @private
 *
 */
detachRefine = function () {
    setTimeout(function () {
        dom.refine.detach();
        $_jsRefineTopics.removeClass( "is-active" ).first().addClass( "is-active" );
        $_jsRefineCats.removeClass( "is-active" );

    }, _transitionTime );
},


/**
 *
 * @private
 *
 */
closeRefine = function () {
    var activeStr = getActiveString();

    if ( _isSubmit ) {
        _isSubmit = false;

        if ( activeStr !== _activeString ) {
            feed.shimUpdate();

            if ( cover.isActive() ) {
                cover.remove();
                cover.teardown();
            }

            contextRefine();
        }

        scrolls.clearStates();
    }

    dom.refine.removeClass( "is-active" );

    dom.html.removeClass( "is-clipped" );

    dom.refBtn.removeClass( "is-active" );

    detachRefine();
},


/**
 *
 * @private
 *
 */
onRefineTap = function ( e ) {
    if ( e.target === dom.refine[ 0 ] ) {
        onRefineControl.call( e.target );
    }
},


/**
 *
 * @private
 *
 */
onRefineTopic = function () {
    var $this = $( this );

    $_jsRefineTopics.removeClass( "is-active" );
    $_jsRefineCats.removeClass( "is-active" );

    $this.addClass( "is-active" );
},


/**
 *
 * @private
 *
 */
onRefineCat = function () {
    $( this ).toggleClass( "is-active" );
},


/**
 *
 * @private
 *
 */
onRefineControl = function () {
    _isSubmit = $( this ).is( ".js-controller--refine" );
    _isActive = !_isActive;

    if ( _isActive ) {
        dom.html.addClass( "is-clipped" );
        dom.body.append( dom.refine );

        dom.refBtn.addClass( "is-active" );

        _activeString = getActiveString();

        setTimeout(function () {
            dom.refine.addClass( "is-active" );

        // Async shim :-)
        }, 0 );

    } else {
        closeRefine();
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default refine;