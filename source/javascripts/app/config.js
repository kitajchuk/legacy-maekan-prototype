/*!
 *
 * App Module: /config
 *
 * @namespace config
 * @memberof app
 *
 *
 */
import "app/detect";


var config = {
    easeDuration: 600,
    midiDuration: 400,
    animDuration: 800,
    longDuration: 1000,
    mobileWidth: 768,
    navbarSize: 80,
    hammerDefaults: (detect.isTouch() ? null : {
        // Disable cssProps for non-touch experiences
        cssProps: {
            contentZoomingString: false,
            tapHighlightColorString: false,
            touchCalloutString: false,
            touchSelectString: false,
            userDragString: false,
            userSelectString: false
        }
    })
};


export default config;