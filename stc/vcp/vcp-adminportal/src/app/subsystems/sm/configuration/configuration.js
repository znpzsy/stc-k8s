(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.configuration', []);

    var SMConfigurationModule = angular.module('adminportal.subsystems.screeningmanager.configuration');

    SMConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.configuration', {
            url: "/configurations",
            templateUrl: 'subsystems/sm/configuration/configuration.html',
            controller: 'SMConfigurationCtrl',
            resolve: {
                limitConfiguration: function (ScreeningManagerService) {
                    return ScreeningManagerService.getLimitConfiguration();
                }
            }
        });

    });

    SMConfigurationModule.controller('SMConfigurationCtrl', function ($scope, $state, $log, ScreeningManagerService, Restangular, limitConfiguration) {
        $log.debug('SMConfigurationCtrl');

        $scope.maxlistSizes = Restangular.stripRestangular(limitConfiguration).maximumListSizesResponse;

        $scope.maxlistSizesOriginal = angular.copy($scope.maxlistSizes);
        $scope.isNotChanged = function () {
            return angular.equals($scope.maxlistSizes, $scope.maxlistSizesOriginal);
        };

        $scope.saveConfiguration = function () {
            var updateConf = {
                updateMaximumListSizesRequest: $scope.maxlistSizes
            };
            ScreeningManagerService.setLimitConfiguration(updateConf).then(function (response) {
                $scope.maxlistSizesOriginal = angular.copy($scope.maxlistSizes);

                $log.debug('Updated configuration ', response);
            }, function (response) {
                $log.debug('Cannot read screening manager configuration. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
