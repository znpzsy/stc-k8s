(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.trafficcontrols.applications', []);

    var MMSCApplicationsOperationsModule = angular.module('adminportal.products.mmsc.operations.trafficcontrols.applications');

    MMSCApplicationsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.trafficcontrols.applications', {
            url: "/applications",
            templateUrl: "products/mmsc/operations/operations.trafficcontrols.applications.html",
            controller: 'MMSCApplicationsOperationsCtrl',
            resolve: {
                vasApplications: function (MmscOperationService) {
                    return MmscOperationService.getOrderedVasApplicationList();
                }
            }
        });

    });

    var INTERFACE_NAME = 'mm7';

    MMSCApplicationsOperationsModule.controller('MMSCApplicationsOperationsCtrl', function ($scope, $state, $filter, $log, $translate, notification, Restangular,
                                                                                            MmscOperationService, vasApplications) {
        $log.debug('MMSCApplicationsOperationsCtrl');

        $scope.vasApplicationList = vasApplications.vasList;

        // Initializes the threshold values for first selected application.
        var initialize = function (_thresholds) {
            $scope.vasApplicationOptions = {
                incomingTrafficControlEnabled: _thresholds.inputThreshold > -1,
                incomingTrafficThreshold: _thresholds.inputThreshold === -1 ? undefined : _thresholds.inputThreshold,
                outgoingTrafficControlEnabled: _thresholds.outputThreshold > -1,
                outgoingTrafficThreshold: _thresholds.outputThreshold === -1 ? undefined : _thresholds.outputThreshold,
                vasId: _thresholds.vasId,
                vaspId: _thresholds.vaspId
            };

            $scope.originalVasApplicationOptions = angular.copy($scope.vasApplicationOptions);
        };

        // Triggers when application has changed on the form and takes selected application to use it for getting latest threshold values.
        $scope.changeVasApplication = function (selectedVasApplication) {
            if (!selectedVasApplication) {
                return;
            }

            MmscOperationService.getTrafficControlMm7Threshold(selectedVasApplication.vaspId + '/' + selectedVasApplication.vasId).then(function (response) {
                initialize(response);
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalVasApplicationOptions, $scope.vasApplicationOptions);
        };

        $scope.save = function (vasApplicationOptions) {
            $log.debug('Save Vas Application thresholds: ', vasApplicationOptions);

            if (!vasApplicationOptions.incomingTrafficControlEnabled) {
                vasApplicationOptions.incomingTrafficThreshold = -1;
            }

            if (!vasApplicationOptions.outgoingTrafficControlEnabled) {
                vasApplicationOptions.outgoingTrafficThreshold = -1;
            }

            var updateBody = {
                "inputThreshold": vasApplicationOptions.incomingTrafficThreshold,
                "outputThreshold": vasApplicationOptions.outgoingTrafficThreshold
            };

            MmscOperationService.updateTrafficControlMm7(vasApplicationOptions.vaspId + '/' + vasApplicationOptions.vasId, updateBody).then(function (response) {
                $log.debug('Vas Application ', INTERFACE_NAME, ' traffic threshold updated successfully. Response: ', response);

                initialize(response);

                notification({
                    type: 'success',
                    text: $translate.instant('Products.MMSC.Operations.TrafficControls.Messages.UpdatedSuccessfully', {
                        iface: $translate.instant('Products.MMSC.Operations.TrafficControls.PerApplication.MenuLabel')
                    })
                });
            }, function (response) {
                $log.error('Cannot update Vas Application ', INTERFACE_NAME, ' traffic threshold. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
