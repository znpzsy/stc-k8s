/**
 * Created by tayfuno on 7/24/14.
 */
(function () {

    'use strict';

    angular.module('adminportal.services.cc.configuration', []);

    var CCConfigurationModule = angular.module('adminportal.services.cc.configuration');

    CCConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('services.cc.configuration', {
            url: "/configurations",
            templateUrl: "services/cc/configuration/configuration.html",
            controller: 'CCConfigurationCtrl',
            resolve: {
                ccServiceConfig: function (P4MService) {
                    return P4MService.getCcServiceConfig();
                }
            }
        });

    });

    CCConfigurationModule.controller('CCConfigurationCtrl', function ($scope, $state, $log, notification, $translate, Restangular, P4MService, ccServiceConfig) {
        $log.debug("CCConfigurationCtrl");

        $scope.serviceProfile = Restangular.stripRestangular(ccServiceConfig);
        $scope.originalServiceProfile = angular.copy($scope.serviceProfile);

        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalServiceProfile, $scope.serviceProfile);
        };

        $scope.save = function (serviceProfile) {
            $log.debug('Save CC service configuration:', serviceProfile);

            P4MService.updateCcServiceConfig(serviceProfile).then(function (response) {
                $log.debug('Success. Response: ', response);

                $scope.serviceProfile = Restangular.stripRestangular(response);

                $scope.originalServiceProfile = angular.copy($scope.serviceProfile);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update CC service configuration. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
