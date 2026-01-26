/* ========================================================
 *
 * MVP Ready - Lightweight & Responsive Admin Template
 *
 * ========================================================
 *
 * File: mvpready-admin.js
 * Theme Version: 1.1.0
 * Bootstrap Version: 3.1.1
 * Author: Jumpstart Themes
 * Website: http://mvpready.com
 *
 * ======================================================== */

var mvpready_admin = function () {

    "use strict";

    var initLayoutToggles = function () {
        $('.navbar-toggle, .mainnav-toggle').click(function (e) {
            $(this).toggleClass('is-open');
        });
    };

    return {
        init: function () {
            // Layouts
            mvpready_core.navEnhancedInit();
            mvpready_core.navHoverInit({delay: {show: 250, hide: 350}});
            initLayoutToggles();

            // Components
            mvpready_core.initBackToTop();
        }
    };

}();
