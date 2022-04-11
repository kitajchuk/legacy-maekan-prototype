/*!
 *
 * App Controller: account
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/navbar";
import "app/drawer";
import "app/resizes";
import { hammerDefaults } from "app/config";
import { emitter, loadImages, noop, getTransitionDuration } from "app/util";


var $_jsAccount = null,
    $_jsToggles = null,
    $_jsViews = null,
    $_jsPages = null,

    _isActive = false,
    _timeout = null,
    _duration = null,

    Hammered = require( "Hammered" ),
    hammered = null,


/**
 *
 * @public
 *
 */
account = {
    name: "account",


    init: function () {
        console.log( "account initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        hammered = new Hammered( $_jsAccount[ 0 ], hammerDefaults );

        navbar.clearActive();

        $_jsPages.data( "true-parent", $_jsPages.parent() );

        if ( resizes.isSmall() ) {
            bindSmallToggle();

        } else {
            bindNormalToggle();
        }

        dom.doc.on( "change", ".js-account-avatar-uploader", onAvatarChange );

        emitter.on( "app--resize-small", onResizeSmall );
        emitter.on( "app--resize-normal", onResizeNormal );
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsAccount = dom.body.find( ".js-account" );
        $_jsToggles = $_jsAccount.find( ".js-toggle" );
        $_jsViews = $_jsAccount.find( ".js-toggle-view" );
        $_jsPages = $_jsAccount.find( ".js-account-pages" );

        _duration = getTransitionDuration( $_jsViews[ 0 ] );

        return ( $_jsAccount.length );
    },


    teardown: function () {
        _isActive = false;
        _duration = null;
        _timeout = null;

        if ( resizes.isSmall() ) {
            unbindSmallToggle();

        } else {
            unbindNormalToggle();
        }

        $_jsAccount = null;
        $_jsToggles = null;
        $_jsViews = null;
        $_jsPages = null;

        dom.doc.off( "change", onAvatarChange );

        emitter.off( "app--resize-small", onResizeSmall );
        emitter.off( "app--resize-normal", onResizeNormal );

        hammered = null;
    }
},


/**
 *
 * @private
 *
 */
bindSmallToggle = function () {
    hammered.on( "tap", ".js-toggle", onSmallToggle );
    hammered.on( "tap", ".js-account-header", onBackToggle );

    drawer.append( $_jsPages[ 0 ] );
    drawer.attach();

    loadImages( $_jsPages.find( ".js-lazy-image" ), noop );

    console.log( "bind small toggle" );
},


/**
 *
 * @private
 *
 */
unbindSmallToggle = function () {
    hammered.off( "tap", onSmallToggle );
    hammered.off( "tap", onBackToggle );

    $_jsPages.appendTo( $_jsPages.data( "true-parent" ) );

    drawer.teardown();

    console.log( "unbind small toggle" );
},


/**
 *
 * @private
 *
 */
bindNormalToggle = function () {
    hammered.on( "tap", ".js-toggle", onNormalToggle );

    $_jsToggles.first().addClass( "is-active" );
    $_jsViews.first().addClass( "is-active" );

    console.log( "bind normal toggle" );
},


/**
 *
 * @private
 *
 */
unbindNormalToggle = function () {
    hammered.off( "tap", onNormalToggle );

    console.log( "unbind normal toggle" );
},


/**
 *
 * @private
 *
 */
onNormalToggle = function () {
    var $this = $( this ),
        $targ = $( this.hash ),
        $curr = $_jsViews.filter( ".is-active" );

    if ( $this.is( ".is-active" ) ) {
        return;
    }

    try {
        clearTimeout( _timeout );

        $_jsViews.removeClass( "is-entering is-exiting is-active" );

    } catch ( error ) {}

    $_jsToggles.removeClass( "is-active" );
    $this.addClass( "is-active" );

    $curr.removeClass( "is-active" ).addClass( "is-exiting" );

    _timeout = setTimeout(function () {
        $curr.removeClass( "is-exiting" );
        $targ.addClass( "is-entering" );

        _timeout = setTimeout(function () {
            $targ.removeClass( "is-entering" ).addClass( "is-active" );

        }, _duration );

    }, _duration );
},


/**
 *
 * @private
 *
 */
onSmallToggle = function () {
    var $targ = $( this.hash );

    $_jsToggles.removeClass( "is-active" );
    $_jsViews.removeClass( "is-active" );
    $targ.addClass( "is-active" );

    drawer.label( this.innerHTML );
    drawer.open();
},


/**
 *
 * @private
 *
 */
onBackToggle = function () {
    drawer.close();
},


/**
 *
 * @private
 *
 */
onResizeNormal = function () {
    unbindSmallToggle();
    bindNormalToggle();
},


/**
 *
 * @private
 *
 */
onResizeSmall = function () {
    unbindNormalToggle();
    bindSmallToggle();
},


/**
 *
 * @private
 *
 */
onAvatarChange = function () {
    var avatars = dom.body.find( ".js-account-avatar" ),
        reader = new FileReader();

    reader.onload = function ( e ) {
        var file = e.target.result;

        for ( var i = avatars.length; i--; ) {
            avatars[ i ].style.backgroundImage = "url(" + file + ")";
        }

        // post data url to endpoint
    };

    reader.readAsDataURL( this.files[ 0 ] );
};


/******************************************************************************
 * Export
*******************************************************************************/
export default account;