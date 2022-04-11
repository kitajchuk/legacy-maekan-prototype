/*!
 *
 * App Controller: search
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/api";
import "app/keys";
import "app/feed";
import "app/preload";
import "app/config";
import "app/resizes";
import { emitter, shuffle, getTransitionDuration } from "app/util";


var $_jsSearch = null,
    $_jsSearchInput = null,
    $_jsSearchSuggest = null,
    $_jsSearchResults = null,

    debounce = require( "debounce" ),

    _xhr = null,
    _isStatic = false,
    _isActive = false,
    _lastValue = null,
    _transitionTime = null,


/**
 *
 * @public
 *
 */
search = {
    name: "search",


    init: function () {
        console.log( "search initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        setTimeout(function () {
            $_jsSearchInput[ 0 ].focus();

        }, _transitionTime );

        if ( resizes.isSmall() ) {
            bindSmallSearch();

        } else {
            bindNormalSearch();
        }

        $_jsSearch.on( "submit", onSubmitSearch );

        emitter.on( "app--resize-small", onResizeSmall );
        emitter.on( "app--resize-normal", onResizeNormal );
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsSearch = dom.page.find( ".js-search" );
        $_jsSearchInput = $_jsSearch.find( ".js-search-input" );
        $_jsSearchSuggest = $_jsSearch.find( ".js-search-suggest" );
        $_jsSearchResults = dom.page.find( ".js-search-results" );

        _transitionTime = getTransitionDuration( $_jsSearchResults[ 0 ] );

        return ( $_jsSearch.length );
    },


    teardown: function () {
        _isActive = false;
        _lastValue = null;
        _isStatic = false;

        $_jsSearch.removeClass( "is-search-results" ).off( "submit", onSubmitSearch );

        unbindSmallSearch();
        unbindNormalSearch();

        emitter.off( "app--resize-small", onResizeSmall );
        emitter.off( "app--resize-normal", onResizeNormal );

        $_jsSearch = null;
        $_jsSearchInput = null;
        $_jsSearchSuggest = null;
        $_jsSearchResults = null;
    }
},


/**
 *
 * @private
 *
 */
doSearch = function ( query ) {
    _xhr = api.feed( query ).done(function ( results ) {
        var $results = shuffle( $( results ) ),
            $images = $results.find( ".js-lazy-image" );

        _xhr = null;

        $_jsSearchResults.addClass( "is-unloaded" );

        preload.doPreload( $images, function () {
            $_jsSearchResults
                .html( $results )
                .removeClass( "is-unloaded" ).addClass( "is-updating" );

            feed.setItems( $results );

            setTimeout(function () {
                $_jsSearchResults.removeClass( "is-updating" );

                if ( !_isStatic ) {
                    _isStatic = true;

                    $_jsSearch.addClass( "is-search-results" );
                }

            }, _transitionTime );
        });

    }).fail(function ( xhr, textStatus, errorThrown ) {
        // Handle no results
        console.log( xhr, textStatus, errorThrown );
    });
},


/**
 *
 * @private
 *
 */
bindSmallSearch = function () {
    $_jsSearchInput.on( "keydown", onSmallKeydown );
    $_jsSearchSuggest.val( "" );

    console.log( "bind small search" );
},


/**
 *
 * @private
 *
 */
unbindSmallSearch = function () {
    $_jsSearchInput.off( "keydown", onSmallKeydown );

    console.log( "unbind small search" );
},


/**
 *
 * @private
 *
 */
bindNormalSearch = function () {
    $_jsSearchInput
        .on( "keyup", onSearchKeyup )
        .on( "keydown", onSuggestKeydown );

    console.log( "bind normal search" );
},


/**
 *
 * @private
 *
 */
unbindNormalSearch = function () {
    $_jsSearchInput
        .off( "keyup", onSearchKeyup )
        .off( "keydown", onSuggestKeydown );

    console.log( "unbind normal search" );
},


/**
 *
 * @private
 *
 */
trapKey = function ( aKey, bKey ) {
    return (aKey === bKey);
},


/**
 *
 * @private
 *
 */
emptyResults = function () {
    $_jsSearchResults.addClass( "is-unloaded" );

    setTimeout(function () {
        $_jsSearchResults[ 0 ].innerHTML = "";

    }, _transitionTime );
},


/**
 *
 * @private
 *
 */
onResizeNormal = function () {
    unbindSmallSearch();
    bindNormalSearch();
},


/**
 *
 * @private
 *
 */
onResizeSmall = function () {
    unbindNormalSearch();
    bindSmallSearch();
},


/**
 *
 * @private
 *
 */
onSmallKeydown = function ( e ) {
    var trapEnter = trapKey( e.which, keys.ENTER );

    if ( trapEnter ) {
        $_jsSearchInput[ 0 ].blur();

        doSearch( this.value );
    }
},


/**
 *
 * @private
 *
 */
onSubmitSearch = function ( e ) {
    e.preventDefault();
    return false;
},


/**
 *
 * @private
 *
 */
onSuggestKeydown = function ( e ) {
    var trapEnter = trapKey( e.which, keys.ENTER ),
        trapTab = trapKey( e.which, keys.TAB );

    if ( trapTab ) {
        $_jsSearchInput.val( $_jsSearchSuggest.val() );
        e.preventDefault();
        return false;

    } else if ( trapEnter ) {
        e.preventDefault();
        return false;
    }

    api.suggest( this.value ).done(function ( results ) {
        var result = results[ 1 ][ 0 ];

        $_jsSearchSuggest.val( result );
    });
},


/**
 *
 * @private
 *
 */
onSearchKeyup = debounce(function ( e ) {
    var val = this.value.replace( /\s/g, "" );

    if ( _xhr ) {
        _xhr.abort();
    }

    if ( !val ) {
        emptyResults();
        $_jsSearchSuggest.val( "" );
        e.preventDefault();
        return false;

    } else if ( val === _lastValue ) {
        e.preventDefault();
        return false;
    }

    _lastValue = val;

    doSearch( this.value );

}, 250 );


/******************************************************************************
 * Export
*******************************************************************************/
export default search;