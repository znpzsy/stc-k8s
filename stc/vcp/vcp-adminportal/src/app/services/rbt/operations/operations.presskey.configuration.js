(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.presskey.configuration', []);

    var RBTOperationsPressKeyConfigurationModule = angular.module('adminportal.services.rbt.operations.presskey.configuration');

    RBTOperationsPressKeyConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.presskey.configuration', {
            url: "/configuration",
            templateUrl: "services/rbt/operations/operations.presskey.configuration.html",
            data: {
                pageHeaderKey: 'Services.RBT.Operations.PressKey.Title',
                subPageHeaderKey: 'Services.RBT.Operations.PressKey.Configuration.Title'
            },
            controller: 'RBTOperationsPressKeyConfigurationCtrl',
            resolve: {
                configuration: function (RBTConfService) {
                    return RBTConfService.getPressKeyConfiguration();
                }
            }
        })
    });

    RBTOperationsPressKeyConfigurationModule.controller('RBTOperationsPressKeyConfigurationCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, $controller, notification, Restangular,
                                                                                                                      RBTConfService, configuration) {
        $log.debug("RBTOperationsPressKeyConfigurationCtrl");

        //$controller('RBTOperationsPressKeyCommonCtrl', {$scope: $scope});

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.showForm = !_.isEmpty(configuration);

        $scope.serviceProfile = {
            frequency: configuration.frequency,
            maxDailyCount: configuration.maxDailyCount
        };

        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (conf) {

            var configurationPayload = {
                "frequency": conf.frequency,
                "maxDailyCount":conf.maxDailyCount
            };
            $log.debug('Updating press key configuration: ', configurationPayload);

            RBTConfService.updatePressKeyConfiguration(configurationPayload).then(function (response) {
                $log.debug('Service responded: ', response);
                if (response && response.frequency && response.maxDailyCount) {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.go($state.$current, null, {reload: true});
                } else {
                    $log.debug('Cannot update presskey config: ', configurationPayload, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                }
            }, function (response) {
                $log.debug('Update presskey config error: ', response);
            });;

        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();

