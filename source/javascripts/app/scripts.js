import "app/dom";
import { emitter } from "app/util";


var $_jsScripts = null,

    _isActive = false,


/**
 *
 * @public
 * @namespace app.scripts
 * @memberof app
 * @description Asynchronously load javascript sources when routing pages.
 *
 */
scripts = {
    /**
     *
     * @public
     * @method init
     * @memberof app.scripts
     * @description Method runs once when window loads.
     *
     */
    init: function () {
        console.log( "scripts initialized" );
    },


    /**
     *
     * @public
     * @method isActive
     * @memberof app.scripts
     * @description Method informs PageController of active status.
     * @returns {boolean}
     *
     */
    isActive: function () {
        return (_isActive = this.getElements() > 0);
    },


    /**
     *
     * @public
     * @method onload
     * @memberof app.scripts
     * @description Method performs onloading actions for this module.
     *
     */
    onload: function () {
        this.loadScripts();
    },


    /**
     *
     * @public
     * @method unload
     * @memberof app.scripts
     * @description Method performs unloading actions for this module.
     *
     */
    unload: function () {
        this.teardown();
    },


    /**
     *
     * @public
     * @method teardown
     * @memberof app.scripts
     * @description Method performs cleanup after this module. Remmoves events, null vars etc...
     *
     */
    teardown: function () {
        _isActive = false;

        $_jsScripts = null;
    },


    /**
     *
     * @public
     * @method getElements
     * @memberof app.scripts
     * @description Method queries DOM for module elements.
     * @returns {number}
     *
     */
    getElements: function () {
        $_jsScripts = dom.body.find( ".js-lazy-script" );

        return ( $_jsScripts.length );
    },


    /**
     *
     * @public
     * @method loadScripts
     * @memberof app.scripts
     * @description Method async loads javascript files and emits when a source is ready.
     *
     */
    loadScripts: function ( scripts ) {
        var script,
            data,
            i;

        scripts = (scripts || $_jsScripts);

        for ( i = scripts.length; i--; ) {
            script = scripts[ i ];
            data = scripts.eq( i ).data();

            script.__jsLoaded = (script.__jsLoaded || false);

            if ( !script.__jsLoaded ) {
                loadScript( script, data );
            }
        }
    }
},


loadScript = function ( script, data ) {
    script.async = true;
    script.src = data.src;

    script.onload = script.onreadystatechange = function () {
        if ( !this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
            // Script is loaded status
            script.__jsLoaded = true;

            // Kill memory leakage ( old-school but meh )
            script.onload = script.onreadystatechange = null;

            // Emit context loaded if data attr is present
            if ( data.id ) {
                setTimeout(function () {
                    emitter.fire( ("app--loadscript--" + data.id) );

                }, 100 );
            }
        }
    };
};


/******************************************************************************
 * Export
*******************************************************************************/
export default scripts;