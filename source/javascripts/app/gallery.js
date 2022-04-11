/*!
 *
 * App Controller: gallery
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/config";
import "app/resizes";
import { hammerDefaults } from "app/config";
import { px, emitter, translate3d, getTransitionDuration, getTransformValues, calculateAspectRatioFit } from "app/util";


var $_jsGalleryOverlay = null,
    $_jsGalleryFeed = null,
    $_jsTemplateFactory = null,
    $_jsTemplateParent = null,

    $_template = null,
    $_tapped = null,

    _image = null,
    _isActive = false,
    _isMore = false,
    _swipeThrottle = 3,
    _transitionTime = null,
    _swipeDuration = null,

    Hammered = require( "Hammered" ),
    hammereds = {},


/**
 *
 * @public
 *
 */
gallery = {
    name: "gallery",


    init: function () {
        console.log( "gallery initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        $_jsGalleryOverlay.detach();
        $_jsTemplateFactory.detach();
        $_template = $_jsTemplateFactory.clone();

        emitter.on( "app--resize", onResizer );
        emitter.on( "app--resize-small", bindSwipeable );
        emitter.on( "app--resize-normal", unbindSwipeable );

        hammereds.feed = new Hammered( $_jsGalleryFeed[ 0 ], hammerDefaults );
        hammereds.feed.on( "tap", ".js-controller--gallery", onGalleryOpen );

        hammereds.gallery = new Hammered( $_jsGalleryOverlay[ 0 ], hammerDefaults );
        hammereds.gallery.on( "tap", ".js-gallery-overlay", onGalleryTap );
        hammereds.gallery.on( "tap", ".js-controller--gallery-nav", onGalleryNav );
        hammereds.gallery.on( "tap", ".js-gallery-link", closeGallery );

        if ( resizes.isSmall() ) {
            bindSwipeable();

        } else {
            unbindSwipeable();
        }
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsGalleryOverlay = dom.body.find( ".js-gallery-overlay" );
        $_jsGalleryFeed = dom.body.find( ".js-gallery" );
        $_jsTemplateFactory = $_jsGalleryOverlay.find( ".js-gallery-template" );
        $_jsTemplateParent = $_jsTemplateFactory.parent();

        _swipeDuration = getTransitionDuration( $_jsTemplateFactory[ 0 ] );
        _transitionTime = getTransitionDuration( $_jsGalleryOverlay[ 0 ] );

        return ( $_jsGalleryFeed.length );
    },


    teardown: function () {
        _isActive = false;
        _isMore = false;
        _image = null;

        unbindSwipeable();

        emitter.off( "app--resize", onResizer );
        emitter.off( "app--resize-small", bindSwipeable );
        emitter.off( "app--resize-normal", unbindSwipeable );

        hammereds.feed.off( "tap", onGalleryOpen );
        hammereds.gallery.off( "tap", onGalleryTap );
        hammereds.gallery.off( "tap", onGalleryNav );
        hammereds.gallery.off( "tap", closeGallery );
        hammereds = {};

        $_template = null;
        $_tapped = null;

        $_jsGalleryOverlay = null;
        $_jsGalleryFeed = null;
        $_jsTemplateFactory = null;
        $_jsTemplateParent = null;
    }
},


/**
 *
 * @private
 *
 */
bindSwipeable = function () {
    hammereds.gallery.on( "panend", ".js-gallery-image", onPanEnd );
    hammereds.gallery.on( "panleft", ".js-gallery-image", onPan );
    hammereds.gallery.on( "panright", ".js-gallery-image", onPan );
    hammereds.gallery.on( "tap", ".js-gallery-image", onMoreTap );

    if ( _image ) {
        $( _image ).attr( "style", "" );
    }

    $_jsGalleryOverlay.off( "scroll", onGalleryScroll );

    console.log( "bind swipe" );
},


/**
 *
 * @private
 *
 */
unbindSwipeable = function () {
    hammereds.gallery.off( "panend", onPanEnd );
    hammereds.gallery.off( "panleft", onPan );
    hammereds.gallery.off( "panright", onPan );
    hammereds.gallery.off( "tap", onMoreTap );

    $_jsGalleryOverlay.on( "scroll", onGalleryScroll );

    console.log( "unbind swipe" );
},


/**
 *
 * @private
 *
 */
onMoreTap = function () {
    var amount = ((window.innerHeight - _image.height) / 2) + 80;

    _isMore = !_isMore;

    if ( _isMore ) {
        $_template.addClass( "is-more" );

        translate3d( _image, 0, px( amount ), 0 );

    } else {
        $_template.addClass( "is-less" );

        translate3d( _image, 0, 0, 0 );

        setTimeout(function () {
            $_template.removeClass( "is-less is-more" );

        }, config.easeDuration );
    }
},


/**
 *
 * @private
 *
 */
onPan = function ( e ) {
    e.preventDefault();

    var transform = getTransformValues( this ),
        transformY = transform.y,
        transformX = (e.deltaX / _swipeThrottle);

    translate3d( this, px( transformX ), px( transformY ), 0 );
},


/**
 *
 * @private
 *
 */
onPanEnd = function ( e ) {
    e.preventDefault();

    if ( e.direction === Hammer.DIRECTION_LEFT ) {
        moveGallery( $_tapped.next(), "is-advance", "is-devance" );

    } else if ( e.direction === Hammer.DIRECTION_RIGHT ) {
        moveGallery( $_tapped.prev(), "is-devance", "is-advance" );
    }
},


/**
 *
 * @private
 *
 */
closeGallery = function () {
    if ( !$_jsGalleryOverlay.is( ".is-active" ) ) {
        return;
    }

    $_jsGalleryOverlay.removeClass( "is-active" );

    dom.html.removeClass( "is-clipped" );

    setTimeout(function () {
        $_jsGalleryOverlay.detach();
        $_template.remove();

        _image = null;
        _isMore = false;

        $_tapped = null;
        $_template = null;

    }, _transitionTime );
},


/**
 *
 * @private
 *
 */
doImageTransform = function ( gScroll ) {
    var amount = (window.innerHeight - _image.height) / 2,
        transform = gScroll;

    if ( transform > amount ) {
        transform = amount;

    } else if ( transform < 0 ) {
        transform = 0;
    }

    translate3d( $_template.find( ".js-gallery-image" )[ 0 ], 0, px( transform ), 0 );
},


/**
 *
 * @private
 *
 */
moveGallery = function ( $item, aKlass, bKlass ) {
    $_template.addClass( aKlass );

    setTimeout(function () {
        $_template.remove();

        if ( $item.length ) {
            updateGallery( $item, bKlass );

        } else {
            closeGallery();
        }

    }, _swipeDuration );
},


/**
 *
 * @private
 *
 */
updateGallery = function ( $item, klass ) {
    $_template = $_jsTemplateFactory.clone();
    $_tapped = $item;

    var $image = $_tapped.find( "img" ),
        data = $_tapped.data();

    _image = new Image();
    _image.src = $image[ 0 ].src;
    _image.className = "gallery-overlay__image__src";

    onResizer();

    $_template.find( ".js-gallery-link" )[ 0 ].href = data.url;
    $_template.find( ".js-gallery-title" )[ 0 ].innerHTML = data.title;
    $_template.find( ".js-gallery-caption" )[ 0 ].innerHTML = data.caption;
    $_template.find( ".js-gallery-image" )[ 0 ].appendChild( _image );

    $_jsTemplateParent[ 0 ].appendChild( $_template[ 0 ] );

    if ( klass ) {
        $_template.addClass( klass );

        setTimeout(function () {
            $_template.removeClass( klass );

        }, 100 );
    }
},


/**
 *
 * @private
 *
 */
onGalleryNav = function () {
    if ( this.className.indexOf( "gallery-overlay__advance" ) !== -1 ) {
        moveGallery( $_tapped.next(), "is-advance", "is-devance" );

    } else {
        moveGallery( $_tapped.prev(), "is-devance", "is-advance" );
    }
},


/**
 *
 * @private
 *
 */
onGalleryScroll = function () {
    var gScroll = $_jsGalleryOverlay[ 0 ].scrollTop,
        ctxTop = $_template.find( ".js-gallery-context" )[ 0 ].offsetTop,
        scrollPos = gScroll + (window.innerHeight / 2);

    if ( ctxTop < scrollPos ) {
        $_template.find( ".js-gallery-context" ).addClass( "is-active" );

    } else {
        $_template.find( ".js-gallery-context" ).removeClass( "is-active" );
    }

    doImageTransform( gScroll );
},


/**
 *
 * @private
 *
 */
onResizer = function () {
    // Image is null OR we are in the SWIPE zone babay :-P
    if ( !_image || resizes.isSmall() ) {
        return;
    }

    if ( window.innerWidth > config.mobileWidth ) {
        var maxWidth = window.innerWidth - 400,
            maxHeight = window.innerHeight - 160,
            imgDims = calculateAspectRatioFit(
                _image.naturalWidth,
                _image.naturalHeight,
                maxWidth,
                maxHeight
            );

        _image.style.width = px( imgDims.width );
        _image.style.height = px( imgDims.height );
    }
},


/**
 *
 * @private
 *
 */
onGalleryTap = function ( e ) {
    // Maybe find a better way to do this one here
    // pointer-events effing up my christmas biznitch :-P
    if ( _isMore ) {
        onMoreTap();
        return;
    }

    if ( e.target === $_jsGalleryOverlay[ 0 ] ) {
        closeGallery();
    }
},


/**
 *
 * @private
 *
 */
onGalleryOpen = function () {
    updateGallery( $( this ) );

    dom.html.addClass( "is-clipped" );
    dom.body.append( $_jsGalleryOverlay );

    setTimeout(function () {
        $_jsGalleryOverlay.addClass( "is-active" );

    }, 0 );
};


/******************************************************************************
 * Export
*******************************************************************************/
export default gallery;