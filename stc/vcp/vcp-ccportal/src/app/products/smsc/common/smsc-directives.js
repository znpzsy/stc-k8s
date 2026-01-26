(function () {

    'use strict';

    angular.module('ccportal.products.smsc.directives', []);

    var SMSCDirectivesModule = angular.module('ccportal.products.smsc.directives');

    SMSCDirectivesModule.directive('smscActivityHistorySummarize', function () {
        return {
            restrict: 'E',
            templateUrl: 'products/smsc/activity-history/smsc-activity-history.summarize.html'
        };
    });

})();


