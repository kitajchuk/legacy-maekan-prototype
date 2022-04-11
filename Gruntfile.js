/*!
 *
 * Maekan iterations config.
 *
 * Grunt Nautilus:
 * https://github.com/kitajchuk/grunt-nautilus
 *
 * Available grunt-nautilus tasks:
 * grunt nautilus:build [, flags...]
 * grunt nautilus:deploy [, flags...]
 * grunt nautilus:module [, flags...]
 *
 */
module.exports = function ( grunt ) {


    "use strict";


    // Default project paths.
    var pubRoot = "./source",
        jsRoot = pubRoot + "/javascripts",
        appRoot = jsRoot + "/app",
        libRoot = jsRoot + "/lib",
        distRoot = jsRoot + "/dist";


    // Project configuration.
    grunt.initConfig({
        // Project meta.
        meta: {
            version: "0.1.0"
        },


        // Nautilus config.
        nautilus: {
            options: {
                jsAppRoot: appRoot,
                jsDistRoot: distRoot,
                jsLibRoot: libRoot,
                jsRoot: jsRoot,
                pubRoot: pubRoot,
                jsdocs: false,
                jsGlobals: {
                    $: true,
                    require: true,
                    provide: true,
                    Hammer: true,
                    DocumentTouch: true,
                    Draggable: true
                },
                hintOn: [
                    "watch",
                    "build",
                    "deploy"
                ],
                standalone: [
                    "gs-draggable"
                ]
            }
        }


    });


    // Load the nautilus plugin.
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-sass" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-jsdoc" );
    grunt.loadNpmTasks( "grunt-postcss" );
    grunt.loadNpmTasks( "grunt-nautilus" );


    // Register default task.
    grunt.registerTask( "default", ["nautilus:build"] );


};