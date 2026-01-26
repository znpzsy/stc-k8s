(function () {

    'use strict';

    angular.module('ccportal.products.mmsc.directives', []);

    var MMSCDirectivesModule = angular.module('ccportal.products.mmsc.directives');

    MMSCDirectivesModule.directive('mmscActivityHistorySummarize', function () {
        return {
            restrict: 'E',
            templateUrl: 'products/mmsc/activity-history/mmsc-activity-history.summarize.html'
        };
    });

})();


