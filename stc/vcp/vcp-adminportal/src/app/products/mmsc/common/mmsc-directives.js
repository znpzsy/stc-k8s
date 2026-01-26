(function () {
    'use strict';

    /* Directives */
    angular.module('adminportal.products.mmsc.directives', []);

    var MmscDirectives = angular.module('adminportal.products.mmsc.directives');

    MmscDirectives.directive('mmscTroubleshootingSummarize', function () {
        return {
            restrict: 'E',
            templateUrl: 'products/mmsc/troubleshooting/troubleshooting.summarize.html'
        };
    });

})();
