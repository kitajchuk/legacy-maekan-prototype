/*!
 *
 * App Controller: belt
 *
 * A nice description of what this controller does...
 *
 *
 */
import "app/dom";
import "app/scrolls";
import { emitter, isElementLoadable, loadImages, noop, px, translate3d } from "app/util";


var $_jsBelts = null,

    _isActive = false,
    _isDraggable = false,


/**
 *
 * @public
 *
 */
belt = {
    name: "belt",


    init: function () {
        console.log( "belt initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        emitter.on( "app--scroll", onScroller );

        if ( !_isDraggable ) {
            emitter.on( "app--loadscript--gs-draggable", onDraggableLoad );
        }
    },


    unload: function () {
        this.teardown();
    },


    teardown: function () {
        _isActive = false;

        stopBelts();

        $_jsBelts = null;

        emitter.off( "app--scroll", onScroller );
        emitter.off( "app--loadscript--gs-draggable", onDraggableLoad );
    },


    getElements: function () {
        $_jsBelts = dom.page.find( ".js-belt" );

        return ( $_jsBelts.length );
    }
},


stopBelts = function () {
    var $belt,
        draggable;

    for ( var i = $_jsBelts.length; i--; ) {
        $belt = $_jsBelts.eq( i );

        draggable = $belt.data( "Draggable" );

        if ( draggable ) {
            draggable.kill();
        }

        $belt.removeData();
    }
},


execBelt = function ( $belt ) {
    var $images = $belt.find( ".js-belt-image" ),
        $beltLine = $belt.find( ".js-belt-line" ),
        $midImage = $images.eq( Math.ceil( ($images.length - 1) / 2 ) ),
        draggable,
        startX;

    $belt.addClass( "is-loaded" );

    loadImages( $images, noop ).on( "done", function () {
        sizeBeltImages( $images );

        translate3d( $beltLine[ 0 ], px( -($midImage[ 0 ].offsetLeft) + (window.innerWidth / 2) - ($midImage[ 0 ].clientWidth / 2) ), 0, 0 );

        draggable = Draggable.create(
            $beltLine[ 0 ],
            {
                type: "x",
                edgeResistance: 0.7,
                dragResistance: 0.5,
                bounds: $belt[ 0 ],
                throwProps: true,
                cursor: "grab",
                lockAxis: true,
                onDragStart: function () {
                    $belt.addClass( "is-dragging" );
                },
                onDragEnd: function () {
                    var diffX = Math.abs( draggable.x - startX );

                    if ( diffX > 100 ) {
                        $belt.addClass( "is-dragged" );
                    }

                    $belt.removeClass( "is-dragging" );
                }
            }
        )[ 0 ];

        startX = draggable.x;

        $belt.data( "Draggable", draggable ).addClass( "is-draggable" );
    });
},


sizeBeltImages = function ( $images ) {
    var aspect,
        i;

    for ( i = $images.length; i--; ) {
        // This gives a variance of image sizes that generally looks quite lovely.
        // I maybe, just maybe, might actually be a little proud of this moment here ;-P
        if ( $images[ i ].naturalWidth > $images[ i ].naturalHeight ) {
            aspect = ($images[ i ].naturalHeight / $images[ i ].naturalWidth) * 100;

        } else {
            aspect = ($images[ i ].naturalWidth / $images[ i ].naturalHeight) * 100;
        }

        $images[ i ].style.height = (aspect + "vh");
    }
},


onDraggableLoad = function () {
    _isDraggable = true;

    onScroller();
},


onScroller = function () {
    var $notLoaded = $_jsBelts.not( ".is-loaded" ),
        $belt,
        i;

    // Wait until draggable is ready
    if ( !_isDraggable ) {
        return;
    }

    // All belts loaded
    if ( !$notLoaded.length ) {
        emitter.off( "app--scroll", onScroller );
    }

    for ( i = $notLoaded.length; i--; ) {
        $belt = $_jsBelts.eq( i );

        if ( isElementLoadable( $belt[ i ] ) ) {
            execBelt( $belt );
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default belt;