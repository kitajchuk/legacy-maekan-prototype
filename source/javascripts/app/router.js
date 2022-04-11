/*!
 *
 * App Controller: router
 *
 * A nice description of what this controller does...
 *
 *
 */
import { emitter, getTransitionDuration } from "app/util";
import "app/dom";
import "app/feed";
import "app/refine";
import "app/preload";
import "app/search";
import "app/scrolls";
import "app/navbar";
import "app/gallery";
import "app/cover";
import "app/account";
import "app/players";
import "app/loader";
import "app/carousel";
import "app/belt";
import "app/scripts";


var PageController = require( "PageController" ),

    _pageDuration = getTransitionDuration( dom.page[ 0 ] ),
    _pageController = new PageController({
        transitionTime: _pageDuration
    }),


/**
 *
 * @public
 *
 */
router = {
    init: function () {
        _pageController.setConfig([
            "*"
        ]);

        _pageController.setModules([
            scrolls,
            preload,
            scripts,

            cover,
            feed,
            search,
            gallery,
            account,
            players.video,
            players.audio,
            refine,
            carousel,
            belt
        ]);

        _pageController.initPage();

        _pageController.on( "page-controller-router-samepage", function () {
            navbar.close();
        });

        _pageController.on( "page-controller-router-transition-out", function () {
            changePageOut();
        });

        _pageController.on( "page-controller-router-refresh-document", function ( html ) {
            changeContent( html );
        });

        _pageController.on( "page-controller-router-transition-in", function ( data ) {
            changePageIn( data );
        });

        captureLinks();

        console.log( "router initialized", _pageController );
    }
},


/**
 *
 * @private
 *
 */
captureLinks = function () {
    // Suppress #hash
    dom.body.on( "click", "[href^='#']", function ( e ) {
        e.preventDefault();
    });
},


/**
 *
 * @private
 *
 */
onPreloadDone = function () {
    preload.triggerEvents();

    setTimeout(function () {
        dom.html.removeClass( "is-routing" );
        dom.page.removeClass( "is-reactive is-inactive" );

    }, _pageDuration );

    emitter.off( "app--preload-done", onPreloadDone );
},


/**
 *
 * @private
 *
 */
changePageOut = function () {
    navbar.close();

    loader.reset();

    dom.html.addClass( "is-routing" );
    dom.page.removeClass( "is-reactive" ).addClass( "is-inactive" );

    emitter.on( "app--preload-done", onPreloadDone );
},


/**
 *
 * @private
 *
 */
changeContent = function ( html ) {
    var $doc = $( html ),
        res = $doc.find( ".js-page" )[ 0 ].innerHTML;

    document.title = $doc.filter( "title" ).text();

    dom.page[ 0 ].innerHTML = res;
},


/**
 *
 * @private
 *
 */
changePageIn = function () {
    dom.page.addClass( "is-reactive" );
};


/******************************************************************************
 * Export
*******************************************************************************/
export default router;