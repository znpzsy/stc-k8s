(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.operations.routingtables.applicationrouting.routingtest', []);

    var MessagingGwOperationsRoutingTablesApplicationRoutingTestModule = angular.module('adminportal.products.messaginggw.operations.routingtables.applicationrouting.routingtest');

    MessagingGwOperationsRoutingTablesApplicationRoutingTestModule.controller('MessagingGwOperationsRoutingTablesApplicationRoutingTestCtrl', function ($scope, $log, $filter, $uibModalInstance, Restangular, MessagingGwProvService) {
        $log.debug('MessagingGwOperationsRoutingTablesApplicationRoutingTestCtrl');

        $scope.routingTest = {
            address: '',
            text: ''
        };

        $scope.testRouting = function (routingTest) {
            $log.debug('Routing will be tested: ', routingTest);

            // Reset the result.
            $scope.testResult = undefined;

            MessagingGwProvService.getSMPPApplicationRoutingTest(routingTest.address, routingTest.text).then(function (response) {
                $log.debug('Routing tested: ', response);

                $scope.testResult = Restangular.stripRestangular(response);
            }, function (response) {
                $log.debug('Cannot tested address translation: ', response);
            });
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

    });

})();
