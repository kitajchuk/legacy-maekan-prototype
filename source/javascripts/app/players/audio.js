/*!
 *
 * App Module: /players/audio
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/dom";
import "app/players/Scrubber";
import { mediabox, emitter, isElementInViewport } from "app/util";
import { animDuration, longDuration, hammerDefaults } from "app/config";


var $_jsAudios = null,
    $_jsControllers = null,

    Hammered = require( "Hammered" ),

    _isActive = false,


audio = {
    name: "audio",


    init: function () {
        console.log( "audio initialized" );
    },


    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    onload: function () {
        emitter.on( "app--scroll", onScroller );

        dom.body.on( "mouseenter", ".js-audio", onEnterAudio )
                .on( "mouseleave", ".js-audio", onLeaveAudio );

        prepAudios();
    },


    unload: function () {
        this.teardown();
    },


    getElements: function () {
        $_jsAudios = dom.body.find( ".js-audio" );
        $_jsControllers = dom.body.find( ".js-controller--audio" );

        return ( $_jsControllers.length );
    },


    teardown: function () {
        _isActive = false;

        emitter.off( "app--scroll", onScroller );

        dom.html.removeClass( "is-audio-active" );

        dom.body.off( "mouseenter", onEnterAudio )
                .off( "mouseleave", onLeaveAudio );

        stopAudios();

        $_jsAudios = null;
        $_jsControllers = null;
    }
},


prepAudios = function () {
    var controllerHammered,
        $controller,
        $target,
        i;

    // Bind controllers to audio modules / vice versa
    for ( i = $_jsControllers.length; i--; ) {
        $controller = $_jsControllers.eq( i );
        $target = $( $controller.data( "target" ) );
        controllerHammered = new Hammered( $controller[ 0 ], hammerDefaults );

        $controller.data({
            $target: $target,
            hammered: controllerHammered
        });
        $target.data({
            $controller: $controller
        });

        controllerHammered.on( "tap", ".js-controller--audio", onStartAudio );
    }
},


stopAudios = function () {
    var controllerData,
        $controller,
        scrubber,
        audios = mediabox.getAudios(),
        $audio,
        id,
        i;

    mediabox.fadeChannelOut( "sfx" );
    mediabox.fadeChannelOut( "bgm" );

    setTimeout(function () {
        for ( id in audios ) {
            if ( mediabox.getMedia( id ) ) {
                mediabox.destroyMedia( id );
            }
        }

    }, animDuration );

    for ( i = $_jsControllers.length; i--; ) {
        $controller = $_jsControllers.eq( i );
        controllerData = $controller.data();
        controllerData.hammered.off( "tap", onStartAudio );
        $controller.removeData();
    }

    for ( i = $_jsAudios.length; i--; ) {
        $audio = $_jsAudios.eq( i );
        scrubber = $audio.data( "Scrubber" );
        scrubber.teardown();
        scrubber = null;
        $audio.removeData();
    }
},


execAudio = function ( $audio, callback ) {
    var audioData = $audio.data();

    mediabox.addAudio({
        id: audioData.id,
        src: audioData.src.split( "|" ),
        channel: audioData.channel,
        onloaded: function () {
            $audio.addClass( "is-loaded" );

            if ( $.isFunction( callback ) ) {
                callback();
            }
        }
    });

    handleAudio( $audio, audioData );
},


handleAudio = function ( $audio, audioData ) {
    var $duration = $audio.find( ".js-media-duration" ),
        $progress = $audio.find( ".js-audio-progress" ),
        $time = $audio.find( ".js-media-time" ),
        scrubber = new Scrubber( "audio", audioData, {
            $module: $audio,
            $progress: $progress,
            $scrubber: $progress.parent(),
            $time: $time,
            $duration: $duration
        });

    // Store scrubber instance
    $audio.data( "Scrubber", scrubber );

    mediabox.addMediaEvent( audioData.id, "play", function () {
        dom.html.addClass( "is-audio-active" );

        $audio.addClass( "is-active" );

        audioData.$controller.addClass( "is-active" );

    }).addMediaEvent( audioData.id, "pause", function () {
        dom.html.removeClass( "is-audio-active" );

        audioData.$controller.removeClass( "is-active" );

    }).addMediaEvent( audioData.id, "ended", function () {
        mediabox.stopMedia( audioData.id ).setMediaProp( audioData.id, "currentTime", 0 );

        dom.html.removeClass( "is-audio-active" );

        $audio.removeClass( "is-hovered" );

        audioData.$controller.removeClass( "is-active" );

        // Reset Scrubber
        scrubber.resetUI();
    });
},


onEnterAudio = function () {
    var $this = $( this ),
        audioId = $this.data( "id" );

    try {
        clearTimeout( $this.data( "timeout" ) );

    } catch ( error ) {}

    if ( mediabox.getMedia( audioId ) && $this.is( ".is-active" ) ) {
        if ( mediabox.isPlaying( audioId ) ) {
            $this.addClass( "is-hovered" );
        }
    }
},


onLeaveAudio = function () {
    var $this = $( this );

    $this.data( "timeout", setTimeout(function () {
        $this.removeClass( "is-hovered" );

    }, longDuration ));
},


onStartAudio = function () {
    var $this = $( this ),
        targetData = $this.data(),
        audioData = targetData.$target.data(),
        handler = function () {
            mediabox.setVolume( audioData.id, 0 );
            mediabox.playMedia( audioData.id );
            mediabox.fadeVolumeIn( audioData.id );
        };

    Scrubber.stopChannels();

    // If Audio is not loaded into MediaBox
    if ( !mediabox.getMedia( audioData.id ) ) {
        execAudio( targetData.$target, handler );

    // Pause / Play loaded Audio
    } else {
        if ( mediabox.isPlaying( audioData.id ) ) {
            mediabox.fadeVolumeOut( audioData.id );

        } else {
            handler();
        }
    }
},


onScroller = function () {
    var $notLoaded = $_jsAudios.not( ".is-loaded" ),
        $this,
        i;

    // All audio loaded
    if ( !$notLoaded.length ) {
        emitter.off( "app--scroll", onScroller );
    }

    for ( i = $notLoaded.length; i--; ) {
        $this = $notLoaded.eq( i );

        if ( !mediabox.getMedia( $this.data( "id" ) ) && isElementInViewport( $this[ 0 ] ) ) {
            execAudio( $this );
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default audio;