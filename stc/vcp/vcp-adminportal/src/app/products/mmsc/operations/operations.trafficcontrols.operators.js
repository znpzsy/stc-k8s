(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.trafficcontrols.operators', []);

    var MMSCOperatorsOperationsModule = angular.module('adminportal.products.mmsc.operations.trafficcontrols.operators');

    MMSCOperatorsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.trafficcontrols.operators', {
            url: "/operators",
            templateUrl: "products/mmsc/operations/operations.trafficcontrols.operators.html",
            controller: 'MMSCOperatorsOperationsCtrl',
            resolve: {
                operatorsThresholds: function (MmscOperationService) {
                    return MmscOperationService.getAllTrafficControlMm4Thresholds();
                }
            }
        });

    });

    var INTERFACE_NAME = 'mm4';

    MMSCOperatorsOperationsModule.controller('MMSCOperatorsOperationsCtrl', function ($scope, $state, $filter, $log, $translate, notification, MmscOperationService, operatorsThresholds) {
        $log.debug('MMSCOperatorsOperationsCtrl');

        $scope.operatorList = operatorsThresholds.list;
        $scope.operatorList = $filter('orderBy')($scope.operatorList, ['name']);

        // Initializes the threshold values for first selected operator.
        var initialize = function (_thresholds) {
            $scope.operatorsOptions = {
                incomingTrafficControlEnabled: _thresholds.inputThreshold > -1,
                incomingTrafficThreshold: _thresholds.inputThreshold === -1 ? undefined : _thresholds.inputThreshold,
                outgoingTrafficControlEnabled: _thresholds.outputThreshold > -1,
                outgoingTrafficThreshold: _thresholds.outputThreshold === -1 ? undefined : _thresholds.outputThreshold,
                id: _thresholds.id,
                name: _thresholds.name
            };

            $scope.originalOperatorsOptions = angular.copy($scope.operatorsOptions);
        };

        // Triggers when operator has changed on the form and takes selected operator to use if of it for getting latest threshold values.
        $scope.changeOperator = function (selectedOperator) {
            if (_.isUndefined(selectedOperator.id)) {
                return;
            }

            MmscOperationService.getTrafficControlMm4Threshold(selectedOperator.id).then(function (response) {
                initialize(response);
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalOperatorsOptions, $scope.operatorsOptions);
        };

        $scope.save = function (operatorsOptions) {
            $log.debug('Save Operators thresholds: ', operatorsOptions);

            if (!operatorsOptions.incomingTrafficControlEnabled) {
                operatorsOptions.incomingTrafficThreshold = -1;
            }

            if (!operatorsOptions.outgoingTrafficControlEnabled) {
                operatorsOptions.outgoingTrafficThreshold = -1;
            }

            var updateBody = {
                "inputThreshold": operatorsOptions.incomingTrafficThreshold,
                "outputThreshold": operatorsOptions.outgoingTrafficThreshold
            };

            MmscOperationService.updateTrafficControlMm4(operatorsOptions.id, updateBody).then(function (response) {
                $log.debug('Operators ', INTERFACE_NAME, ' traffic threshold updated successfully. Response: ', response);

                initialize(response);

                notification({
                    type: 'success',
                    text: $translate.instant('Products.MMSC.Operations.TrafficControls.Messages.UpdatedSuccessfully', {
                        iface: $translate.instant('Products.MMSC.Operations.TrafficControls.PerOperator.MenuLabel')
                    })
                });
            }, function (response) {
                $log.error('Cannot update Operators ', INTERFACE_NAME, ' traffic threshold. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
