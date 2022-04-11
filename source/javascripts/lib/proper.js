/*!
 *
 * ProperJS Javascript
 * @author: kitajchuk
 * @url: http://blkpdx.com
 * @git: https://github.com/ProperJS
 *
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Brandon Lee Kitajchuk
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */
(function ( window ) {

    var _modules = {};

    window.require = function ( key ) {
        var module = _modules[ key ] || window[ key ];

        if ( !module ) {
            throw new Error( "Module " + key + " is not defined." );
        }

        return module;
    };

    window.provide = function ( key, val ) {
        if ( !window[ key ] ) {
            window[ key ] = val
        }

        return (_modules[ key ] = val);
    };

})( window );
/*!
 *
 * Adapted from https://gist.github.com/paulirish/1579671 which derived from 
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 * 
 * requestAnimationFrame polyfill by Erik Möller.
 * Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
 * 
 * MIT license
 *
 * @raf
 *
 */
(function ( window ) {

"use strict";

if ( !Date.now ) {
    Date.now = function () {
        return new Date().getTime();
    };
}

(function() {
    var vendors = ["webkit", "moz", "ms", "o"];

    for ( var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i ) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
        window.cancelAnimationFrame = (window[vp + "CancelAnimationFrame"] || window[vp + "CancelRequestAnimationFrame"]);
    }

    if ( /iP(ad|hone|od).*OS 6/.test( window.navigator.userAgent ) || !window.requestAnimationFrame || !window.cancelAnimationFrame ) {
        var lastTime = 0;

        window.requestAnimationFrame = function ( callback ) {
            var now = Date.now(),
                nextTime = Math.max( lastTime + 16, now );

            return setTimeout(function() {
                callback( lastTime = nextTime );

            }, (nextTime - now) );
        };

        window.cancelAnimationFrame = clearTimeout;
    }

    // Expose
    window.raf = window.requestAnimationFrame;
    window.caf = window.cancelAnimationFrame;
}());

})( window );
/*!
 *
 * Event / Animation cycle manager
 *
 * @Controller
 * @author: kitajchuk
 *
 *
 */
(function ( window, undefined ) {


//"use strict";


// Private animation functions
var raf = window.requestAnimationFrame,
    caf = window.cancelAnimationFrame;


/**
 *
 * Event / Animation cycle manager
 * @constructor Controller
 * @requires raf
 * @memberof! <global>
 *
 */
var Controller = function () {
    return this.init.apply( this, arguments );
};

Controller.prototype = {
    constructor: Controller,

    /**
     *
     * Controller constructor method
     * @memberof Controller
     * @method Controller.init
     *
     */
    init: function () {
        /**
         *
         * Controller event handlers object
         * @memberof Controller
         * @member _handlers
         * @private
         *
         */
        this._handlers = {};

        /**
         *
         * Controller unique ID
         * @memberof Controller
         * @member _uid
         * @private
         *
         */
        this._uid = 0;

        /**
         *
         * Started iteration flag
         * @memberof Controller
         * @member _started
         * @private
         *
         */
        this._started = false;

        /**
         *
         * Paused flag
         * @memberof Controller
         * @member _paused
         * @private
         *
         */
        this._paused = false;

        /**
         *
         * Timeout reference
         * @memberof Controller
         * @member _cycle
         * @private
         *
         */
        this._cycle = null;
    },

    /**
     *
     * Controller go method to start frames
     * @memberof Controller
     * @method go
     *
     */
    go: function ( fn ) {
        if ( this._started && this._cycle ) {
            return this;
        }

        this._started = true;

        var self = this,
            anim = function () {
                self._cycle = raf( anim );

                if ( self._started ) {
                    if ( typeof fn === "function" ) {
                        fn();
                    }
                }
            };

        anim();
    },

    /**
     *
     * Pause the cycle
     * @memberof Controller
     * @method pause
     *
     */
    pause: function () {
        this._paused = true;

        return this;
    },

    /**
     *
     * Play the cycle
     * @memberof Controller
     * @method play
     *
     */
    play: function () {
        this._paused = false;

        return this;
    },

    /**
     *
     * Stop the cycle
     * @memberof Controller
     * @method stop
     *
     */
    stop: function () {
        caf( this._cycle );

        this._paused = false;
        this._started = false;
        this._cycle = null;

        return this;
    },

    /**
     *
     * Controller add event handler
     * @memberof Controller
     * @method on
     * @param {string} event the event to listen for
     * @param {function} handler the handler to call
     *
     */
    on: function ( event, handler ) {
        var events = event.split( " " );

        // One unique ID per handler
        handler._jsControllerID = this.getUID();

        for ( var i = events.length; i--; ) {
            if ( typeof handler === "function" ) {
                if ( !this._handlers[ events[ i ] ] ) {
                    this._handlers[ events[ i ] ] = [];
                }

                // Handler can be stored with multiple events
                this._handlers[ events[ i ] ].push( handler );
            }
        }

        return this;
    },

    /**
     *
     * Controller remove event handler
     * @memberof Controller
     * @method off
     * @param {string} event the event to remove handler for
     * @param {function} handler the handler to remove
     *
     */
    off: function ( event, handler ) {
        if ( !this._handlers[ event ] ) {
            return this;
        }

        // Remove a single handler
        if ( handler ) {
            this._off( event, handler );

        // Remove all handlers for event
        } else {
            this._offed( event );
        }

        return this;
    },

    /**
     *
     * Controller fire an event
     * @memberof Controller
     * @method fire
     * @param {string} event the event to fire
     *
     */
    fire: function ( event ) {
        if ( !this._handlers[ event ] ) {
            return this;
        }

        var args = [].slice.call( arguments, 1 );

        for ( var i = this._handlers[ event ].length; i--; ) {
            this._handlers[ event ][ i ].apply( this, args );
        }

        return this;
    },

    /**
     *
     * Get a unique ID
     * @memberof Controller
     * @method getUID
     * @returns number
     *
     */
    getUID: function () {
        this._uid = (this._uid + 1);

        return this._uid;
    },

    /**
     *
     * Controller internal off method assumes event AND handler are good
     * @memberof Controller
     * @method _off
     * @param {string} event the event to remove handler for
     * @param {function} handler the handler to remove
     * @private
     *
     */
    _off: function ( event, handler ) {
        for ( var i = 0, len = this._handlers[ event ].length; i < len; i++ ) {
            if ( handler._jsControllerID === this._handlers[ event ][ i ]._jsControllerID ) {
                this._handlers[ event ].splice( i, 1 );

                break;
            }
        }
    },

    /**
     *
     * Controller completely remove all handlers and an event type
     * @memberof Controller
     * @method _offed
     * @param {string} event the event to remove handler for
     * @private
     *
     */
    _offed: function ( event ) {
        for ( var i = this._handlers[ event ].length; i--; ) {
            this._handlers[ event ][ i ] = null;
        }

        delete this._handlers[ event ];
    }
};


// Expose
window.provide( "Controller", Controller );

})( window );
/*!
 *
 * Debounce methods
 * Sourced from here:
 * http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 *
 * @debounce
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * Limit method calls
 * @memberof! <global>
 * @method debounce
 * @param {function} callback The method handler
 * @param {number} threshold The timeout delay in ms
 * @param {boolean} execAsap Call function at beginning or end of detection period
 *
 */
var debounce = function ( callback, threshold, execAsap ) {
    var timeout = null;
    
    return function debounced() {
        var args = arguments,
            context = this;
        
        function delayed() {
            if ( !execAsap ) {
                callback.apply( context, args );
            }
            
            timeout = null;
        }
        
        if ( timeout ) {
            clearTimeout( timeout );
            
        } else if ( execAsap ) {
            callback.apply( context, args );
        }
        
        timeout = setTimeout( delayed, (threshold || 100) );
    };
};


// Expose
window.provide( "debounce", debounce );


})( window );
/*!
 *
 * A base set of easing methods
 * Most of which were found here:
 * https://gist.github.com/gre/1650294
 *
 * @Easing
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * Easing functions
 * @namespace Easing
 * @memberof! <global>
 *
 */
var Easing = {
    /**
     *
     * Produce a linear ease
     * @method linear
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    linear: function ( t ) { return t; },
    
    /**
     *
     * Produce a swing ease like in jQuery
     * @method swing
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    swing: function ( t ) { return (1-Math.cos( t*Math.PI ))/2; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuad
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInQuad: function ( t ) { return t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuad
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutQuad: function ( t ) { return t*(2-t); },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuad
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutQuad: function ( t ) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInCubic
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInCubic: function ( t ) { return t*t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutCubic
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutCubic: function ( t ) { return (--t)*t*t+1; },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutCubic
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutCubic: function ( t ) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuart
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInQuart: function ( t ) { return t*t*t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuart
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutQuart: function ( t ) { return 1-(--t)*t*t*t; },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuart
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutQuart: function ( t ) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
    
    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuint
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInQuint: function ( t ) { return t*t*t*t*t; },
    
    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuint
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeOutQuint: function ( t ) { return 1+(--t)*t*t*t*t; },
    
    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuint
     * @param {number} t Difference in time
     * @memberof Easing
     * @returns a new t value
     *
     */
    easeInOutQuint: function ( t ) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
};


// Expose
window.provide( "Easing", Easing );


})( window );
/*!
 *
 * A simple tween class using requestAnimationFrame
 *
 * @Tween
 * @author: kitajchuk
 *
 */
(function ( window, Easing, undefined ) {


"use strict";


var defaults = {
    ease: Easing.linear,
    duration: 600,
    from: 0,
    to: 0,
    delay: 0,
    update: function () {},
    complete: function () {}
};


/**
 *
 * Tween function
 * @constructor Tween
 * @requires raf
 * @requires Easing
 * @param {object} options Tween animation settings
 * <ul>
 * <li>duration - How long the tween will last</li>
 * <li>from - Where to start the tween</li>
 * <li>to - When to end the tween</li>
 * <li>update - The callback on each iteration</li>
 * <li>complete - The callback on end of animation</li>
 * <li>ease - The easing function to use</li>
 * <li>delay - How long to wait before animation</li>
 * </ul>
 * @memberof! <global>
 *
 */
var Tween = function ( options ) {
    // Normalize options
    options = (options || {});

    // Normalize options
    for ( var i in defaults ) {
        if ( options[ i ] === undefined ) {
            options[ i ] = defaults[ i ];
        }
    }

    var tweenDiff = (options.to - options.from),
        startTime = null,
        rafTimer = null,
        isStopped = false;

    function animate( rafTimeStamp ) {
        if ( isStopped ) {
            return;
        }

        if ( startTime === null ) {
            startTime = rafTimeStamp;
        }

        var animDiff = (rafTimeStamp - startTime),
            tweenTo = (tweenDiff * options.ease( animDiff / options.duration )) + options.from;

        if ( typeof options.update === "function" ) {
            options.update( tweenTo );
        }

        if ( animDiff > options.duration ) {
            if ( typeof options.complete === "function" ) {
                options.complete( options.to );
            }

            cancelAnimationFrame( rafTimer );

            rafTimer = null;

            return false;
        }

        rafTimer = requestAnimationFrame( animate );
    }

    setTimeout(function () {
        rafTimer = requestAnimationFrame( animate );

    }, options.delay );

    this.stop = function () {
        isStopped = true;

        cancelAnimationFrame( rafTimer );

        rafTimer = null;
    };
};


// Expose
window.provide( "Tween", Tween );

})( window, window.require( "Easing" ) );
/*!
 *
 * A basic scrollto function without all the fuss
 *
 * @scroll2
 * @author: kitajchuk
 *
 */
(function ( window, Tween, Easing, undefined ) {


"use strict";


/**
 *
 * Window scroll2 function
 * @method scroll2
 * @requires Tween
 * @param {object} options Tween animation settings
 * <ul>
 * <li>duration - How long the tween will last</li>
 * <li>complete - The callback on end of animation</li>
 * <li>ease - The easing function to use</li>
 * <li>x/y - The axis to tween, where its going to land</li>
 * </ul>
 * @memberof! <global>
 *
 */
var scroll2 = function ( options ) {
    // Get current window positions
    var position = {
        x: (window.scrollX || document.documentElement.scrollLeft),
        y: (window.scrollY || document.documentElement.scrollTop)
    };

    // Normalize options
    options = (options || {});

    // Normalize easing method
    options.ease = (options.ease || Easing.swing);

    // Normalize duration
    options.duration = (options.duration || 600);

    // Normalize from
    options.from = ( options.y !== undefined ) ? position.y : position.x;

    // Normalize to
    options.to = ( options.y !== undefined ) ? options.y : options.x;

    // Apply update method
    options.update = function ( t ) {
        // Vertical scroll
        if ( options.y !== undefined ) {
            window.scrollTo( position.x, t );

        // Horizontal scroll
        } else if ( options.x !== undefined ) {
            window.scrollTo( t, position.y );
        }
    };

    return new Tween( options );
};


// Expose
window.provide( "scroll2", scroll2 );

})( window, window.require( "Tween" ), window.require( "Easing" ) );
/*!
 *
 * Window scroll event controller
 *
 * @ScrollController
 * @author: kitajchuk
 *
 *
 */
(function ( window, Controller, undefined ) {


"use strict";


// Current scroll position
var _currentY = null,

    // Singleton
    _instance = null;

/**
 *
 * Window scroll event controller
 * @constructor ScrollController
 * @augments Controller
 * @requires Controller
 * @memberof! <global>
 *
 * @fires scroll
 * @fires scrolldown
 * @fires scrollup
 * @fires scrollmax
 * @fires scrollmin
 *
 */
var ScrollController = function () {
    // Singleton
    if ( !_instance ) {
        _instance = this;

        // Call on parent cycle
        this.go(function () {
            var currentY = _instance.getScrollY(),
                isStill = (currentY === _currentY),
                isScroll = (currentY !== _currentY),
                isScrollUp = (currentY < _currentY),
                isScrollDown = (currentY > _currentY),
                isScrollMax = (currentY !== _currentY && _instance.isScrollMax()),
                isScrollMin = (currentY !== _currentY && _instance.isScrollMin());

            // Fire blanket scroll event
            if ( isScroll ) {
                /**
                 *
                 * @event scroll
                 *
                 */
                _instance.fire( "scroll" );
            }

            // Fire scrollup and scrolldown
            if ( isScrollDown ) {
                /**
                 *
                 * @event scrolldown
                 *
                 */
                _instance.fire( "scrolldown" );

            } else if ( isScrollUp ) {
                /**
                 *
                 * @event scrollup
                 *
                 */
                _instance.fire( "scrollup" );
            }

            // Fire scrollmax and scrollmin
            if ( isScrollMax ) {
                /**
                 *
                 * @event scrollmax
                 *
                 */
                _instance.fire( "scrollmax" );

            } else if ( isScrollMin ) {
                /**
                 *
                 * @event scrollmin
                 *
                 */
                _instance.fire( "scrollmin" );
            }

            _currentY = currentY;
        });
    }

    return _instance;
};

ScrollController.prototype = new Controller();

/**
 *
 * Returns the current window vertical scroll position
 * @memberof ScrollController
 * @method getScrollY
 * @returns number
 *
 */
ScrollController.prototype.getScrollY = function () {
    return (window.scrollY || document.documentElement.scrollTop);
};

/**
 *
 * Get the max document scrollable height
 * @memberof ScrollController
 * @method getScrollMax
 * @returns number
 *
 */
ScrollController.prototype.getScrollMax = function () {
    return (document.documentElement.offsetHeight - window.innerHeight);
};

/**
 *
 * Determines if scroll position is at maximum for document
 * @memberof ScrollController
 * @method isScrollMax
 * @returns boolean
 *
 */
ScrollController.prototype.isScrollMax = function () {
    return (this.getScrollY() >= (document.documentElement.offsetHeight - window.innerHeight));
};

/**
 *
 * Determines if scroll position is at minimum for document
 * @memberof ScrollController
 * @method isScrollMin
 * @returns boolean
 *
 */
ScrollController.prototype.isScrollMin = function () {
    return (this.getScrollY() <= 0);
};


// Expose
window.provide( "ScrollController", ScrollController );

})( window, window.require( "Controller" ) );
/*!
 *
 * Window resize / orientationchange event controller
 *
 * @ResizeController
 * @author: kitajchuk
 *
 *
 */
(function ( window, Controller, undefined ) {


"use strict";


// Current window viewport
var _currentView = {
        width: null,
        height: null,
        orient: null
    },

    // Singleton
    _instance = null;

/**
 *
 * Window resize / orientationchange event controller
 * @constructor ResizeController
 * @augments Controller
 * @requires Controller
 * @memberof! <global>
 *
 * @fires resize
 * @fires resizedown
 * @fires resizeup
 * @fires orientationchange
 * @fires orientationportrait
 * @fires orientationlandscape
 *
 */
var ResizeController = function () {
    // Singleton
    if ( !_instance ) {
        _instance = this;

        // Call on parent cycle
        this.go(function () {
            var currentView = _instance.getViewport(),
                isStill = (currentView.width === _currentView.width && currentView.height === _currentView.height),
                isResize = (currentView.width !== _currentView.width || currentView.height !== _currentView.height),
                isResizeUp = (currentView.width > _currentView.width || currentView.height > _currentView.height),
                isResizeDown = (currentView.width < _currentView.width || currentView.height < _currentView.height),
                isOrientation = (currentView.orient !== _currentView.orient),
                isOrientationPortrait = (currentView.orient !== _currentView.orient && currentView.orient !== 90),
                isOrientationLandscape = (currentView.orient !== _currentView.orient && currentView.orient === 90);

            // Fire blanket resize event
            if ( isResize ) {
                /**
                 *
                 * @event resize
                 *
                 */
                _instance.fire( "resize" );
            }

            // Fire resizeup and resizedown
            if ( isResizeDown ) {
                /**
                 *
                 * @event resizedown
                 *
                 */
                _instance.fire( "resizedown" );

            } else if ( isResizeUp ) {
                /**
                 *
                 * @event resizeup
                 *
                 */
                _instance.fire( "resizeup" );
            }

            // Fire blanket orientationchange event
            if ( isOrientation ) {
                /**
                 *
                 * @event orientationchange
                 *
                 */
                _instance.fire( "orientationchange" );
            }

            // Fire orientationportrait and orientationlandscape
            if ( isOrientationPortrait ) {
                /**
                 *
                 * @event orientationportrait
                 *
                 */
                _instance.fire( "orientationportrait" );

            } else if ( isOrientationLandscape ) {
                /**
                 *
                 * @event orientationlandscape
                 *
                 */
                _instance.fire( "orientationlandscape" );
            }

            _currentView = currentView;
        });
    }

    return _instance;
};

ResizeController.prototype = new Controller();

/**
 *
 * Returns the current window viewport specs
 * @memberof ResizeController
 * @method getViewport
 * @returns object
 *
 */
ResizeController.prototype.getViewport = function () {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        orient: ("orientation" in window) ? Math.abs( window.orientation ) : null
    };
};

/**
 *
 * Tells if the viewport is in protrait mode
 * @memberof ResizeController
 * @method isPortrait
 * @returns boolean
 *
 */
ResizeController.prototype.isPortrait = function () {
    return (this.getViewport().orient !== 90);
};

/**
 *
 * Tells if the viewport is in landscape mode
 * @memberof ResizeController
 * @method isLandscape
 * @returns boolean
 *
 */
ResizeController.prototype.isLandscape = function () {
    return (this.getViewport().orient === 90);
};


// Expose
window.provide( "ResizeController", ResizeController );

})( window, window.require( "Controller" ) );
/*!
 *
 * Handles history pushstate/popstate with async option
 * If history is not supported, falls back to hashbang!
 *
 * @PushState
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * A simple pushState Class
 * Supported events with .on():
 * <ul>
 * <li>popstate</li>
 * <li>beforestate</li>
 * <li>afterstate</li>
 * </ul>
 * @constructor PushState
 * @memberof! <global>
 *
 */
var PushState = function () {
    return this.init.apply( this, arguments );
};

PushState.prototype = {
    constructor: PushState,
    
    /**
     *
     * Expression match #
     * @memberof PushState
     * @member _rHash
     * @private
     *
     */
    _rHash: /#/,
    
    /**
     *
     * Expression match http/https
     * @memberof PushState
     * @member _rHTTPs
     * @private
     *
     */
    _rHTTPs: /^http[s]?:\/\/.*?\//,
    
    /**
     *
     * Flag whether pushState is enabled
     * @memberof PushState
     * @member _pushable
     * @private
     *
     */
    _pushable: ("history" in window && "pushState" in window.history),
    
    /**
     *
     * Fallback to hashchange if needed. Support:
     * <ul>
     * <li>Internet Explorer 8</li>
     * <li>Firefox 3.6</li>
     * <li>Chrome 5</li>
     * <li>Safari 5</li>
     * <li>Opera 10.6</li>
     * </ul>
     * @memberof PushState
     * @member _hashable
     * @private
     *
     */
    _hashable: ("onhashchange" in window),
    
    /**
     *
     * PushState init constructor method
     * @memberof PushState
     * @method PushState.init
     * @param {object} options Settings for PushState
     * <ul>
     * <li>options.async</li>
     * <li>options.caching</li>
     * <li>options.handle404</li>
     * <li>options.handle500</li>
     * </ul>
     *
     */
    init: function ( options ) {
        var url = window.location.href;
        
        /**
         *
         * Flag whether state is enabled
         * @memberof PushState
         * @member _enabled
         * @private
         *
         */
        this._enabled = false;
        
        /**
         *
         * Flag when hash is changed by PushState
         * This allows appropriate replication of popstate
         * @memberof PushState
         * @member _ishashpushed
         * @private
         *
         */
        this._ishashpushed = false;
        
        /**
         *
         * Unique ID ticker
         * @memberof PushState
         * @member _uid
         * @private
         *
         */
        this._uid = 0;
        
        /**
         *
         * Stored state objects
         * @memberof PushState
         * @member _states
         * @private
         *
         */
        this._states = {};
        
        /**
         *
         * Stored response objects
         * @memberof PushState
         * @member _responses
         * @private
         *
         */
        this._responses = {};
        
        /**
         *
         * Event callbacks
         * @memberof PushState
         * @member _callbacks
         * @private
         *
         */
        this._callbacks = {};
        
        /**
         *
         * Flag whether to use ajax
         * @memberof PushState
         * @member _async
         * @private
         *
         */
        this._async = ( options && options.async !== undefined ) ? options.async : true;
        
        /**
         *
         * Flag whether to use cached responses
         * @memberof PushState
         * @member _caching
         * @private
         *
         */
        this._caching = ( options && options.caching !== undefined ) ? options.caching : true;
        
        /**
         *
         * Flag whether to handle 404 pages
         * @memberof PushState
         * @member _handle404
         * @private
         *
         */
        this._handle404 = ( options && options.handle404 !== undefined ) ? options.handle404 : true;
        
        /**
         *
         * Flag whether to handle 500 pages
         * @memberof PushState
         * @member _handle500
         * @private
         *
         */
        this._handle500 = ( options && options.handle500 !== undefined ) ? options.handle500 : true;
        
        // Set initial state
        this._states[ url ] = {
            uid: this.getUID(),
            cached: false
        };

        // Enable the popstate event
        this._stateEnable();
    },
    
    /**
     *
     * Bind a callback to an event
     * @memberof PushState
     * @method on
     * @param {string} event The event to bind to
     * @param {function} callback The function to call
     *
     */
    on: function ( event, callback ) {
        if ( typeof callback === "function" ) {
            if ( !this._callbacks[ event ] ) {
                this._callbacks[ event ] = [];
            }
            
            callback._pushstateID = this.getUID();
            callback._pushstateType = event;
            
            this._callbacks[ event ].push( callback );
        }
    },
    
    /**
     *
     * Push onto the History state
     * @memberof PushState
     * @method push
     * @param {string} url address to push to history
     * @param {function} callback function to call when done
     *
     * @fires beforestate
     * @fires afterstate
     *
     */
    push: function ( url, callback ) {
        var self = this;
        
        // Break on pushing current url
        if ( url === window.location.href && this._stateCached( url ) ) {
            callback( this._responses[ url ], 200 );
            
            return;
        }
        
        this._fire( "beforestate" );
        
        // Break on cached
        if ( this._stateCached( url ) ) {
            this._push( url );
                    
            callback( this._responses[ url ], 200 );
        
        // Push new state    
        } else {
            this._states[ url ] = {
                uid: this.getUID(),
                cached: false
            };
            
            if ( this._async ) {
                this._getUrl( url, function ( response, status ) {
                    self._push( url );
    
                    self._fire( "afterstate", response, status );
                    
                    if ( typeof callback === "function" ) {
                        callback( response, status );
                    }
                });
    
            } else {
                this._push( url );

                this._fire( "afterstate" );
                
                if ( typeof callback === "function" ) {
                    callback();
                }
            }
        }
    },
    
    /**
     *
     * Manually go back in history state
     * @memberof PushState
     * @method goBack
     *
     * @fires backstate
     *
     */
    goBack: function () {
        window.history.back();
        
        this._fire( "backstate" );
    },
    
    /**
     *
     * Manually go forward in history state
     * @memberof PushState
     * @method goForward
     *
     * @fires forwardstate
     *
     */
    goForward: function () {
        window.history.forward();
        
        this._fire( "forwardstate" );
    },
    
    /**
     *
     * Get a unique ID
     * @memberof PushState
     * @method getUID
     * @returns number
     *
     */
    getUID: function () {
        this._uid = (this._uid + 1);
        
        return this._uid;
    },
    
    /**
     *
     * Calls window.history.pushState
     * @memberof PushState
     * @method _push
     * @param {string} url The url to push
     * @private
     *
     */
    _push: function ( url ) {
        if ( this._pushable ) {
            window.history.pushState( this._states[ url ], "", url );
            
        } else {
            this._ishashpushed = true;
            
            window.location.hash = url.replace( this._rHTTPs, "" );
        }
    },
    
    /**
     *
     * Check if state has been cached for a url
     * @memberof PushState
     * @method _stateCached
     * @param {string} url The url to check
     * @private
     *
     */
    _stateCached: function ( url ) {
        var ret = false;
        
        if ( this._caching && this._states[ url ] && this._states[ url ].cached && this._responses[ url ] ) {
            ret = true;
        }
        
        return ret;
    },
    
    /**
     *
     * Cache the response for a url
     * @memberof PushState
     * @method _cacheState
     * @param {string} url The url to cache for
     * @param {object} response The XMLHttpRequest response object
     * @private
     *
     */
    _cacheState: function ( url, response ) {
        if ( this._caching ) {
            this._states[ url ].cached = true;
            this._responses[ url ] = response;
        }
    },
    
    /**
     *
     * Request a url with an XMLHttpRequest
     * @memberof PushState
     * @method _getUrl
     * @param {string} url The url to request
     * @param {function} callback The function to call when done
     * @private
     *
     */
    _getUrl: function ( url, callback ) {
        var handler = function ( res, stat ) {
                try {
                    // Cache if option enabled
                    self._cacheState( url, res );
                    
                    if ( typeof callback === "function" ) {
                        callback( res, (stat ? stat : undefined) );
                    }
                    
                } catch ( error ) {}
            },
            xhr = new XMLHttpRequest(),
            self = this;
        
        xhr.open( "GET", url, true );
        
        xhr.onreadystatechange = function ( e ) {
            if ( this.readyState === 4 ) {
                if ( this.status === 200 ) {
                    handler( this, 200 );
                    
                } else if ( this.status === 404 && self._handle404 ) {
                    handler( this, 404 );
                    
                } else if ( this.status === 500 && self._handle500 ) {
                    handler( this, 500 );
                }
            }
        };
        
        xhr.send();
    },
    
    /**
     *
     * Fire an events callbacks
     * @memberof PushState
     * @method _fire
     * @param {string} event The event to fire
     * @param {string} url The current url
     * @private
     *
     */
    _fire: function ( event, url ) {
        if ( this._callbacks[ event ] ) {
            for ( var i = this._callbacks[ event ].length; i--; ) {
                this._callbacks[ event ][ i ].apply( this, [].slice.call( arguments, 1 ) );
            }
        }
    },
    
    /**
     *
     * Bind this instances state handler
     * @memberof PushState
     * @method _stateEnabled
     * @private
     *
     * @fires popstate
     *
     */
    _stateEnable: function () {
        if ( this._enabled ) {
            return this;
        }

        var self = this,
            handler = function () {
                var url = window.location.href.replace( self._rHash, "/" );
                
                if ( self._stateCached( url ) ) {
                    self._fire( "popstate", url, self._responses[ url ] );
                    
                } else {
                    self._getUrl( url, function ( response, status ) {
                        self._fire( "popstate", url, response, status );
                    });
                }
            };

        this._enabled = true;
        
        if ( this._pushable ) {
            window.addEventListener( "popstate", function ( e ) {
                handler();
                
            }, false );
            
        } else if ( this._hashable ) {
            window.addEventListener( "hashchange", function ( e ) {
                if ( !self._ishashpushed ) {
                    handler();
                    
                } else {
                    self._ishashpushed = false;
                }
                
            }, false );
        }
    }
};


// Expose
window.provide( "PushState", PushState );


})( window );
/*!
 *
 * Parse query string into object literal representation
 *
 * @compat: jQuery, Ender, Zepto
 * @author: @kitajchuk
 *
 *
 */
(function ( context, undefined ) {


"use strict";


/******************************************************************************
 * paramalama
*******************************************************************************/
(function ( factory ) {
    
    if ( typeof define === "function" && define.amd ) {
        define( [ "jquery" ], factory );
        
    } else {
        factory( context.$ );
    }
    
})(function ( $ ) {
    
    var paramalama = function ( str ) {
        var query = decodeURIComponent( str ).match( /[#|?].*$/g ),
            ret = {};
        
        if ( query ) {
            query = query[ 0 ].replace( /^\?|^#|^\/|\/$|\[|\]/g, "" );
            query = query.split( "&" );
            
            for ( var i = query.length; i--; ) {
                var pair = query[ i ].split( "=" ),
                    key = pair[ 0 ],
                    val = pair[ 1 ];
                
                if ( ret[ key ] ) {
                    // #2 https://github.com/kitajchuk/paramalama/issues/2
                    // This supposedly will work as of ECMA-262
                    // This works since we are not passing objects across frame boundaries
                    // and we are not considering Array-like objects. This WILL be an Array.
                    if ( {}.toString.call( ret[ key ] ) !== "[object Array]" ) {
                        ret[ key ] = [ ret[ key ] ];
                    }
                    
                    ret[ key ].push( val );
                    
                } else {
                    ret[ key ] = val;
                }
            }
        }
        
        return ret;
    };
    
    if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = paramalama;
        
    } else {
        context.paramalama = paramalama;

        if ( $ !== undefined ) {
            $.paramalama = paramalama;
        }
    }
    
});


})( this );

/*!
 *
 * Handles wildcard route matching against urls with !num and !slug condition testing
 *
 * @MatchRoute
 * @author: kitajchuk
 *
 */
(function ( window, paramalama, undefined ) {


"use strict";


/**
 *
 * Handles wildcard route matching against urls with !num and !slug condition testing
 * <ul>
 * <li>route = "/some/random/path/:myvar"</li>
 * <li>route = "/some/random/path/:myvar!num"</li>
 * <li>route = "/some/random/path/:myvar!slug"</li>
 * </ul>
 * @constructor MatchRoute
 * @memberof! <global>
 * @requires paramalama
 *
 */
var MatchRoute = function () {
    return this.init.apply( this, arguments );
};

MatchRoute.prototype = {
    constructor: MatchRoute,
    
    /**
     *
     * Expression match http/https
     * @memberof MatchRoute
     * @member _rHTTPs
     * @private
     *
     */
    _rHTTPs: /^http[s]?:\/\/.*?\//,
    
    /**
     *
     * Expression match trail slashes
     * @memberof MatchRoute
     * @member _rTrails
     * @private
     *
     */
    _rTrails: /^\/|\/$/g,
    
    /**
     *
     * Expression match hashbang/querystring
     * @memberof MatchRoute
     * @member _rHashQuery
     * @private
     *
     */
    _rHashQuery: /#.*$|\?.*$/g,
    
    /**
     *
     * Expression match wildcards
     * @memberof MatchRoute
     * @member _rWild
     * @private
     *
     */
    _rWild: /^:/,
    
    /**
     *
     * Expressions to match wildcards with supported conditions
     * @memberof MatchRoute
     * @member _wilders
     * @private
     *
     */
    _wilders: {
        num: /^[0-9]+$/,
        slug: /^[A-Za-z]+[A-Za-z0-9-_.]*$/
    },
    
    
    /**
     *
     * MatchRoute init constructor method
     * @memberof MatchRoute
     * @method init
     * @param {array} routes Config routes can be passed on instantiation
     *
     */
    init: function ( routes ) {
        /**
         *
         * The routes config array
         * @memberof MatchRoute
         * @member _routes
         * @private
         *
         */
        this._routes = ( routes ) ? this._cleanRoutes( routes ) : [];
    },

    /**
     *
     * Get the internal route array
     * @memberof MatchRoute
     * @method MatchRoute.getRoutes
     * @returns {array}
     *
     */
    getRoutes: function () {
        return this._routes;
    },
    
    /**
     *
     * Update routes config array
     * @memberof MatchRoute
     * @method config
     * @param {array} routes to match against
     *
     */
    config: function ( routes ) {
        // Force array on routes
        routes = ( typeof routes === "string" ) ? [ routes ] : routes;

        this._routes = this._routes.concat( this._cleanRoutes( routes ) );
        
        return this;
    },
    
    /**
     *
     * Test a url against a routes config for match validation
     * @memberof MatchRoute
     * @method test
     * @param {string} url to test against routes
     * @returns True or False
     *
     */
    test: function ( url ) {
        return this.parse( url, this._routes ).matched;
    },
    
    /**
     *
     * Match a url against a routes config for matches
     * @memberof MatchRoute
     * @method params
     * @param {string} url to test against routes
     * @returns Array of matching routes
     *
     */
    params: function ( url ) {
        return this.parse( url, this._routes ).params;
    },
    
    /**
     *
     * Compare a url against a specific route
     * @memberof MatchRoute
     * @method compare
     * @param {string} route compare route
     * @param {string} url compare url
     * @returns MatchRoute.parse()
     *
     */
    compare: function ( route, url ) {
        return this.parse( url, [route] );
    },
    
    /**
     *
     * Parse a url for matches against config array
     * @memberof MatchRoute
     * @method parse
     * @param {string} url to test against routes
     * @param {array} routes The routes to test against
     * @returns Object witch match bool and matches array
     *
     */
    parse: function ( url, routes ) {
        var segMatches,
            isStar,
            params,
            match,
            route = this._cleanRoute( url ),
            ruris,
            regex,
            cond,
            uris = route.split( "/" ),
            uLen = uris.length,
            iLen = routes.length,
            ret;
        
        for ( var i = 0; i < iLen; i++ ) {
            // Flag "*" route
            isStar = (routes[ i ] === "*");
            
            // Start fresh each iteration
            // Only one matched route allowed
            ret = {
                matched: false,
                route: null,
                uri: [],
                params: {},
                query: paramalama( url )
            };
            
            ruris = routes[ i ].split( "/" );
            
            // Handle route === "/"
            if ( route === "/" && routes[ i ] === "/" ) {
                ret.matched = true;
                ret.route = routes[ i ];
                ret.uri = "/";
                
                break;
            }
            
            // If the actual url doesn't match the route in segment length,
            // it cannot possibly be considered for matching so just skip it
            if ( ruris.length !== uris.length && !isStar ) {
                continue;
            }
            
            segMatches = 0;
            
            for ( var j = 0; j < uLen; j++ ) {
                // Matched a variable uri segment
                if ( this._rWild.test( ruris[ j ] ) ) {
                    // Try to split on conditions
                    params = ruris[ j ].split( "!" );
                    
                    // The variable segment
                    match = params[ 0 ];
                    
                    // The match condition
                    cond = params[ 1 ];
                    
                    // With conditions
                    if ( cond ) {
                        // We support this condition
                        if ( this._wilders[ cond ] ) {
                            regex = this._wilders[ cond ];
                        }
                        
                        // Test against the condition
                        if ( regex && regex.test( uris[ j ] ) ) {
                            segMatches++;
                            
                            // Add the match to the config data
                            ret.params[ match.replace( this._rWild, "" ) ] = uris[ j ];
                            ret.uri.push( uris[ j ] );
                        }
                    
                    // No conditions, anything goes   
                    } else {
                        segMatches++;
                        
                        // Add the match to the config data
                        ret.params[ match.replace( this._rWild, "" ) ] = uris[ j ];
                        ret.uri.push( uris[ j ] );
                    }
                
                // Defined segment always goes   
                } else {
                    if ( uris[ j ] === ruris[ j ] ) {
                        segMatches++;
                        
                        ret.uri.push( uris[ j ] );
                    }
                }
            }
            
            // Handle a uri segment match OR "*" wildcard everything
            if ( segMatches === uris.length || isStar ) {
                ret.matched = true;
                ret.route = routes[ i ];
                ret.uri = ( isStar ) ? route : ret.uri.join( "/" );
                
                break;
            }
        }
        
        return ret;
    },
    
    /**
     *
     * Clean a route string
     * If the route === "/" then it is returned as is
     * @memberof MatchRoute
     * @method _cleanRoute
     * @param {string} route the route to clean
     * @returns cleaned route string
     * @private
     *
     */
    _cleanRoute: function ( route ) {
        if ( route !== "/" ) {
            route = route.replace( this._rHTTPs, "" );
            route = route.replace( this._rTrails, "" );
            route = route.replace( this._rHashQuery, "" );
            route = route.replace( this._rTrails, "" );
        }
        
        if ( route === "" ) {
            route = "/";
        }
        
        return route;
    },
    
    /**
     *
     * Clean an array of route strings
     * @memberof MatchRoute
     * @method _cleanRoutes
     * @param {array} routes the routes to clean
     * @returns cleaned routes array
     * @private
     *
     */
    _cleanRoutes: function ( routes ) {
        for ( var i = routes.length; i--; ) {
            routes[ i ] = this._cleanRoute( routes[ i ] );
        }
        
        return routes;
    }
};


// Expose
window.provide( "MatchRoute", MatchRoute );


})( window, window.paramalama );
/*!
 *
 * Use native element selector matching
 *
 * @matchElement
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * Use native element selector matching
 * @memberof! <global>
 * @method matchElement
 * @param {object} el the element
 * @param {string} selector the selector to match
 * @returns element OR null
 *
 */
var matchElement = function ( el, selector ) {
    var method = ( el.matches ) ? "matches" : ( el.webkitMatchesSelector ) ? 
                                  "webkitMatchesSelector" : ( el.mozMatchesSelector ) ? 
                                  "mozMatchesSelector" : ( el.msMatchesSelector ) ? 
                                  "msMatchesSelector" : ( el.oMatchesSelector ) ? 
                                  "oMatchesSelector" : null;
    
    // Try testing the element agains the selector
    if ( method && el[ method ].call( el, selector ) ) {
        return el;
    
    // Keep walking up the DOM if we can
    } else if ( el !== document.documentElement && el.parentNode ) {
        return matchElement( el.parentNode, selector );
    
    // Otherwise we should not execute an event
    } else {
        return null;
    }
};


// Expose
window.provide( "matchElement", matchElement );


})( window );
/*!
 *
 * Handles basic get routing
 *
 * @Router
 * @author: kitajchuk
 *
 */
(function ( window, PushState, MatchRoute, matchElement, undefined ) {


"use strict";


var _rSameDomain = new RegExp( document.domain ),
    _initDelay = 200,
    _triggerEl;


/**
 *
 * A simple router Class
 * @constructor Router
 * @requires PushState
 * @requires MatchRoute
 * @requires matchElement
 * @memberof! <global>
 *
 */
var Router = function () {
    return this.init.apply( this, arguments );
};

Router.prototype = {
    constructor: Router,
    
    /**
     *
     * Router init constructor method
     * @memberof Router
     * @method init
     * @param {object} options Settings for PushState
     * <ul>
     * <li>options.async</li>
     * <li>options.caching</li>
     * </ul>
     *
     * @fires beforeget
     * @fires afterget
     * @fires get
     *
     */
    init: function ( options ) {
        /**
         *
         * Internal MatchRoute instance
         * @memberof Router
         * @member _matcher
         * @private
         *
         */
        this._matcher = new MatchRoute();
        
        /**
         *
         * Internal PushState instance
         * @memberof Router
         * @member _pusher
         * @private
         *
         */
        this._pusher = null;
        
        /**
         *
         * Event handling callbacks
         * @memberof Router
         * @member _callbacks
         * @private
         *
         */
        this._callbacks = {};
        
        /**
         *
         * Router Store user options
         * @memberof Router
         * @member _options
         * @private
         *
         */
        this._options = options;
        
        /**
         *
         * Router unique ID
         * @memberof Router
         * @member _uid
         * @private
         *
         */
        this._uid = 0;
    },
    
    /**
     *
     * Create PushState instance and add event listener
     * @memberof Router
     * @method bind
     *
     */
    bind: function () {
        var self = this,
            isReady = false;
        
        // Bind GET requests to links
        if ( document.addEventListener ) {
            document.addEventListener( "click", function ( e ) {
                self._handler( this, e );
                
            }, false );
            
        } else if ( document.attachEvent ) {
            document.attachEvent( "onclick", function ( e ) {
                self._handler( this, e );
            });
        }
        
        /**
         *
         * Instantiate PushState
         *
         */
        this._pusher = new PushState( this._options );
        
        /**
         *
         * @event popstate
         *
         */
        this._pusher.on( "popstate", function ( url, data, status ) {
            // Hook around browsers firing popstate on pageload
            if ( isReady ) {
                for ( var i = self._callbacks.get.length; i--; ) {
                    var dat = self._matcher.parse( url, self._callbacks.get[ i ]._routerRoutes );
                    
                    if ( dat.matched ) {
                        break;
                    }
                }
                
                data = {
                    route: self._matcher._cleanRoute( url ),
                    response: data,
                    request: dat,
                    status: status || data.status
                };
                
                self._fire( "popget", url, data, status );
                
            } else {
                isReady = true;
            }
        });
        
        // Manually fire first GET
        // Async this in order to allow .get() to work after instantiation
        setTimeout(function () {
            self._pusher.push( window.location.href, function ( response, status ) {
                self._fire( "get", window.location.href, response, status );
                
                isReady = true;
            });
            
        }, _initDelay );
    },
    
    /**
     *
     * Add an event listener
     * Binding "beforeget" and "afterget" is a wrapper
     * to hook into the PushState classes "beforestate" and "afterstate".
     * @memberof Router
     * @method on
     * @param {string} event The event to bind to
     * @param {function} callback The function to call
     *
     */
    on: function ( event, callback ) {
        this._bind( event, callback );
    },

    /**
     *
     * Remove an event listener
     * @memberof Router
     * @method off
     * @param {string} event The event to unbind
     * @param {function} callback The function to reference
     *
     */
    off: function ( event, callback ) {
        this._unbind( event, callback );
    },

    /**
     *
     * Support router triggers by url
     * @memberof Router
     * @method trigger
     * @param {string} url The url to route to
     *
     */
    trigger: function ( url ) {
        if ( !_triggerEl ) {
            _triggerEl = document.createElement( "a" );
        }

        _triggerEl.href = url;

        this._handler( _triggerEl, {
            target: _triggerEl
        });
    },
    
    /**
     *
     * Bind a GET request route
     * @memberof Router
     * @method get
     * @param {string} route route to match
     * @param {function} callback function to call when route is requested
     *
     */
    get: function ( route, callback ) {
        // Add route to matcher
        this._matcher.config( [route] );
        
        // Bind the route to the callback
        if ( callback._routerRoutes ) {
            callback._routerRoutes.push( route );
            
        } else {
            callback._routerRoutes = [route];
        }
        
        // When binding multiple routes to a single
        // callback, we need to make sure the callbacks
        // routes array is updated above but the callback
        // only gets added to the list once.
        if ( callback._routerRoutes.length === 1 ) {
            this._bind( "get", callback );
        }
    },

    /**
     *
     * Get a sanitized route for a url
     * @memberof Router
     * @method getRouteForUrl
     * @param {string} url The url to use
     * @returns {string}
     *
     */
    getRouteForUrl: function ( url ) {
        return this._matcher._cleanRoute( url );
    },

    /**
     *
     * Get the match data for a url against the routes config
     * @memberof Router
     * @method getRouteDataForUrl
     * @param {string} url The url to use
     * @returns {object}
     *
     */
    getRouteDataForUrl: function ( url ) {
        return this._matcher.parse( url, this._matcher.getRoutes() ).params;
    },
    
    /**
     *
     * Get a unique ID
     * @memberof Router
     * @method getUID
     * @returns number
     *
     */
    getUID: function () {
        this._uid = (this._uid + 1);
        
        return this._uid;
    },
    
    /**
     * Compatible event preventDefault
     * @memberof Router
     * @method _preventDefault
     * @param {object} e The event object
     * @private
     *
     */
    _preventDefault: function ( e ) {
        if ( !this._options.preventDefault ) {
            return this;
        }
        
        if ( e.preventDefault ) {
            e.preventDefault();
            
        } else {
            e.returnValue = false;
        }
    },
    
    /**
     * GET click event handler
     * @memberof Router
     * @method _handler
     * @param {object} el The event context element
     * @param {object} e The event object
     * @private
     *
     * @fires get
     *
     */
    _handler: function ( el, e ) {
        var self = this,
            elem = (matchElement( el, "a" ) || matchElement( e.target, "a" ));
        
        if ( elem ) {
            if ( _rSameDomain.test( elem.href ) && elem.href.indexOf( "#" ) === -1 && this._matcher.test( elem.href ) ) {
                this._preventDefault( e );
                
                for ( var i = this._callbacks.get.length; i--; ) {
                    var data = this._matcher.parse( elem.href, this._callbacks.get[ i ]._routerRoutes );
                    
                    if ( data.matched ) {
                        this._fire( "preget", elem.href, data );
                        break;
                    }
                }
                
                this._pusher.push( elem.href, function ( response, status ) {
                    self._fire( "get", elem.href, response, status );
                });
            }
        }
    },
    
    /**
     *
     * Bind an event to a callback
     * @memberof Router
     * @method _bind
     * @param {string} event what to bind on
     * @param {function} callback fired on event
     * @private
     *
     */
    _bind: function ( event, callback ) {
        if ( typeof callback === "function" ) {
            if ( !this._callbacks[ event ] ) {
                this._callbacks[ event ] = [];
            }
            
            callback._jsRouterID = this.getUID();
            
            this._callbacks[ event ].push( callback );
        }
    },

    /**
     *
     * Unbind an event to a callback(s)
     * @memberof Router
     * @method _bind
     * @param {string} event what to bind on
     * @param {function} callback fired on event
     * @private
     *
     */
    _unbind: function ( event, callback ) {
        if ( !this._callbacks[ event ] ) {
            return this;
        }

        // Remove a single callback
        if ( callback ) {
            for ( var i = 0, len = this._callbacks[ event ].length; i < len; i++ ) {
                if ( callback._jsRouterID === this._callbacks[ event ][ i ]._jsRouterID ) {
                    this._callbacks[ event ].splice( i, 1 );
    
                    break;
                }
            }

        // Remove all callbacks for event
        } else {
            for ( var j = this._callbacks[ event ].length; j--; ) {
                this._callbacks[ event ][ j ] = null;
            }
    
            delete this._callbacks[ event ];
        }
    },
    
    /**
     *
     * Fire an event to a callback
     * @memberof Router
     * @method _fire
     * @param {string} event what to bind on
     * @param {string} url fired on event
     * @param {string} response html from responseText
     * @param {number} status The request status
     * @private
     *
     */
    _fire: function ( event, url, response, status ) {
        var i;
        
        // GET events have routes and are special ;-P
        if ( event === "get" ) {
            for ( i = this._callbacks[ event ].length; i--; ) {
                var data = this._matcher.parse( url, this._callbacks[ event ][ i ]._routerRoutes );
                
                if ( data.matched ) {
                    this._callbacks[ event ][ i ].call( this, {
                        route: this._matcher._cleanRoute( url ),
                        response: response,
                        request: data,
                        status: status
                    });
                }
            }
        
        // Fires basic timing events "beforeget" / "afterget"    
        } else if ( this._callbacks[ event ] ) {
            for ( i = this._callbacks[ event ].length; i--; ) {
                this._callbacks[ event ][ i ].call( this, response );
            }
        }
    }
};


// Expose
window.provide( "Router", Router );


})( window, window.PushState, window.MatchRoute, window.matchElement );
/*!
 *
 * Asynchronous webpage transitioning with pushstate management.
 *
 * @PageController
 * @author: kitajchuk
 *
 * @module
 * - init
 * - isActive
 * - onload
 * - unload
 *
 *
 */
(function ( window, Controller, Router, undefined ) {


"use strict";


// Useful stuff
var _router = null,
    _config = [],
    _modules = [],
    _synced = {
        active: [],
        inactive: []
    },
    _initialized = false,
    _timeBefore = null,
    _timeDelay = 600,
    _timeStamp = null,
    _eventPrefix = "page-controller-",
    _currentRoute = null,
    _isFirstRoute = true,
    _currentQuery = null,
    _currentToString = null,
    _isSamePage = false,

    // Singleton
    _instance = null,


// Private functions
isFunction = function ( fn ) {
    return (typeof fn === "function");
},


isSameObject = function ( o1, o2 ) {
    return (JSON.stringify( o1 ) === JSON.stringify( o2 ));
},


execInit = function ( method ) {
    // One time module initialization
    for ( var i = _modules.length; i--; ) {
        if ( _modules[ i ].__registered && !_modules[ i ].__initialized && isFunction( _modules[ i ].init ) ) {
            _modules[ i ].__initialized = true;
            _modules[ i ].init();
        }
    }
},


execUnload = function () {
    // Unload currently active modules only
    for ( var i = _synced.active.length; i--; ) {
        if ( _synced.active[ i ].__registered && isFunction( _synced.active[ i ].unload ) ) {
            _synced.active[ i ].unload();
        }
    }
},


execOnload = function () {
    // Unload newly active modules only
    for ( var i = _synced.active.length; i--; ) {
        if ( _synced.active[ i ].__registered && isFunction( _synced.active[ i ].onload ) ) {
            _synced.active[ i ].onload();
        }
    }
},


getRouteDataToString = function ( data ) {
    var ret = data.uri,
        i;

    for ( i in data.query ) {
        ret += "-" + i + "-" + data.query[ i ];
    }

    for ( i in data.params ) {
        ret += "-" + i + "-" + data.params[ i ];
    }

    return ret;
},


/**
 * @fires page-controller-router-synced-modules
 */
syncModules = function () {
    _synced.active = [];
    _synced.inactive = [];

    for ( var i = _modules.length; i--; ) {
        var module = _modules[ i ];

        if ( _modules[ i ].__registered && isFunction( module.isActive ) ) {
            // isActive method should rebuild module variables
            if ( module.isActive() ) {
                _synced.active.push( module );

            } else {
                _synced.inactive.push( module );
            }
        }
    }

    _instance.fire( (_eventPrefix + "router-synced-modules"), _synced );
},


onRouterResponse = function ( data ) {
    function __route() {
        if ( (Date.now() - _timeStamp) >= _instance._transitionTime ) {
            _instance.stop();

            handleRouterResponse( data );
        }
    }

    _instance.go( __route );
},


onPopGetRouter = function ( data ) {
    onPreGetRouter( data.request );

    setTimeout( function () {
        handleRouterResponse( data );

    }, _instance._transitionTime );
},


/**
 * @fires page-controller-router-transition-out
 * @fires page-controller-router-samepage
 */
onPreGetRouter = function ( data ) {
    var isSameRequest = (_currentToString === getRouteDataToString( data ));

    if ( isSameRequest ) {
        _instance.fire( (_eventPrefix + "router-samepage"), data );
        _isSamePage = true;
        return;
    }

    _timeBefore = Date.now();

    if ( !_isFirstRoute ) {
        _instance.fire( (_eventPrefix + "router-transition-out"), data );
    }
},


/**
 * @fires page-controller-router-refresh-document
 * @fires page-controller-router-transition-in
 * @fires page-controller-router-idle
 */
handleRouterResponse = function ( res ) {
    if ( _isSamePage ) {
        _isSamePage = false;
        return;
    }

    var data = {
        response: res.response.responseText,
        request: res.request,
        status: res.status
    };

    _currentRoute = data.request.uri;
    _currentQuery = data.request.query;
    _currentToString = getRouteDataToString( data.request );

    // Think of this as window.onload, happens once
    if ( _isFirstRoute ) {
        _isFirstRoute = false;
        syncModules();
        execOnload();

    // All other Router sequences fall here
    } else {
        // Allow transition duration to take place
        setTimeout(function () {
            // 0.1 Sync modules and unload active ones
            syncModules();
            execUnload();

            // 0.2 Refresh the document content
            _instance.fire( (_eventPrefix + "router-refresh-document"), data.response );

            // 0.3 Sync modules and onload newly active ones
            syncModules();
            execOnload();

            // 0.4 Trigger transition of content to come back in
            _instance.fire( (_eventPrefix + "router-transition-in"), data );

        }, _instance._transitionTime );
    }
};


/**
 *
 * Page transition manager
 * @constructor PageController
 * @augments Controller
 * @requires Controller
 * @requires Router
 * @memberof! <global>
 * @param {object} options Settings for control features
 * <ul>
 * <li>transitionTime - Number</li>
 * <li>routerOptions - Object</li>
 * </ul>
 *
 */
var PageController = function ( options ) {
    // Singleton
    if ( !_instance ) {
        _instance = this;

        options = (options || {});

        /**
         *
         * The duration of your transition for page content
         * @memberof PageController
         * @member _transitionTime
         * @private
         *
         */
        this._transitionTime = (options.transitionTime || _timeDelay);

        /**
         *
         * The flag to anchor to top of page on transitions
         * @memberof PageController
         * @member _routerOptions
         * @private
         *
         */
        this._routerOptions = (options.routerOptions || {
            async: true,
            caching: true,
            preventDefault: true
        });
    }

    return _instance;
};

PageController.prototype = new Controller();

/**
 *
 * Initialize controller on page
 * @memberof PageController
 * @method initPage
 *
 */
PageController.prototype.initPage = function () {
    if ( _initialized ) {
        return;
    }

    _initialized = true;

    /**
     *
     * Instance of Router
     * @private
     *
     */
    _router = new Router( this._routerOptions );

    if ( _router._matcher.parse( window.location.href, _config ).matched ) {
        _router.bind();
        
        for ( var i = _config.length; i--; ) {
            _router.get( _config[ i ], onRouterResponse );
        }
    
        _router.on( "preget", onPreGetRouter );
        _router.on( "popget", onPopGetRouter );

        execInit();

    } else {
        //console.log( "[PageController : page not in routes]" );
    }
};

/**
 *
 * Set the Router configuration
 * @memberof PageController
 * @method setConfig
 * @param {object} config The config for MatchRoute
 *
 */
PageController.prototype.setConfig = function ( config ) {
    _config = config;
};

/**
 *
 * Set the module configuration
 * @memberof PageController
 * @method setModules
 * @param {object} modules The array of module objects
 *
 */
PageController.prototype.setModules = function ( modules ) {
    if ( !modules ) {
        return;
    }

    for ( var i = modules.length; i--; ) {
        this.addModule( modules[ i ] );
    }
};

/**
 *
 * Add to the module configuration
 * @memberof PageController
 * @method addModule
 * @param {object} module The module object to add
 *
 */
PageController.prototype.addModule = function ( module ) {
    if ( _modules.indexOf( module ) === -1 && isFunction( module.isActive ) && isFunction( module.onload ) && isFunction( module.unload ) ) {
        module.__registered = true;

        _modules.push( module );

    } else {
        throw new Error( "PageController ERROR - All registered modules require isActive, onload and unload methods." );
    }
};

/**
 *
 * Add to the module configuration
 * @memberof PageController
 * @method unregisterModule
 * @param {object} module The module object to unregister
 *
 */
PageController.prototype.unregisterModule = function ( module ) {
    for ( var i = _modules.length; i--; ) {
        if ( _modules[ i ] === module ) {
            _modules[ i ].__registered = false;
        }
    }
};

/**
 *
 * Returns the array of modules
 * @memberof PageController
 * @method getModules
 * @returns array
 *
 */
PageController.prototype.getModules = function () {
    return _modules;
};

/**
 *
 * Returns the MatchRoute config
 * @memberof PageController
 * @method getConfig
 * @returns array
 *
 */
PageController.prototype.getConfig = function () {
    return _config;
};

/**
 *
 * Returns the instances Router
 * @memberof PageController
 * @method getRouter
 * @returns Router
 *
 */
PageController.prototype.getRouter = function () {
    return _router;
};


/**
 *
 * Returns the instances PushState
 * @memberof PageController
 * @method getPusher
 * @returns PushState
 *
 */
PageController.prototype.getPusher = function () {
    return _router._pusher;
};


/**
 *
 * Returns the instances MatchRoute
 * @memberof PageController
 * @method getMatcher
 * @returns MatchRoute
 *
 */
PageController.prototype.getMatcher = function () {
    return _router._matcher;
};


/**
 *
 * Returns the current route pathed
 * @memberof PageController
 * @method getRoute
 * @returns string
 *
 */
PageController.prototype.getRoute = function () {
    return _currentRoute;
};


/**
 *
 * Returns the current query params object
 * @memberof PageController
 * @method getQuery
 * @returns string
 *
 */
PageController.prototype.getQuery = function () {
    return _currentQuery;
};


/**
 *
 * Returns true if current page path equals slug
 * Loose match if no second parameter is passed
 * @memberof PageController
 * @method is
 * @param {string} slug The page slug to check
 * @param {boolean} looseMatch Perform a less strict match
 * @returns boolean
 *
 */
PageController.prototype.is = function ( slug, looseMatch ) {
    var ret = false,
        reg;

    reg = new RegExp( looseMatch ? ("^" + slug) : ("^" + slug + "$") );
    ret = reg.test( _currentRoute );

    return ret;
};


// Expose
window.provide( "PageController", PageController );

})( window, window.require( "Controller" ), window.require( "Router" ) );
/*!
 *
 * Handle lazy-loading images with contextual load conditions.
 *
 * @ImageLoader
 * @author: kitajchuk
 *
 *
 */
(function ( window, document, undefined ) {


"use strict";


var raf = window.requestAnimationFrame,
    caf = window.cancelAnimationFrame,

    _i,
    _all = 0,
    _num = 0,
    _raf = null,
    _ini = false,

    // Holds all "instances"
    // This way we can use a single animator
    _instances = [];


// Should support elements as null, undefined, DOMElement, HTMLCollection, string selector
function setElements( elements ) {
    // Handles string selector
    if ( typeof elements === "string" ) {
        elements = document.querySelectorAll( elements );

    // Handles DOMElement
    } else if ( elements && elements.nodeType === 1 ) {
        elements = [ elements ];
    
    } else if ( !elements ) {
        elements = [];
    }

    // Default:
    // HTMLCollection / Array
    return elements;
}


// Called when instances are created
function initializer( instance ) {
    // Increment ALL
    _all = _all + instance._num2Load;

    // Private instances array
    _instances.push( instance );

    // One stop shopping
    if ( !_ini ) {
        _ini = true;
        animate();
    }
}


// Called on each iteration of the animation cycle
function animate() {
    if ( _num !== _all ) {
        _raf = raf( animate );

        for ( _i = _instances.length; _i--; ) {
            if ( _instances[ _i ]._numLoaded !== _instances[ _i ]._num2Load && _instances[ _i ]._loadType === "async" ) {
                _instances[ _i ].handle();
            }
        }

    } else {
        caf( _raf );

        _raf = null;
        _ini = false;
    }
}


// Simple add class polyfill
function addClass( el, str ) {
    var newClass = str.split( " " ),
        elsClass = el.className.split( " " );

    for ( var i = 0, len = newClass.length; i < len; i++ ) {
        if ( elsClass.indexOf( newClass[ i ] ) === -1 ) {
            elsClass.push( newClass[ i ] );
        }
    }

    el.className = elsClass.join( " " );
}


// Simple remove class polyfill
function removeClass( el, str ) {
    var oldClass = str.split( " " ),
        elsClass = el.className.split( " " );

    for ( var i = 0, len = oldClass.length; i < len; i++ ) {
        if ( elsClass.indexOf( oldClass[ i ] ) !== -1 ) {
            elsClass.splice( elsClass.indexOf( oldClass[ i ] ), 1 );
        }
    }

    el.className = elsClass.join( " " );
}


/**
 *
 * Handle lazy-loading images with unique callback conditions
 * @memberof! <global>
 * @requires raf
 * @constructor ImageLoader
 * @param {object} options Controller settings
 * <ul>
 * <li>elements - The collection of elements to load against</li>
 * <li>property - The property to pull the image source from</li>
 * <li>transitionDelay - The timeout before transition starts</li>
 * <li>transitionDuration - The length of the animation</li>
 * </ul>
 *
 */
var ImageLoader = function () {
    return this.init.apply( this, arguments );
};


/**
 *
 * ClassName for the element loading state
 * @member IS_LOADING
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_LOADING = "-is-lazy-loading";


/**
 *
 * ClassName for the element transitioning state
 * @member IS_TRANSITION
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_TRANSITION = "-is-lazy-transition";


/**
 *
 * ClassName for the elements loaded state
 * @member IS_LOADED
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_LOADED = "-is-lazy-loaded";


/**
 *
 * ClassName to define the element as having been loaded
 * @member IS_HANDLED
 * @memberof ImageLoader
 *
 */
ImageLoader.IS_HANDLED = "-is-lazy-handled";


ImageLoader.prototype = {
    constructor: ImageLoader,

    init: function ( options ) {
        var self = this;

        if ( !options ) {
            throw new Error( "ImageLoader Class requires options to be passed" );
        }

        /**
         *
         * The Collection to load against
         * @memberof ImageLoader
         * @member _elements
         * @private
         *
         */
        this._elements = setElements( options.elements );

        /**
         *
         * The property to get image source from
         * @memberof ImageLoader
         * @member _property
         * @private
         *
         */
        this._property = (options.property || "data-src");

        /**
         *
         * The way to load, async or sync
         * Using "sync" loading requires calling .start() on the instance
         * and the "handle" event will not be utilized, rather each image
         * will be loaded in succession as the previous finishes loading
         * @memberof ImageLoader
         * @member _loadType
         * @private
         *
         */
        this._loadType = (options.loadType || "async");

        /**
         *
         * The current amount of elements lazy loaded
         * @memberof ImageLoader
         * @member _numLoaded
         * @private
         *
         */
        this._numLoaded = 0;

        /**
         *
         * The total amount of elements to lazy load
         * @memberof ImageLoader
         * @member _num2Load
         * @private
         *
         */
        this._num2Load = (this._elements ? this._elements.length : 0);

        /**
         *
         * The delay to execute lazy loading on an element in ms
         * @memberof ImageLoader
         * @member _transitionDelay
         * @default 100
         * @private
         *
         */
        this._transitionDelay = (options.transitionDelay || 100);

        /**
         *
         * The duration on a lazy loaded elements fade in in ms
         * @memberof ImageLoader
         * @member _transitionDuration
         * @default 600
         * @private
         *
         */
        this._transitionDuration = (options.transitionDuration || 600);

        /**
         *
         * This flags that all elements have been loaded
         * @memberof ImageLoader
         * @member _resolved
         * @private
         *
         */
        this._resolved = false;

        /**
         *
         * Defined event namespaced handlers
         * @memberof ImageLoader
         * @member _handlers
         * @private
         *
         */
        this._handlers = {
            data: null,
            load: null,
            done: null,
            error: null,
            update: null
        };

        // Break out if no elements in collection
        if ( !this._elements.length ) {
            return this;
        }

        // Only run animation frame for async loading
        if ( this._loadType === "async" ) {
            initializer( this );

        } else {
            this._syncLoad();
        }
    },

    /**
     *
     * Add a callback handler for the specified event name
     * @memberof ImageLoader
     * @method on
     * @param {string} event The event name to listen for
     * @param {function} handler The handler callback to be fired
     *
     */
    on: function ( event, handler ) {
        this._handlers[ event ] = handler;

        return this;
    },
    
    /**
     *
     * Fire the given event for the loaded element
     * @memberof ImageLoader
     * @method fire
     * @returns bool
     *
     */
    fire: function ( event, element ) {
        var ret = false;

        if ( typeof this._handlers[ event ] === "function" ) {
            ret = this._handlers[ event ].call( this, element );
        }

        return ret;
    },

    /**
     *
     * Iterate over elements and fire the update handler
     * @memberof ImageLoader
     * @method update
     *
     * @fires update
     *
     */
    update: function () {
        var self = this;

        for ( var i = 0, len = this._elements.length; i < len; i++ ) {
            var element = this._elements[ i ];

            this.fire( "update", element );
        }
    },
    
    /**
     *
     * Perform the image loading and set correct values on element
     * @method load
     * @memberof ImageLoader
     * @param {object} $elem element object
     * @param {function} callback optional callback for each load
     *
     * @fires done
     *
     */
    load: function ( element, callback ) {
        var self = this,
            image = null,
            timeout = null,
            isImage = (element.nodeName.toLowerCase() === "img"),
            source = element.getAttribute( this._property );

        element.setAttribute( "data-imageloader", true );

        addClass( element, ImageLoader.IS_LOADING );

        if ( isImage ) {
            image = element;

        } else {
            image = new Image();
        }

        timeout = setTimeout(function () {
            clearTimeout( timeout );

            addClass( element, ImageLoader.IS_TRANSITION );

            image.onload = function () {
                self.fire( "load", element );

                if ( !isImage ) {
                    element.style.backgroundImage = ("url(" + source + ")");

                    image = null;
                }

                addClass( element, ImageLoader.IS_LOADED );

                timeout = setTimeout(function () {
                    clearTimeout( timeout );

                    removeClass( element, ImageLoader.IS_LOADING + " " + ImageLoader.IS_TRANSITION + " " + ImageLoader.IS_LOADED )
                    addClass( element, ImageLoader.IS_HANDLED );

                    if ( (self._numLoaded === self._num2Load) && !self._resolved ) {
                        self._resolved = true;

                        // Fires the predefined "done" event
                        self.fire( "done" );

                    } else if ( typeof callback === "function" ) {
                        // Errors first
                        callback( false );
                    }

                }, self._transitionDuration );
            };

            image.onerror = function () {
                self.fire( "error", element );

                if ( (self._numLoaded === self._num2Load) && !self._resolved ) {
                    self._resolved = true;

                    // Fires the predefined "done" event
                    self.fire( "done" );

                } else if ( typeof callback === "function" ) {
                    // Errors first
                    callback( true );
                }
            };

            image.src = source;

        }, this._transitionDelay );

        return this;
    },

    /**
     *
     * Handles element iterations and loading based on callbacks
     * @memberof ImageLoader
     * @method handle
     *
     * @fires handle
     *
     */
    handle: function () {
        var elems = this._getNotLoaded(),
            self = this;

        for ( var i = 0, len = elems.length; i < len; i++ ) {
            var elem = elems[ i ];

            // Fires the predefined "data" event
            if ( self.fire( "data", elem ) ) {
                _num++;

                self._numLoaded++;

                self.load( elem );
            }
        }
    },

    /**
     *
     * Get all images in the set that have yet to be loaded
     * @memberof ImageLoader
     * @method _getNotLoaded
     * @private
     *
     */
    _getNotLoaded: function () {
        var elems = [];

        for ( var i = 0, len = this._elements.length; i < len; i++ ) {
            if ( !this._elements[ i ].getAttribute( "data-imageloader" ) ) {
                elems.push( this._elements[ i ] );
            }
        }

        return elems;
    },

    /**
     *
     * Support batch synchronous loading of a set of images
     * @memberof ImageLoader
     * @method _syncLoad
     * @private
     *
     */
    _syncLoad: function () {
        var self = this;

        function syncLoad() {
            var elem = self._elements[ self._numLoaded ];

            self._numLoaded++;

            self.load( elem, function ( error ) {
                if ( !error && !self._resolved ) {
                    syncLoad();
                }
            });
        }

        syncLoad();
    }
};


// Expose
window.provide( "ImageLoader", ImageLoader );

})( window,  window.document );
/*!
 *
 * A lightweight manager for HTML5 audio and video.
 *
 * @MediaBox
 * @singleton
 * @author: kitajchuk
 *
 * @useful web pages with information on this stuffs
 * https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
 *
 */
(function ( window, document, Easing, Tween, undefined ) {


"use strict";


/******************************************************************************
 * @Private API
*******************************************************************************/

/**
 *
 * Expression match hashbang/querystring
 * @member rHashQuery
 * @private
 *
 */
var rHashQuery = /[#|?].*$/g,


/**
 *
 * Replace "no" in canPlayType strings
 * @member rNos
 * @private
 *
 */
rNos = /^no$/,


/**
 *
 * Clean up all those typeof's
 * @method isFunction
 * @returns boolean
 * @private
 *
 */
isFunction = function ( fn ) {
    return (typeof fn === "function");
},


/**
 *
 * Test that an object is an Element
 * @method isElement
 * @returns boolean
 * @private
 *
 */
isElement = function ( el ) {
    return (el instanceof HTMLElement);
},


/**
 *
 * Borrowed(ish)
 * Modernizr v3.0.0-alpha.4 on master branch
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
 * @method getAudioSupport
 * @returns object
 * @private
 *
 */
getAudioSupport = function () {
    var elem = document.createElement( "audio" ),
        ret = {};

    try {
        if ( elem.canPlayType ) {
            ret.ogg = elem.canPlayType( 'audio/ogg; codecs="vorbis"' ).replace( rNos, "" );
            ret.mp3 = elem.canPlayType( 'audio/mpeg;' ).replace( rNos, "" );
            ret.opus = elem.canPlayType( 'audio/ogg; codecs="opus"' ).replace( rNos, "" );

            // Mimetypes accepted:
            // developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
            // bit.ly/iphoneoscodecs
            ret.wav = elem.canPlayType( 'audio/wav; codecs="1"' ).replace( rNos, "" );
            ret.m4a = (elem.canPlayType( 'audio/x-m4a;' ) || elem.canPlayType( 'audio/aac;' )).replace( rNos, "" );
        }

    } catch ( e ) {}

    return ret;
},


/**
 *
 * Borrowed(ish)
 * Modernizr v3.0.0-alpha.4 on master branch
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/video.js
 * @method getVideoSupport
 * @returns object
 * @private
 *
 */
getVideoSupport = function () {
    var elem = document.createElement( "video" ),
        ret = {};

    try {
        if ( elem.canPlayType ) {
            ret.ogg = elem.canPlayType( 'video/ogg; codecs="theora"' ).replace( rNos, "" );

            // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
            ret.h264 = elem.canPlayType( 'video/mp4; codecs="avc1.42E01E"' ).replace( rNos, "" );
            ret.webm = elem.canPlayType( 'video/webm; codecs="vp8, vorbis"' ).replace( rNos, "" );
            ret.vp9 = elem.canPlayType( 'video/webm; codecs="vp9"' ).replace( rNos, "" );
            ret.hls = elem.canPlayType( 'application/x-mpegURL; codecs="avc1.42E01E"' ).replace( rNos, "" );
        }

    } catch ( e ) {}

    return ret;
},


/**
 *
 * Get mimetype string from media source
 * @method getMimeForMedia
 * @param {string} src media file source
 * @private
 *
 */
getMimeForMedia = function ( type, src ) {
    var ext = src.split( "." ).pop().toLowerCase().replace( rHashQuery, "" ),
        ret;

    if ( type === "video" ) {
        switch ( ext ) {
            case "webm":
                ret = "video/webm";
                break;
            case "mp4":
            case "m4v":
                ret = "video/mp4";
                break;
            case "ogv":
                ret = "video/ogg";
                break;
        }

    } else {
        switch ( ext ) {
            case "aac":
                ret = "audio/aac";
                break;
            case "m4a":
                ret = "audio/x-m4a";
                break;
            case "mp4":
                ret = "audio/mp4";
                break;
            case "mp1":
            case "mp2":
            case "mp3":
            case "mpg":
            case "mpeg":
                ret = "audio/mpeg";
                break;
            case "oga":
            case "ogg":
                ret = "audio/ogg";
                break;
            case "wav":
                ret = "audio/wav";
                break;
        }
    }

    return ret;
},


/**
 *
 * Get the audio source that should be used
 * @method getCanPlaySource
 * @param {string} media the media type to check
 * @param {array} sources Array of media sources
 * @returns object
 * @private
 *
 */
getCanPlaySource = function ( media, sources ) {
    var source, canPlay;

    for ( var i = 0, len = sources.length; i < len; i++ ) {
        var src = sources[ i ].split( "." ).pop().toLowerCase().replace( rHashQuery, "" );

        if ( MediaBox.support[ media ][ src ] === "probably" || MediaBox.support[ media ][ src ] === "maybe" ) {
            source = sources[ i ];
            canPlay = MediaBox.support[ media ][ src ];
            break;
        }

        if ( (src === "ogv" || src === "oga") && (MediaBox.support[ media ].ogg === "probably" || MediaBox.support[ media ].ogg === "maybe") ) {
            source = sources[ i ];
            canPlay = MediaBox.support[ media ].ogg;
            break;
        }

        if ( (src === "mp4" || src === "m4v") && (MediaBox.support[ media ].h264 === "probably" || MediaBox.support[ media ].h264 === "maybe") ) {
            source = sources[ i ];
            canPlay = MediaBox.support[ media ].h264;
            break;
        }

        if ( src === "aac" && (MediaBox.support[ media ].m4a === "probably" || MediaBox.support[ media ].m4a === "maybe") ) {
            source = sources[ i ];
            canPlay = MediaBox.support[ media ].m4a;
            break;
        }

        if ( (src === "mp1" || src === "mp2" || src === "mpg" || src === "mpeg") && (MediaBox.support[ media ].mp3 === "probably" || MediaBox.support[ media ].mp3 === "maybe") ) {
            source = sources[ i ];
            canPlay = MediaBox.support[ media ].mp3;
            break;
        }

        if ( source ) {
            break;
        }
    }

    return {
        source: source,
        canPlay: canPlay
    };
},


/**
 *
 * MediaBox clear a timeupdate interval for audio/video tracks
 * @method clearPlaybackUpdate
 * @param {object} track The media object
 *
 */
clearPlaybackUpdate = function ( track ) {
    try {
        clearInterval( track._update );

        track._update = null;

    } catch ( error ) {}
},


/**
 *
 * MediaBox crossbrowser create audio context
 * @method createAudioContext
 * @returns instance of audio context
 *
 */
createAudioContext = function () {
    var AudioContext;

    if ( window.AudioContext ) {
        AudioContext = window.AudioContext;

    } else if ( window.webkitAudioContext ) {
        AudioContext = window.webkitAudioContext;
    }

    return ( AudioContext ) ? new AudioContext() : AudioContext;
},


/**
 *
 * MediaBox Open a new XMLHttpRequest
 * @method createRequest
 * @returns instance of audio context
 *
 */
createRequest = function ( url, config, callback ) {
    var xhr = new XMLHttpRequest();

    xhr.open( "GET", url, true );

    if ( config ) {
        for ( var i in config ) {
            xhr[ i ] = config[ i ];
        }
    }

    xhr.onreadystatechange = function ( e ) {
        if ( this.readyState === 4 ) {
            if ( this.status === 200 ) {
                try {
                    if ( !config.responseType ) {
                        this.responseJSON = JSON.parse( this.responseText );
                    }

                    if ( isFunction( callback ) ) {
                        callback( this );
                    }

                } catch ( error ) {
                    throw new Error([
                        error.name,
                        error.message

                    ].join( " : " ));
                }
            }
        }
    };

    xhr.send();

    return xhr;
},


/**
 *
 * MediaBox init constructor for singleton
 * @method init
 * @private
 *
 */
init = function () {
    _instance = this;
},


/**
 *
 * MediaBox information for each channel.
 * These are default channels you can use.
 * <ul>
 * <li>bgm - background music channel</li>
 * <li>sfx - sound effects channel</li>
 * <li>vid - video channel</li>
 * </ul>
 * @member _channels
 * @private
 *
 */
_channels = {
    bgm: {
        volume: 1
    },
    sfx: {
        volume: 1
    },
    vid: {
        volume: 1
    }
},

/**
 *
 * MediaBox holds all audio tracks
 * @member _audio
 * @private
 *
 */
_audio = {},

/**
 *
 * MediaBox holds all video tracks
 * @member _video
 * @private
 *
 */
_video = {},


/**
 *
 * The singleton instance for MediaBox
 * @member _instance
 * @private
 *
 */
_instance = null,


/**
 *
 * Store value for running intervals at 60fps
 * @member _audioContext
 * @private
 *
 */
_60FPS = (1000 / 60),


/**
 *
 * Master audio context instance
 * @member _context
 * @private
 *
 */
_context = createAudioContext(),


/******************************************************************************
 * @Public API
*******************************************************************************/

/**
 *
 * A complete management tool for html5 video and audio context
 * @constructor MediaBox
 * @requires Tween
 * @memberof! <global>
 *
 */
MediaBox = function () {
    return (_instance || init.apply( this, arguments ));
};


/**
 *
 * MediaBox support object
 * @memberof MediaBox
 * @member support
 *
 */
MediaBox.support = {
    audio: getAudioSupport(),
    video: getVideoSupport()
};


/**
 *
 * MediaBox stopped state constant
 * @memberof MediaBox
 * @member STATE_STOPPED
 *
 */
MediaBox.STATE_STOPPED = 0;


/**
 *
 * MediaBox stopping state constant
 * @memberof MediaBox
 * @member STATE_STOPPING
 *
 */
MediaBox.STATE_STOPPING = 1;


/**
 *
 * MediaBox paused state constant
 * @memberof MediaBox
 * @member STATE_PAUSED
 *
 */
MediaBox.STATE_PAUSED = 2;


/**
 *
 * MediaBox playing state constant
 * @memberof MediaBox
 * @member STATE_PLAYING
 *
 */
MediaBox.STATE_PLAYING = 3;


/**
 *
 * MediaBox prototype
 *
 */
MediaBox.prototype = {
    constructor: MediaBox,

    /**
     *
     * MediaBox check if media is loaded via ajax
     * @memberof MediaBox
     * @method isLoaded
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isLoaded: function ( id ) {
        var obj = this.getMedia( id );

        return (obj.loaded === true);
    },

    /**
     *
     * MediaBox check stopped/paused status for audio/video
     * @memberof MediaBox
     * @method isStopped
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isStopped: function ( id ) {
        var obj = this.getMedia( id );

        return (obj.state === MediaBox.STATE_STOPPED);
    },

    /**
     *
     * MediaBox check stopped/paused status for audio/video
     * @memberof MediaBox
     * @method isPaused
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isPaused: function ( id ) {
        var obj = this.getMedia( id );

        return (obj.state === MediaBox.STATE_PAUSED);
    },

    /**
     *
     * MediaBox check playing status for audio/video
     * @memberof MediaBox
     * @method isPlaying
     * @param {string} id reference id for media
     * @returns boolean
     *
     */
    isPlaying: function ( id ) {
        var obj = this.getMedia( id );

        return (obj.state === MediaBox.STATE_PLAYING || obj.state === MediaBox.STATE_STOPPING);
    },

    /**
     *
     * MediaBox set volume for audio OR video
     * @memberof MediaBox
     * @method setVolume
     * @param {string} id reference id for media
     * @param {number} volume the volume to set to
     *
     */
    setVolume: function ( id, volume ) {
        var obj = this.getMedia( id );

        obj._node.volume = volume;

        return _instance;
    },

    /**
     *
     * MediaBox set volume for audio OR video
     * @memberof MediaBox
     * @method getVolume
     * @param {string} id reference id for media
     * @returns number
     *
     */
    getVolume: function ( id ) {
        var obj = this.getMedia( id );

        return obj._node.volume;
    },

    /**
     *
     * MediaBox get an audio nodes property
     * @memberof MediaBox
     * @method getAudioProp
     * @param {string} id Audio id
     * @param {string} prop The property to access
     *
     */
    getMediaProp: function ( id, prop ) {
        var obj = this.getMedia( id );

        if ( obj ) {
            return obj._node[ prop ];
        }
    },

    /**
     *
     * MediaBox set an audio nodes property/attribute
     * @memberof MediaBox
     * @method setAudioProp
     * @param {string} id Audio id
     * @param {string} prop The property to set
     * @param {mixed} value The value to assign
     *
     */
    setMediaProp: function ( id, prop, value ) {
        var obj = this.getMedia( id );

        if ( obj ) {
            obj._node[ prop ] = value;
        }

        return _instance;
    },

    /**
     *
     * MediaBox get an audio nodes attribute
     * @memberof MediaBox
     * @method getAudioAttr
     * @param {string} id Audio id
     * @param {string} prop The property to access
     *
     */
    getMediaAttr: function ( id, prop ) {
        var obj = this.getMedia( id );

        if ( obj ) {
            return obj._node.getAttribute( prop );
        }
    },

    /**
     *
     * MediaBox set an audio nodes attribute
     * @memberof MediaBox
     * @method setAudioAttr
     * @param {string} id Audio id
     * @param {string} prop The property to set
     * @param {mixed} value The value to assign
     *
     */
    setMediaAttr: function ( id, prop, value ) {
        var obj = this.getMedia( id );

        if ( obj ) {
            obj._node.setAttribute( prop, value );
        }

        return _instance;
    },

    /**
     *
     * MediaBox add an audio nodes event listener
     * @memberof MediaBox
     * @method addAudioEvent
     * @param {string} id Audio id to add event for
     * @param {string} event Event to add
     * @param {function} callback The event handler to call
     *
     */
    addMediaEvent: function ( id, event, callback ) {
        var obj = this.getMedia( id );

        if ( obj ) {
            // Capture timeupdate to run at 60fps instead
            if ( event === "timeupdate" ) {
                obj._events.timeupdate = callback;

                return _instance;
            }

            obj._events[ event ] = function () {
                if ( isFunction( callback ) ) {
                    callback.apply( this, arguments );
                }
            };

            obj._node.addEventListener( event, obj._events[ event ], false );
        }

        return _instance;
    },

    /**
     *
     * MediaBox remove an audio nodes event listener
     * @memberof MediaBox
     * @method removeAudioEvent
     * @param {string} id Audio id to remove event for
     * @param {string} event Event to remove
     *
     */
    removeMediaEvent: function ( id, event ) {
        var obj = this.getMedia( id );

        if ( obj ) {
            // Capture timeupdate to run at 60fps instead
            if ( event === "timeupdate" ) {
                clearPlaybackUpdate( obj );
            }

            obj._node.removeEventListener( event, obj._events[ event ], false );

            obj._events[ event ] = null;
        }

        return _instance;
    },

    /**
     *
     * MediaBox play audio node by id
     * @memberof MediaBox
     * @method playAudio
     * @param {string} id reference id for media
     *
     */
    playMedia: function ( id ) {
        var obj = this.getMedia( id );

        if ( obj && this.isLoaded( id ) && (this.isStopped( id ) || this.isPaused( id )) ) {
            obj._node.volume = _channels[ obj.channel ].volume;
            obj._node.play();
            obj.state = MediaBox.STATE_PLAYING;

            if ( !obj._update ) {
                obj._update = setInterval(function () {
                    if ( isFunction( obj._events.timeupdate ) ) {
                        obj._events.timeupdate.call( obj._node, null );
                    }

                }, _60FPS );
            }
        }

        return _instance;
    },

    /**
     *
     * MediaBox stop audio node by id with a paused state
     * @memberof MediaBox
     * @method pauseAudio
     * @param {string} id reference id for media
     *
     */
    pauseMedia: function ( id ) {
        var obj = this.getMedia( id );

        if ( obj && this.isLoaded( id ) && this.isPlaying( id ) ) {
            obj._node.pause();
            obj.state = MediaBox.STATE_PAUSED;

            clearPlaybackUpdate( obj );
        }

        return _instance;
    },

    /**
     *
     * MediaBox stop audio node by id with a stopped state
     * @memberof MediaBox
     * @method stopAudio
     * @param {string} id reference id for media
     *
     */
    stopMedia: function ( id ) {
        var obj = this.getMedia( id );

        if ( obj && this.isLoaded( id ) && this.isPlaying( id ) ) {
            obj._node.pause();
            obj.state = MediaBox.STATE_STOPPED;

            clearPlaybackUpdate( obj );
        }

        return _instance;
    },

    /**
     *
     * MediaBox get audio object by id
     * @memberof getMedia
     * @method getAudio
     * @param {string} id reference id for media
     * @returns object
     *
     */
    getMedia: function ( id ) {
        return _video[ id ] ? _video[ id ] : _audio[ id ];
    },

    /**
     *
     * MediaBox get all audio objects
     * @memberof MediaBox
     * @method getAudios
     * @returns object
     *
     */
    getAudios: function () {
        return _audio;
    },

    /**
     *
     * MediaBox get all video objects
     * @memberof MediaBox
     * @method getVideos
     * @returns object
     *
     */
    getVideos: function () {
        return _video;
    },

    /**
     *
     * MediaBox kill a media object abstractly
     * @memberof MediaBox
     * @method destroyMedia
     * @param {string} id reference id for media
     *
     */
    destroyMedia: function ( id ) {
        var obj = this.getMedia( id );

        this.stopMedia( id );

        if ( obj.type === "audio" ) {
            delete _audio[ id ];

        } else {
            delete _video[ id ];
        }

        return _instance;
    },

    /**
     *
     * MediaBox load media config JSON formatted in a json bundle
     * @memberof MediaBox
     * @method loadMedia
     * @param {string} url The url to the JSON config
     * @param {function} callback The function to fire when done loading
     *
     */
    loadMedia: function ( url, callback ) {
        var self = this;

        createRequest( url, null, function ( xhr ) {
            self.addMedia( xhr.responseJSON );

            if ( isFunction( callback ) ) {
                callback();
            }
        });

        return _instance;
    },

    /**
     *
     * MediaBox add media from bundle json
     * @memberof MediaBox
     * @method addMedia
     * @param {object} bundle Formatted media bundle JSON
     *
     */
    addMedia: function ( bundle ) {
        for ( var m in bundle ) {
            for ( var i = bundle[ m ].length; i--; ) {
                // this.addVideo() / this.addAudio()
                if ( isFunction( this[ m ] ) ) {
                    this[ m ]( bundle[ m ][ i ] );
                }
            }
        }

        return _instance;
    },

    /**
     *
     * MediaBox add a video element
     * @memberof MediaBox
     * @method addVideo
     * @param {object} obj Formatted media bundle
     *
     */
    addVideo: function ( obj ) {
        var id = obj.id,
            src = obj.src,
            props = {
                element: obj.element,
                channel: obj.channel
            };

        // Disallow overrides / Require id and src props
        if ( _video[ id ] || !id || !src ) {
            return _instance;
        }

        // Allow new channels to exist
        if ( !_channels[ props.channel ] ) {
            _channels[ props.channel ] = {};
        }

        // Create video object
        _video[ id ] = {};
        _video[ id ].type = "video";
        _video[ id ].state = MediaBox.STATE_STOPPED;
        _video[ id ].loaded = true;
        _video[ id ].channel = props.channel;
        _video[ id ].sources = src;
        _video[ id ]._source = getCanPlaySource( "video", src );
        _video[ id ]._events = {};
        _video[ id ]._update = null;
        _video[ id ]._node = (props.element || document.createElement( "video" ));
        _video[ id ]._nodeSource = document.createElement( "source" );
        _video[ id ]._nodeSource.src = _video[ id ]._source.source;
        _video[ id ]._nodeSource.type = getMimeForMedia( "video", _video[ id ]._source.source );
        _video[ id ]._node.appendChild( _video[ id ]._nodeSource );

        return _instance;
    },

    /**
     *
     * MediaBox add an audio context
     * @memberof MediaBox
     * @method addAudio
     * @param {object} obj Formatted media bundle
     *
     */
    addAudio: function ( obj ) {
        var id = obj.id,
            src = obj.src,
            props = {
                channel: obj.channel,
                CORS: (obj.CORS || false)
            };

        // Disallow overrides / Require id and src props
        if ( _audio[ id ] || !id || !src ) {
            return _instance;
        }
        
        // Allow new channels to exist
        if ( !_channels[ props.channel ] ) {
            _channels[ props.channel ] = {};
        }

        // Create audio object
        _audio[ id ] = {};
        _audio[ id ].type = "audio";
        _audio[ id ].state = MediaBox.STATE_STOPPED;
        _audio[ id ].loaded = true;
        _audio[ id ].channel = props.channel;
        _audio[ id ].sources = src;
        _audio[ id ]._source = getCanPlaySource( "audio", src );
        _audio[ id ]._events = {};
        _audio[ id ]._update = null;
        _audio[ id ]._node = new Audio( _audio[ id ]._source.source );

        // Get the media as a buffer
        if ( isFunction( obj.onloaded ) && !props.CORS ) {
            createRequest( _audio[ id ]._source.source, {responseType: "arraybuffer"}, function ( xhr ) {
                _context.decodeAudioData( xhr.response, obj.onloaded );
            });
        }

        return _instance;
    },

    /**
     *
     * MediaBox fade in audio/video volume
     * @memberof MediaBox
     * @method fadeVolumeIn
     * @param {string} id string reference id for audio
     * @param {number} duration tween time in ms
     * @param {function} easing optional easing to use
     *
     */
    fadeVolumeIn: function ( id, duration, easing ) {
        var obj = this.getMedia( id ),
            self = this,
            volume;

        if ( obj && obj.state === MediaBox.STATE_PLAYING ) {
            return _instance;
        }

        if ( obj ) {
            volume = _channels[ obj.channel ].volume;

            // Only reset volume and play if object is stopped
            // Object state could be STATE_STOPPING at this point
            if ( obj.state === MediaBox.STATE_STOPPED ) {
                this.playMedia( id );
                this.setVolume( id, 0 );

            } else if ( obj.state === MediaBox.STATE_STOPPING ) {
                obj.state = MediaBox.STATE_PLAYING;
            }

            new Tween({
                to: volume,
                from: 0,
                ease: ( isFunction( easing ) ) ? easing : Easing.linear,
                duration: (duration || 1000),
                update: function ( v ) {
                    self.setVolume( id, v );
                },
                complete: function () {
                    self.setVolume( id, volume );
                }
            });
        }

        return _instance;
    },

    /**
     *
     * MediaBox fade out audio/video volume
     * @memberof MediaBox
     * @method fadeVolumeOut
     * @param {string} id string reference id for audio
     * @param {number} duration tween time in ms
     * @param {function} easing optional easing to use
     *
     */
    fadeVolumeOut: function ( id, duration, easing ) {
        var obj = this.getMedia( id );

        if ( obj && obj.state === MediaBox.STATE_STOPPING ) {
            return _instance;
        }

        var self = this,
            handler = function ( v ) {
                // Check audio state on fadeout in case it is started again
                // before the duration of the fadeout is complete.
                if ( obj.state === MediaBox.STATE_STOPPING ) {
                    self.setVolume( id, (v < 0) ? 0 : v );

                    if ( self.getVolume( id ) === 0 ) {
                        self.stopMedia( id );
                    }
                }
            };

        if ( obj ) {
            obj.state = MediaBox.STATE_STOPPING;

            new Tween({
                to: 0,
                from: self.getVolume( id ),
                ease: ( isFunction( easing ) ) ? easing : Easing.linear,
                duration: (duration || 1000),
                update: handler,
                complete: handler
            });
        }

        return _instance;
    },

    /**
     *
     * MediaBox pause all playing audio for a given channel id
     * @memberof MediaBox
     * @method stopChannel
     * @param {string} channel string reference id for channel
     *
     */
    stopChannel: function ( channel ) {
        var id;

        // Look at video index
        for ( id in _video ) {
            if ( _video[ id ].channel === channel && _video[ id ].state === MediaBox.STATE_PLAYING ) {
                this.pauseMedia( id );
            }
        }

        // Look at audio index
        for ( id in _audio ) {
            if ( _audio[ id ].channel === channel && _audio[ id ].state === MediaBox.STATE_PLAYING ) {
                this.pauseMedia( id );
            }
        }

        return _instance;
    },

    /**
     *
     * MediaBox resume all playing audio for a given channel id
     * @memberof MediaBox
     * @method playChannel
     * @param {string} channel string reference id for channel
     *
     */
    playChannel: function ( channel ) {
        var id;

        // Look at video index
        for ( id in _video ) {
            if ( _video[ id ].channel === channel && _video[ id ].state === MediaBox.STATE_PAUSED ) {
                this.playMedia( id );
            }
        }

        // Look at audio index
        for ( id in _audio ) {
            if ( _audio[ id ].channel === channel && _audio[ id ].state === MediaBox.STATE_PAUSED ) {
                this.playMedia( id );
            }
        }

        return _instance;
    },

    /**
     *
     * MediaBox fade out all playing audio/video for a given channel id
     * @memberof MediaBox
     * @method fadeChannelOut
     * @param {string} channel string reference id for channel
     * @param {number} duration tween time in ms
     *
     */
    fadeChannelOut: function ( channel, duration ) {
        var id;

        // Look at video index
        for ( id in _video ) {
            if ( _video[ id ].channel === channel && _video[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }

        // Look at audio index
        for ( id in _audio ) {
            if ( _audio[ id ].channel === channel && _audio[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }

        return _instance;
    },

    /**
     *
     * MediaBox fade in all playing audio/video for a given channel id
     * @memberof MediaBox
     * @method fadeChannelIn
     * @param {string} channel string reference id for channel
     * @param {number} duration tween time in ms
     *
     */
    fadeChannelIn: function ( channel, duration ) {
        var id;

        // Look at video index
        for ( id in _video ) {
            if ( _video[ id ].channel === channel && _video[ id ].state === MediaBox.STATE_STOPPED ) {
                this.fadeVolumeIn( id, duration );
            }
        }

        // Look at audio index
        for ( id in _audio ) {
            if ( _audio[ id ].channel === channel && _audio[ id ].state === MediaBox.STATE_STOPPED ) {
                this.fadeVolumeIn( id, duration );
            }
        }

        return _instance;
    },

    /**
     *
     * MediaBox crossfade volume between multiple channels
     * @memberof MediaBox
     * @method crossFadeChannel
     * @param {string} channel string reference id for channel
     * @param {string} objId string reference id for object to fade in
     * @param {number} duration tween time in ms
     *
     */
    crossFadeChannel: function ( channel, objId, duration ) {
        var id;
        
        // Look at video index
        for ( id in _video ) {
            if ( _video[ id ].channel === channel && _video[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }

        // Look at audio index
        for ( id in _audio ) {
            if ( _audio[ id ].channel === channel && _audio[ id ].state === MediaBox.STATE_PLAYING ) {
                this.fadeVolumeOut( id, duration );
            }
        }

        return this.fadeVolumeIn( objId, duration );
    },

    /**
     *
     * MediaBox set the property for a channel
     * @memberof MediaBox
     * @method setChannelProp
     * @param {string} id string id reference to channel
     * @param {string} key string prop key
     * @param {string} val prop val
     *
     */
    setChannelProp: function ( id, key, val ) {
        if ( _channels[ id ] ) {
            _channels[ id ][ key ] = val;
        }

        return _instance;
    },

    /**
     *
     * MediaBox get the property for a channel
     * @memberof MediaBox
     * @method getChannelProp
     * @param {string} id string id reference to channel
     * @param {string} key string prop key
     *
     */
    getChannelProp: function ( id, key ) {
        if ( _channels[ id ] ) {
            return _channels[ id ][ key ];
        }
    }
};


// Expose
window.provide( "MediaBox", MediaBox );

})( window,  window.document, window.require( "Easing" ), window.require( "Tween" ) );
/*!
 *
 * A stepped timeout manager
 *
 * @Stagger
 * @author: kitajchuk
 *
 */
(function ( window, undefined ) {


"use strict";


/**
 *
 * A stepped timeout manager
 * @constructor Stagger
 * @memberof! <global>
 *
 */
var Stagger = function () {
    return this.init.apply( this, arguments );
};

Stagger.prototype = {
    constructor: Stagger,
    
    /**
     *
     * Stagger init constructor method
     * @memberof Stagger
     * @method Stagger.init
     * @param {object} options The staggering options
     * <ul>
     * <li>options.delay</li>
     * <li>options.steps</li>
     * </ul>
     *
     */
    init: function ( options ) {
        /**
         *
         * Step callback
         * @memberof Stagger
         * @member Stagger._step
         *
         */
        this._step = null;
        
        /**
         *
         * When iteration callbacks
         * @memberof Stagger
         * @member Stagger._when
         *
         */
        this._when = {};
        
        /**
         *
         * Done callback
         * @memberof Stagger
         * @member Stagger._done
         *
         */
        this._done = null;
        
        /**
         *
         * Timeout delay
         * @memberof Stagger
         * @member Stagger._delay
         *
         */
        this._delay = options.delay || 250;
        
        /**
         *
         * Current step iteration
         * @memberof Stagger
         * @member Stagger._current
         *
         */
        this._current = 0;
        
        /**
         *
         * Number of step occurrences
         * @memberof Stagger
         * @member Stagger._steps
         *
         */
        this._occurrences = options.steps || 0;
        
        /**
         *
         * Timeout reference
         * @memberof Stagger
         * @member Stagger._timeout
         *
         */
        this._timeout = null;
        
        /**
         *
         * Paused flag
         * @memberof Stagger
         * @member Stagger._paused
         *
         */
        this._paused = false;
        
        /**
         *
         * Started iteration flag
         * @memberof Stagger
         * @member Stagger._started
         *
         */
        this._started = false;
        
        /**
         *
         * Resolved iteration flag
         * @memberof Stagger
         * @member Stagger._resolved
         *
         */
        this._resolved = false;
    },
    
    /**
     *
     * Apply the step callback
     * @memberof Stagger
     * @method Stagger.step
     * @param {function} fn The callback to fire
     *
     */
    step: function ( fn ) {
        if ( typeof fn === "function" ) {
            this._step = fn;
        }
        
        return this;
    },
    
    /**
     *
     * Apply a when callback
     * @memberof Stagger
     * @method Stagger.when
     * @param {number} i The iteration to fire on
     * @param {function} fn The callback to fire
     *
     */
    when: function ( i, fn ) {
        if ( typeof fn === "function" ) {
            this._when[ i ] = fn;
        }

        return this;
    },
    
    /**
     *
     * Apply the done callback
     * @memberof Stagger
     * @method Stagger.done
     * @param {function} fn The callback to fire
     *
     */
    done: function ( fn ) {
        if ( typeof fn === "function" ) {
            this._done = fn;
        }
        
        return this;
    },
    
    /**
     *
     * Pause the iteration
     * @memberof Stagger
     * @method Stagger.pause
     *
     */
    pause: function () {
        this._paused = true;
        
        return this;
    },
    
    /**
     *
     * Play the iteration
     * @memberof Stagger
     * @method Stagger.play
     *
     */
    play: function () {
        this._paused = false;
        
        return this;
    },
    
    /**
     *
     * Start the iteration
     * @memberof Stagger
     * @method Stagger.start
     *
     */
    start: function () {
        this.play()._stagger();
        
        return this;
    },
    
    /**
     *
     * Resolve the iteration state
     * @memberof Stagger
     * @method Stagger._resolve
     *
     */
    _resolve: function () {
        this._resolved = true;
        this._timeout = null;
        
        return this;
    },
    
    /**
     *
     * Initialize the iteration loop
     * @memberof Stagger
     * @method Stagger._stagger
     *
     */
    _stagger: function () {
        if ( this._started ) {
            return this;
        }
        
        this._started = true;
        
        var self = this,
            stagger = function () {
                self._timeout = setTimeout(function () {
                    clearTimeout( self._timeout );
                    
                    // If resolved, stop timeout loop
                    if ( self._resolved ) {
                        self._timeout = null;
                        
                        return;
                    
                    // If paused, keep loop going but wait    
                    } else if ( self._paused ) {
                        stagger();
                        
                        return;
                    }
                    
                    if ( typeof self._step === "function" ) {
                        self._step( self._current );
                    }
                    
                    if ( typeof self._when[ self._current ] === "function" ) {
                        self._when[ self._current ]( self._current );
                    }
                    
                    self._current++;
                    
                    if ( self._current === self._occurrences ) {
                        self._resolve();
                        
                        if ( typeof self._done === "function" ) {
                            self._done();
                        }
                        
                    } else {
                        stagger();
                    }
                                
                }, self._delay );
            };
        
        stagger();
    }
};


// Expose
window.provide( "Stagger", Stagger );


})( window );
/*!
 *
 * Hammerjs event delegation wrapper
 * http://eightmedia.github.io/hammer.js/
 *
 * @Hammered
 * @author: kitajchuk
 *
 *
 */
(function ( window, Hammer, matchElement ) {


"use strict";


// Break on no Hammer
if ( !Hammer ) {
    throw new Error( "Hammered Class requires Hammerjs!" );
}


/**
 *
 * Hammerjs event delegation wrapper
 * @constructor Hammered
 * @requires matchElement
 * @memberof! <global>
 *
 */
var Hammered = function () {
    return this.init.apply( this, arguments );
};


Hammered.prototype = {
    constructor: Hammered,

    /**
     *
     * Hammered constructor method
     * {@link http://hammerjs.github.io/getting-started/
     * @memberof Hammered
     * @param {object} element DOMElement to delegate from, default is document.body
     * @param {object} options Hammerjs options to be passed to instance
     * @method init
     *
     */
    init: function ( element, options ) {
        /**
         *
         * Match version of hammerjs for compatibility
         * @member _version
         * @memberof Hammered
         * @private
         *
         */
        this._version = "0.2.0";
    
        /**
         *
         * The stored handlers
         * @member _handlers
         * @memberof Hammered
         * @private
         *
         */
        this._handlers = {};

        /**
         *
         * The stored Hammer instance
         * @member _hammer
         * @memberof Hammered
         * @private
         *
         */
        this._hammer = new Hammer( (element || document.body), options );
    },

    /**
     *
     * Retrieve the original Hammer instance
     * @method getInstance
     * @memberof Hammered
     * @returns instanceof Hammer
     *
     */
    getInstance: function () {
        return this._hammer;
    },

    /**
     *
     * Retrieve the handlers reference object
     * @method getHandlers
     * @memberof Hammered
     * @returns object
     *
     */
    getHandlers: function () {
        return this._handlers;
    },

    /**
     *
     * Allow binding hammer event via delegation
     * @method on
     * @param {string} event The Hammer event
     * @param {string} selector The delegated selector to match
     * @param {function} callback The handler to call
     * @memberof Hammered
     *
     */
    on: function ( event, selector, callback ) {
        var uid = ("Hammered" + ((this._version + Math.random()) + (event + "-" + selector)).replace( /\W/g, "" )),
            handler = function ( e ) {
                var element = matchElement( e.target, selector );

                // Either match target element
                // or walk up to match ancestral element.
                // If the target is not desired, exit
                if ( element ) {
                    // Call the handler with normalized context
                    callback.call( element, e );
                }
            };

        // Bind the methods on ID
        handler._hammerUID = uid;
        callback._hammerUID = uid;

        // Apply the event via Hammerjs
        this._hammer.on( event, handler );

        // Push the wrapper handler onto the stack
        this._handlers[ uid ] = handler;
    },

    /**
     *
     * Effectively off an event wrapped with Hammered
     * @method off
     * @param {string} event The Hammer event
     * @param {function} callback The handler to remove
     * @memberof Hammered
     *
     */
    off: function ( event, callback ) {
        var i;

        for ( i in this._handlers ) {
            if ( i === callback._hammerUID && this._handlers[ i ]._hammerUID === callback._hammerUID ) {
                this._hammer.off( event, this._handlers[ i ] );

                delete this._handlers[ i ];

                break;
            }
        }
    }
};


// Expose
window.provide( "Hammered", Hammered );

})( window, window.require( "Hammer" ), window.require( "matchElement" ) );