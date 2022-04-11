/*!
 *
 * App Module: /players/Scrubber
 *
 * A nice description of what this module does...
 *
 *
 */
import "app/dom";
import { mediabox, parseTime, px } from "app/util";
import { easeDuration, hammerDefaults } from "app/config";


var Tween = require( "Tween" ),
    Easing = require( "Easing" ),
    Hammered = require( "Hammered" ),


stopChannels = function () {
    mediabox.fadeChannelOut( "sfx" );
    mediabox.fadeChannelOut( "bgm" );
    mediabox.fadeChannelOut( "vid" );
},


updateCurrentTime = function ( $time, $progress, ellapsed ) {
    var $scrubber = $progress.parent(),
        $duration = $time.next( ".js-media-duration" ),
        offsetLeft = $progress[ 0 ].clientWidth - ($time[ 0 ].clientWidth / 2),
        offsetMax = $scrubber[ 0 ].clientWidth - ($duration[ 0 ].clientWidth + $time[ 0 ].clientWidth + 20);

    $time.text( parseTime( ellapsed ) );
    $time[ 0 ].style.left = px( Math.min( offsetLeft, offsetMax ) );

    if ( offsetLeft >= offsetMax ) {
        $duration.addClass( "is-static" );

    } else {
        $duration.removeClass( "is-static" );
    }
},


onLoadedMetaData = function ( data, ui ) {
    var duration = mediabox.getMediaProp( data.id, "duration" );

    ui.$duration.text( parseTime( duration ) );
},


onTimeUpdate = function ( data, ui ) {
    var duration = mediabox.getMediaProp( data.id, "duration" ),
        ellapsed = mediabox.getMediaProp( data.id, "currentTime" ),
        percent = ((ellapsed / duration) * 100) + "%";

    ui.$progress[ 0 ].style.width = percent;

    updateCurrentTime( ui.$time, ui.$progress, ellapsed );
},


onScrubPan = function ( data, ui, e ) {
    var width = e.srcEvent.clientX - ui.$progress[ 0 ].getBoundingClientRect().left,
        percent = width / ui.$scrubber[ 0 ].clientWidth,
        time = percent * mediabox.getMediaProp( data.id, "duration" );

    mediabox.pauseMedia( data.id );

    ui.$progress[ 0 ].style.width = px( width );

    updateCurrentTime( ui.$time, ui.$progress, time );
},


onScrubPanEnd = function ( data, ui, e ) {
    var width = e.srcEvent.clientX - ui.$progress[ 0 ].getBoundingClientRect().left,
        percent = width / ui.$scrubber[ 0 ].clientWidth,
        time = percent * mediabox.getMediaProp( data.id, "duration" );

    stopChannels();

    mediabox.setMediaProp( data.id, "currentTime", time ).playMedia( data.id );
},


onScrubTap = function ( data, ui, e ) {
    var width = e.srcEvent.clientX - ui.$progress[ 0 ].getBoundingClientRect().left,
        percent,
        time;

    mediabox.pauseMedia( data.id );

    new Tween({
        to: width,
        from: ui.$progress[ 0 ].clientWidth,
        ease: Easing.easeOutCubic,
        update: function ( w ) {
            percent = w / ui.$scrubber[ 0 ].clientWidth;
            time = percent * mediabox.getMediaProp( data.id, "duration" );

            ui.$progress[ 0 ].style.width = px( w );

            updateCurrentTime( ui.$time, ui.$progress, time );
        },
        complete: function ( w ) {
            percent = w / ui.$scrubber[ 0 ].clientWidth;
            time = percent * mediabox.getMediaProp( data.id, "duration" );

            stopChannels();

            mediabox.setMediaProp( data.id, "currentTime", time ).playMedia( data.id );

            updateCurrentTime( ui.$time, ui.$progress, time );
        },
        duration: easeDuration
    });
},


/**
 *
 * @public
 * @namespace app.players.Scrubber
 * @memberof app.players
 * @description Handles scrub-related processes for media content.
 *
 */
Scrubber = function () {
    return this.init.apply( this, arguments );
};


/**
 *
 * @public
 * @static
 * @method stopChannels
 * @memberof app.players.Scrubber
 * @description Stop all actively playing media channels.
 *
 */
Scrubber.stopChannels = stopChannels;


Scrubber.prototype = {
    constructor: Scrubber,


    /**
     *
     * @public
     * @method init
     * @memberof app.players.Scrubber
     * @param {string} type The media type
     * @param {object} data The media DOM data
     * @param {object} ui The media UI Elements
        <ul>
            <li>ui.$module - The media container</li>
            <li>ui.$progress - The media current progress bar</li>
            <li>ui.$scrubber - The media scrub container</li>
            <li>ui.$time - The media current time</li>
            <li>ui.$duration - The media total duration</li>
        </ul>
     * @description Initialize the scrubber UI and Events.
     *
     */
    init: function ( type, data, ui ) {
        this.type = type;
        this.ui = ui;
        this.data = data;

        this.onScrubTap = function ( e ) {
            onScrubTap( data, ui, e );
        };
        this.onScrubPan = function ( e ) {
            onScrubPan( data, ui, e );
        };
        this.onScrubPanEnd = function ( e ) {
            onScrubPanEnd( data, ui, e );
        };
        this.onLoadedMetaData = function () {
            onLoadedMetaData( data, ui );
        };
        this.onTimeUpdate = function () {
            onTimeUpdate( data, ui );
        };

        this.hammered = new Hammered( this.ui.$module[ 0 ], hammerDefaults );
        this.hammered.on( "panend", (".js-" + this.type + "-scrubber"), this.onScrubPanEnd );
        this.hammered.on( "panleft", (".js-" + this.type + "-scrubber"), this.onScrubPan );
        this.hammered.on( "panright", (".js-" + this.type + "-scrubber"), this.onScrubPan );
        this.hammered.on( "tap", (".js-" + this.type + "-scrubber"), this.onScrubTap );

        mediabox.addMediaEvent( data.id, "loadedmetadata", this.onLoadedMetaData )
                .addMediaEvent( data.id, "timeupdate", this.onTimeUpdate );
    },


    /**
     *
     * @public
     * @method teardown
     * @memberof app.players.Scrubber
     * @description Remove events associated with this instance.
     *
     */
    teardown: function () {
        this.hammered.off( "panend", this.onScrubPanEnd );
        this.hammered.off( "panleft", this.onScrubPan );
        this.hammered.off( "panright", this.onScrubPan );
        this.hammered.off( "tap", this.onScrubTap );
    },


    /**
     *
     * @public
     * @method resetUI
     * @memberof app.players.Scrubber
     * @description Reset the media scrubber UI to default states.
     *
     */
    resetUI: function () {
        this.ui.$progress[ 0 ].style.width = px( 0 );
        this.ui.$time.text( "" );
        this.ui.$duration.removeClass( "is-static" );
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default Scrubber;