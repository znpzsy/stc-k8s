(function () {
    'use strict';

    /* Directives */
    angular.module('adminportal.products.bulkmessaging.directives', []);

    var BulkMessagingDirectives = angular.module('adminportal.products.bulkmessaging.directives');

    BulkMessagingDirectives.directive('smsCounter', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                elem.countSms('#' + attrs.smsCounter);
            }
        };
    });

})();