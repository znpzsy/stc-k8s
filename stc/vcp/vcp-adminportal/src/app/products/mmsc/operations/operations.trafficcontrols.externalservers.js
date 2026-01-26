(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.trafficcontrols.externalservers', []);

    var MMSCExternalServersOperationsModule = angular.module('adminportal.products.mmsc.operations.trafficcontrols.externalservers');

    MMSCExternalServersOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.trafficcontrols.externalservers', {
            url: "/externalservers",
            templateUrl: "products/mmsc/operations/operations.trafficcontrols.externalservers.html",
            controller: 'MMSCExternalServersOperationsCtrl',
            resolve: {
                thresholds: function (MmscOperationService) {
                    return MmscOperationService.getTrafficControlMm3Threshold();
                }
            }
        });

    });

    var INTERFACE_NAME = 'mm3';

    MMSCExternalServersOperationsModule.controller('MMSCExternalServersOperationsCtrl', function ($scope, $state, $log, $translate, notification, MmscOperationService, thresholds) {
        $log.debug('MMSCExternalServersOperationsCtrl');

        var initialize = function (_thresholds) {
            $scope.externalServersOptions = {
                incomingTrafficControlEnabled: _thresholds.inputThreshold > -1,
                incomingTrafficThreshold: _thresholds.inputThreshold === -1 ? undefined : _thresholds.inputThreshold,
                outgoingTrafficControlEnabled: _thresholds.outputThreshold > -1,
                outgoingTrafficThreshold: _thresholds.outputThreshold === -1 ? undefined : _thresholds.outputThreshold,
                name: _thresholds.name
            };

            $scope.originalExternalServersOptions = angular.copy($scope.externalServersOptions);
        };

        initialize(thresholds);

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalExternalServersOptions, $scope.externalServersOptions);
        };

        $scope.save = function (externalServersOptions) {
            $log.debug('Save External Servers thresholds: ', externalServersOptions);

            if (!externalServersOptions.incomingTrafficControlEnabled) {
                externalServersOptions.incomingTrafficThreshold = -1;
            }

            if (!externalServersOptions.outgoingTrafficControlEnabled) {
                externalServersOptions.outgoingTrafficThreshold = -1;
            }

            var updateBody = {
                "inputThreshold": externalServersOptions.incomingTrafficThreshold,
                "outputThreshold": externalServersOptions.outgoingTrafficThreshold
            };

            MmscOperationService.updateTrafficControlMm3(updateBody).then(function (response) {
                $log.debug('External Servers ', INTERFACE_NAME, ' traffic threshold updated successfully. Response: ', response);

                initialize(response);

                notification({
                    type: 'success',
                    text: $translate.instant('Products.MMSC.Operations.TrafficControls.Messages.UpdatedSuccessfully', {
                        iface: $translate.instant('Products.MMSC.Operations.TrafficControls.ExternalServers.MenuLabel')
                    })
                });
            }, function (response) {
                $log.error('Cannot update External Servers ', INTERFACE_NAME, ' traffic threshold. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
