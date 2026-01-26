(function () {
    'use strict';

    /* Directives */
    angular.module('adminportal.products.smsc.directives', []);

    var SmscDirectivesModule = angular.module('adminportal.products.smsc.directives');

    SmscDirectivesModule.directive('smscTroubleshootingSummarize', function () {
        return {
            restrict: 'E',
            templateUrl: 'products/smsc/troubleshooting/troubleshooting.summarize.html'
        };
    });

    SmscDirectivesModule.directive('listErrorCodeAvailabilityCheck', function () {
        var checkAvailability = function (scope, elem, attr, ctrl, value) {
            var currentList = scope.retryPolicyErrorCodeList;
            var currentRetryPolicyErrorCode = scope.retryPolicyErrorCode;

            if (_.isEmpty(value)) {
                value = undefined;
            }

            scope.form.errorCode.$setValidity('availabilityCheck', true);
            scope.form.contextName.$setValidity('availabilityCheck', true);

            var foundRetryPolicy;
            if (elem[0].name === 'errorCode') {
                foundRetryPolicy = _.findWhere(currentList, {errorCode: Number(value), contextName: currentRetryPolicyErrorCode.contextName});
            } else if (elem[0].name === 'contextName') {
                foundRetryPolicy = _.findWhere(currentList, {errorCode: Number(currentRetryPolicyErrorCode.errorCode), contextName: value});
            }

            ctrl.$setValidity('availabilityCheck', _.isUndefined(foundRetryPolicy));

            // returns availability value.
            return value;
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attr, ctrl) {
                // add a parser that will process each time the value is
                // parsed into the model when input updates it.
                ctrl.$parsers.unshift(function (value) {
                    return checkAvailability(scope, elem, attr, ctrl, value);
                });

                // add a formatter that will process each time the value
                // is updated on the DOM element.
                ctrl.$formatters.unshift(function (value) {
                    return checkAvailability(scope, elem, attr, ctrl, value);
                });
            }
        };
    });

})();
