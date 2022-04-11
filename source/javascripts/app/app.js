/*!
 *
 * App basic javascript
 *
 * A nice description of what this file does...
 *
 *
 */
import "jquery/dist/jquery";
import "node_modules/hammerjs/hammer";
import "app/resizes";
import "app/navbar";
import "app/router";
import "app/loader";
import "app/detect";
import "app/drawer";
import "app/loadin";


window.onload = function () {
    // Global detection initializer
    detect.init();


    // Global load-in initializer
    loadin.init();


    // Global resize element initializer
    resizes.init();


    // Primary router initializer
    router.init();


    // Primary navbar initializer
    navbar.init();


    // Primary loader initializer
    loader.init();


    // Global drawer initializer
    drawer.init();
};