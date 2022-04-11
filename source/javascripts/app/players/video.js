/*!
 *
 * App Module: /players/video
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/dom";
import "app/players/Scrubber";
import { px, mediabox, emitter, loadImages, isElementLoadable, isElementInViewport, translate3d, noop } from "app/util";
import { easeDuration, animDuration, longDuration } from "app/config";


var $_jsVideos = null,
    $_jsAutoplays = null,

    raf = require( "raf" ),
    caf = require( "caf" ),

    _rafId = null,
    _rafOffset = null,
    _rafPosition = null,
    _isActive = false,


video = {
    name: "video",


    init: function () {
        console.log( "video initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        emitter.on( "app--scroll", onScroller );

        dom.body.on( "click", ".js-video-el, .js-video-poster, .js-video-title", onVideoElClick )
                .on( "mouseenter", ".js-video", onEnterPlayer )
                .on( "mouseleave", ".js-video", onLeavePlayer )
                .on( "mouseenter", ".js-video-scrubber", onEnterScrub )
                .on( "mouseleave", ".js-video-scrubber", onLeaveScrub )
                .on( "mousemove", ".js-video-scrubber", onMoveScrub );

        onScroller();
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsVideos = dom.body.find( ".js-video" );
        $_jsAutoplays = $_jsVideos.filter( ".video--autoplay" );

        return ( $_jsVideos.length );
    },


    teardown: function () {
        _rafId = null;
        _rafOffset = null;
        _isActive = false;

        emitter.off( "app--scroll", onScroller );

        dom.body.off( "click", onVideoElClick )
                .off( "mouseenter", onEnterPlayer )
                .off( "mouseleave", onLeavePlayer )
                .off( "mouseenter", onEnterScrub )
                .off( "mouseleave", onLeaveScrub )
                .off( "mousemove", onMoveScrub );

        stopVideos();

        $_jsVideos = null;
        $_jsAutoplays = null;
    }
},


stopVideos = function () {
    var videos = mediabox.getVideos(),
        $video,
        scrubber,
        id,
        i;

    mediabox.fadeChannelOut( "vid" );

    setTimeout(function () {
        for ( id in videos ) {
            if ( mediabox.getMedia( id ) ) {
                mediabox.destroyMedia( id );
            }
        }

    }, animDuration );

    for ( i = $_jsVideos.length; i--; ) {
        $video = $_jsVideos.eq( i );
        scrubber = $video.data( "Scrubber" );

        if ( scrubber ) {
            scrubber.teardown();
            scrubber = null;
            $video.removeData();
        }
    }
},


execVideo = function ( $video ) {
    var $videoEl = $video.find( ".js-video-el" ),
        $poster = $video.find( ".js-video-poster" );

    $video.addClass( "is-loaded" );

    // Autoplay Video
    if ( $videoEl.prop( "autoplay" ) ) {
        startVideoAuto( $video );

    // Poster Video
    } else if ( $poster.length ) {
        loadImages( $poster, noop );
    }
},


startVideoAuto = function ( $video ) {
    var $videoEl = $video.find( ".js-video-el" ),
        videoData = $video.data();

    mediabox.addVideo({
        id: videoData.id,
        src: videoData.src.split( "|" ),
        element: $videoEl[ 0 ],
        channel: "vid"
    });

    handleVideoAuto( videoData.id );
},


handleVideoAuto = function ( videoId ) {
    var onRaf = function () {
            if ( mediabox.getMedia( videoId ) && mediabox.getMediaProp( videoId, "readyState" ) === 4 ) {
                caf( rafId );

                mediabox.setMediaProp( videoId, "volume", 0 );
                mediabox.setMediaProp( videoId, "muted", true );
                mediabox.playMedia( videoId );

                setTimeout(function () {
                    mediabox.pauseMedia( videoId );

                }, easeDuration );

            } else {
                rafId = raf( onRaf );
            }
        },
        rafId = raf( onRaf );
},


startVideo = function ( $video, callback ) {
    var $videoEl = $video.find( ".js-video-el" ),
        $thumbEl = $video.find( ".js-video-thumb" ),
        thumbData = $thumbEl.data(),
        videoData = $video.data(),
        mediaData = {
            addVideo: [{
                id: videoData.id,
                src: videoData.src.split( "|" ),
                element: $videoEl[ 0 ],
                channel: "vid"
            }]
        };

    if ( $thumbEl.length ) {
        mediaData.addVideo.push({
            id: thumbData.id,
            src: thumbData.src.split( "|" ),
            element: $thumbEl[ 0 ],
            channel: "vid"
        });
    }

    mediabox.addMedia( mediaData );

    handleVideo( videoData, $video, thumbData, callback );
},


handleVideo = function ( videoData, $video, thumbData, callback ) {
    var $progress = $video.find( ".js-video-progress" ),
        $poster = $video.find( ".js-video-poster" ),
        $title = $video.find( ".js-video-title" ),
        $time = $video.find( ".js-media-time" ),
        $duration = $video.find( ".js-media-duration" ),
        scrubber = new Scrubber( "video", videoData, {
            $module: $video,
            $progress: $progress,
            $scrubber: $progress.parent(),
            $time: $time,
            $duration: $duration
        }),
        onRaf = function () {
            if ( mediabox.getMedia( videoData.id ) && mediabox.getMediaProp( videoData.id, "readyState" ) === 4 && mediabox.getMediaProp( thumbData.id, "readyState" ) === 4 ) {
                caf( rafId );

                mediabox.setMediaProp( thumbData.id, "volume", 0 );
                mediabox.setMediaProp( thumbData.id, "muted", true );

                if ( $.isFunction( callback ) ) {
                    callback();
                }

            } else {
                rafId = raf( onRaf );
            }
        },
        rafId = raf( onRaf );

    // Store scrubber instance
    $video.data( "Scrubber", scrubber );

    mediabox.addMediaEvent( videoData.id, "play", function () {
        $poster.addClass( "is-inactive" );
        $title.addClass( "is-inactive" );
        $video.addClass( "is-hovered" );

    }).addMediaEvent( videoData.id, "ended", function () {
        mediabox.stopMedia( videoData.id ).setMediaProp( videoData.id, "currentTime", 0 );

        $poster.removeClass( "is-inactive" );
        $title.removeClass( "is-inactive" );
        $video.removeClass( "is-hovered" );

        // Reset Scrubber
        scrubber.resetUI();
    });
},


onEnterPlayer = function () {
    var $this = $( this ),
        videoId = $this.data( "id" );

    try {
        clearTimeout( $this.data( "timeout" ) );

    } catch ( error ) {}

    if ( mediabox.getMedia( videoId ) ) {
        if ( mediabox.isPlaying( videoId ) ) {
            $this.addClass( "is-hovered" );
        }
    }
},


onLeavePlayer = function () {
    var $this = $( this );

    $this.data( "timeout", setTimeout(function () {
        $this.removeClass( "is-hovered" );

    }, longDuration ));
},


onEnterScrub = function ( e ) {
    var $this = $( this ),
        $video = $this.closest( ".js-video" ),
        $thumb = $video.find( ".js-video-thumb" ),
        videoId = $video.data( "id" );

    try {
        clearTimeout( $this.data( "timeout" ) );

    } catch ( error ) {}

    onMoveScrub.call( this, e );

    function onRaf() {
        _rafId = raf( onRaf );

        var percent = _rafOffset / $this[ 0 ].clientWidth,
            time = percent * mediabox.getMediaProp( videoId, "duration" );

        $thumb[ 0 ].currentTime = time;

        translate3d( $thumb[ 0 ], px( _rafPosition ), 0, 0 );
    }

    _rafId = raf( onRaf );

    $this.addClass( "is-hovered" );
    $thumb.addClass( "is-active" );
},


onMoveScrub = function ( e ) {
    var $this = $( this ),
        $video = $this.closest( ".js-video" ),
        $progress = $this.find( ".js-video-progress" ),
        $thumb = $video.find( ".js-video-thumb" ),

        realOffset = (e.clientX - $progress[ 0 ].getBoundingClientRect().left),
        maxPosition = ($this[ 0 ].clientWidth - ($thumb[ 0 ].offsetWidth / 2)) - 16,
        minPosition = 16 + ($thumb[ 0 ].offsetWidth / 2),
        setPosition;

    // Determine how to cap the offset

    // If we are within range of the minimum
    if ( realOffset <= minPosition ) {
        setPosition = Math.max( minPosition, realOffset );

    // If we are within range of the maximum
    } else if ( realOffset >= maxPosition ) {
        setPosition = Math.min( maxPosition, realOffset );

    // If we are in between, the "safe" zone
    } else {
        setPosition = realOffset;
    }

    _rafOffset = realOffset;
    _rafPosition = setPosition;
},


onLeaveScrub = function () {
    var $this = $( this ),
        $video = $this.closest( ".js-video" ),
        $thumb = $video.find( ".js-video-thumb" );

    $this.data( "timeout", setTimeout(function () {
        caf( _rafId );

        _rafId = null;
        _rafOffset = null;

        $this.removeClass( "is-hovered" );
        $thumb.removeClass( "is-active" );

    }, longDuration ));
},


onVideoElClick = function () {
    var $this = $( this ),
        $video = $this.closest( ".js-video" ),
        videoId = $video.data( "id" ),
        handler = function () {
            mediabox.setVolume( videoId, 0 );
            mediabox.playMedia( videoId );
            mediabox.fadeVolumeIn( videoId );
        };

    // Ignore autoplaying video Elements
    if ( $this.prop( "autoplay" ) ) {
        return;
    }

    Scrubber.stopChannels();

    if ( !mediabox.getMedia( videoId ) ) {
        startVideo( $video, handler );

    } else {
        if ( mediabox.isPlaying( videoId ) ) {
            mediabox.fadeVolumeOut( videoId );

        } else {
            handler();
        }
    }
},


onScroller = function () {
    var $notLoaded = $_jsVideos.not( ".is-loaded" ),
        $video,
        $auto,
        autoId,
        i;

    // All videos loaded and no autoplay videos
    if ( !$notLoaded.length && !$_jsAutoplays.length ) {
        emitter.off( "app--scroll", onScroller );
    }

    for ( i = $notLoaded.length; i--; ) {
        $video = $notLoaded.eq( i );

        if ( isElementLoadable( $video[ 0 ] ) ) {
            execVideo( $video );
        }
    }

    for ( i = $_jsAutoplays.length; i--; ) {
        $auto = $_jsAutoplays.eq( i );
        autoId = $auto.data( "id" );

        // Skip anything not loaded yet
        if ( !mediabox.getMedia( autoId ) ) {
            continue;
        }

        if ( isElementInViewport( $auto[ i ] ) ) {
            if ( !mediabox.isPlaying( autoId ) ) {
                mediabox.playMedia( autoId );

                dom.html.addClass( "is-cinematic-moment" );
            }

        } else if ( mediabox.isPlaying( autoId ) ) {
            mediabox.pauseMedia( autoId );

            dom.html.removeClass( "is-cinematic-moment" );
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default video;