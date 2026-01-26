(function () {

    'use strict';

    angular.module('adminportal.subsystems.screeningmanager.configuration', []);

    var SMConfigurationModule = angular.module('adminportal.subsystems.screeningmanager.configuration');

    SMConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.screeningmanager.configuration', {
            url: "/configurations",
            templateUrl: 'subsystems/screeningmanager/configuration/configuration.html',
            data: {
                permissions: [
                    'ALL__CONFIGURATION_READ'
                ]
            },
            controller: 'SMConfigurationCtrl',
            resolve: {
                limitConfiguration: function (ScreeningManagerV3Service) {
                    return ScreeningManagerV3Service.getLimitConfiguration();
                }
            }
        });

    });

    SMConfigurationModule.controller('SMConfigurationCtrl', function ($scope, $state, $log, $translate, notification, ScreeningManagerV3Service,
                                                                      Restangular, limitConfiguration) {
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
            ScreeningManagerV3Service.setLimitConfiguration(updateConf).then(function (response) {
                $scope.maxlistSizesOriginal = angular.copy($scope.maxlistSizes);

                $log.debug('Updated configuration ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot read screening manager configuration. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
