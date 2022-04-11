/*!
 *
 * App Controller: feed
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/scrolls";
import "app/loader";
import "app/resizes";
import { easeDuration } from "app/config";
import { noop, loadImages, scroller, emitter, shuffle, getTransitionDuration, isElementInViewport, toggleMouseWheel, toggleTouchMove } from "app/util";


var $_jsFeed = null,
    $_jsFeedWrap = null,
    $_jsItems = null,
    $_jsItemsFactory = null,
    $_jsFeedFactory = null,

    _feedData = null,
    _isActive = false,
    _isLoading = false,
    _pageDuration = getTransitionDuration( dom.page[ 0 ] ),

    scroll2 = require( "scroll2" ),
    Easing = require( "Easing" ),


/**
 *
 * @public
 *
 */
feed = {
    name: "feed",


    init: function () {
        console.log( "feed initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        _feedData = $_jsFeed.data();
        _feedData.page = (_feedData.page || 1);

        emitter.on( "app--resize", onResizer );
        emitter.on( "app--resize-small", unbindAnimateFeed );
        emitter.on( "app--resize-normal", bindAnimateFeed );
        emitter.on( "app--load-more", this.shimLoading );

        if ( !resizes.isSmall() ) {
            bindAnimateFeed();
        }

        onScroller();
        doLinklistMeta();

        setTimeout(function () {
            if ( _feedData.pages > 1 ) {
                loader.activate( true );

                dom.html.addClass( "is-feed-loadable" );
            }

        }, easeDuration );
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsFeed = dom.page.find( ".js-feed" );
        $_jsFeedWrap = $_jsFeed.parent();
        $_jsItems = $_jsFeed.children();
        $_jsItemsFactory = $_jsItems.clone();
        $_jsFeedFactory = $( "<section />", {
            "class": "feed feed--center"
        });

        return ( $_jsFeed.length );
    },


    teardown: function () {
        _isActive = false;
        _isLoading = false;
        _feedData = null;

        unbindAnimateFeed( true );

        $_jsFeed = null;
        $_jsFeedWrap = null;
        $_jsItems = null;
        $_jsItemsFactory = null;
        $_jsFeedFactory = null;

        emitter.off( "app--resize", onResizer );
        emitter.off( "app--resize-small", unbindAnimateFeed );
        emitter.off( "app--resize-normal", bindAnimateFeed );
        emitter.off( "app--load-more", this.shimLoading );

        dom.html.removeClass( "is-navbar-light is-feed-loadable" );
    },


    shimUpdate: function () {
        dom.page.removeClass( "is-reactive" ).addClass( "is-inactive" );

        setTimeout(function () {
            scrolls.topout();

        }, _pageDuration );

        setTimeout(function () {
            $_jsItems.detach();

            $_jsItems = shuffle( $_jsItems );

            $_jsFeed.html( $_jsItems );

            dom.page.removeClass( "is-reactive is-inactive" );

        }, _pageDuration * 2 );
    },


    shimLoading: function () {
        if ( _isLoading ) {
            return;
        }

        _isLoading = true;

        toggleTouchMove( false );
        toggleMouseWheel( false );

        var $feed = $_jsFeedFactory.clone(),
            $items = shuffle( $_jsItemsFactory.clone() );
            $items.addClass( "is-loading" );

        $feed.append( $items );

        setTimeout(function () {
            $items.addClass( "is-active" );

            loadImages( $items.find( ".js-lazy-image" ), noop ).on( "done", function () {
                _feedData.page++;

                $_jsFeedWrap.append( $feed );

                feed.setItems( $_jsItems.add( $items ) );

                toggleTouchMove( true );
                toggleMouseWheel( true );

                if ( _feedData.page === _feedData.pages ) {
                    loader.activate( false );

                    dom.html.removeClass( "is-feed-loadable" );
                }

                setTimeout(function () {
                    $items.removeClass( "is-loading" );

                    dom.html.removeClass( "is-loader-moment" );

                }, (easeDuration / 2) );

                scroll2({
                    y: scroller.getScrollY() + (window.innerHeight / 2),
                    ease: Easing.easeInOutCubic,
                    duration: easeDuration,
                    complete: function () {
                        _isLoading = false;
                    }
                });
            });

        }, easeDuration );
    },


    setItems: function ( $items ) {
        $_jsItems = $items;

        doLinklistMeta();
    }
},


/**
 *
 * @private
 *
 */
bindAnimateFeed = function () {
    emitter.on( "app--scroll", onScroller );

    console.log( "bind animate feed" );
},


/**
 *
 * @private
 *
 */
unbindAnimateFeed = function ( isTeardown ) {
    emitter.off( "app--scroll", onScroller );

    if ( !isTeardown ) {
        $_jsItems.removeClass( "is-active" );
    }

    console.log( "unbind animate feed" );
},


/**
 *
 * @private
 *
 */
doLinklistMeta = function () {
    var $links = $( ".js-linklist-item" ),
        i;

    if ( $links.length ) {
        for ( i = $links.length; i--; ) {
            $links.eq( i ).find( ".js-linklist-hostname" )[ 0 ].innerHTML = $links[ i ].hostname.replace( "www.", "" );
        }
    }
},


/**
 *
 * @private
 *
 */
loopItems = function () {
    var $item,
        i;

    for ( i = $_jsItems.length; i--; ) {
        $item = $_jsItems.eq( i );

        if ( isElementInViewport( $item[ 0 ] ) ) {
            $item.addClass( "is-active" );

        } else {
            $item.removeClass( "is-active" );
        }
    }
},


/**
 *
 * @private
 *
 */
onResizer = function () {
    if ( !resizes.isSmall() ) {
        onScroller();
    }
},


/**
 *
 * @private
 *
 */
onScroller = function () {
    // Don't do anything while loading content.
    // Don't do anything if no items exist, such as landing on the search page.
    if ( !$_jsItems.length || _isLoading ) {
        return;
    }


    // We can bubble the spritzer :-P
    loopItems();
};


/******************************************************************************
 * Export
*******************************************************************************/
export default feed;