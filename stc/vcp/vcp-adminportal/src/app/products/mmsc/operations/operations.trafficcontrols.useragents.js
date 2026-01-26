(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.trafficcontrols.useragents', []);

    var MMSCUserAgentsOperationsModule = angular.module('adminportal.products.mmsc.operations.trafficcontrols.useragents');

    MMSCUserAgentsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.trafficcontrols.useragents', {
            url: "/useragents",
            templateUrl: "products/mmsc/operations/operations.trafficcontrols.useragents.html",
            controller: 'MMSCUserAgentsOperationsCtrl',
            resolve: {
                thresholds: function (MmscOperationService) {
                    return MmscOperationService.getTrafficControlMm1Threshold();
                }
            }
        });

    });

    var INTERFACE_NAME = 'mm1';

    MMSCUserAgentsOperationsModule.controller('MMSCUserAgentsOperationsCtrl', function ($scope, $state, $log, $translate, notification, MmscOperationService, thresholds) {
        $log.debug('MMSCUserAgentsOperationsCtrl');


        var initialize = function (_thresholds) {
            $scope.userAgentsOptions = {
                incomingTrafficControlEnabled: _thresholds.inputThreshold > -1,
                incomingTrafficThreshold: _thresholds.inputThreshold === -1 ? undefined : _thresholds.inputThreshold,
                outgoingTrafficControlEnabled: _thresholds.outputThreshold > -1,
                outgoingTrafficThreshold: _thresholds.outputThreshold === -1 ? undefined : _thresholds.outputThreshold,
                name: _thresholds.name
            };

            $scope.originalUserAgentsOptions = angular.copy($scope.userAgentsOptions);
        };

        initialize(thresholds);

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalUserAgentsOptions, $scope.userAgentsOptions);
        };

        $scope.save = function (userAgentsOptions) {
            $log.debug('Save User Agents thresholds: ', userAgentsOptions);

            if (!userAgentsOptions.incomingTrafficControlEnabled) {
                userAgentsOptions.incomingTrafficThreshold = -1;
            }

            if (!userAgentsOptions.outgoingTrafficControlEnabled) {
                userAgentsOptions.outgoingTrafficThreshold = -1;
            }

            var updateBody = {
                "inputThreshold": userAgentsOptions.incomingTrafficThreshold,
                "outputThreshold": userAgentsOptions.outgoingTrafficThreshold
            };

            MmscOperationService.updateTrafficControlMm1(updateBody).then(function (response) {
                $log.debug('User Agents ', INTERFACE_NAME, ' traffic threshold updated successfully. Response: ', response);

                initialize(response);

                notification({
                    type: 'success',
                    text: $translate.instant('Products.MMSC.Operations.TrafficControls.Messages.UpdatedSuccessfully', {
                        iface: $translate.instant('Products.MMSC.Operations.TrafficControls.UserAgents.MenuLabel')
                    })
                });
            }, function (response) {
                $log.error('Cannot update User Agents ', INTERFACE_NAME, ' traffic threshold. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
