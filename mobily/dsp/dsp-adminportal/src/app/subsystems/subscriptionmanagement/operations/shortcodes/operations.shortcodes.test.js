(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.shortcodes.test', []);

    var SubscriptionManagementOperationsShortCodesTestModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.shortcodes.test');

    SubscriptionManagementOperationsShortCodesTestModule.controller('SubscriptionManagementOperationsShortCodesTestCtrl', function ($scope, $log, $filter, $uibModalInstance, Restangular, SMSPortalProvisioningService) {
        $log.debug('SubscriptionManagementOperationsShortCodesTestCtrl');

        $scope.shortCodeTest = {
            shortCode: '',
            keyword: ''
        };

        $scope.runTest = function (shortCodeTest) {
            $log.debug('Routing will be tested: ', shortCodeTest);

            // Reset the result.
            $scope.testResult = undefined;

            SMSPortalProvisioningService.getShortCodeTest(shortCodeTest.shortCode, shortCodeTest.keyword).then(function (response) {
                $log.debug('Routing tested: ', response);

                $scope.testResult = Restangular.stripRestangular(response);
            }, function (response) {
                $log.debug('Cannot tested short code: ', response);
            });
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

    });

})();
