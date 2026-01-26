(function () {

    'use strict';

    angular.module('adminportal.products.ussi.configuration', []);

    var USCConfigurationModule = angular.module('adminportal.products.ussi.configuration');

    USCConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.ussi.configuration', {
            url: "/configurations",
            abstract: true,
            templateUrl: "products/ussi/configuration/configuration.html"
        }).state('products.ussi.configuration.core', {
            url: "/core",
            templateUrl: "products/ussi/configuration/configuration.settings.core.html",
            controller: 'USSICoreConfigurationCtrl',
            resolve: {
                ussiCoreConfig: function (UssiCoreConfService) {
                     return UssiCoreConfService.getCoreConfig();
                 }
            }
        });

    });
    
    USCConfigurationModule.controller('USSICoreConfigurationCtrl', function ($scope, $log, $state, notification, $translate, UssiCoreConfService,
                                                                                   Restangular, ussiCoreConfig) {
        $log.debug("USSICoreConfigurationCtrl");

        $scope.ussiCoreConfig = {
            sipTimeout: parseInt(ussiCoreConfig['core.sipTimeout']),
            mapTimeout: parseInt(ussiCoreConfig['core.mapTimeout']),
            throttlerAttemptTimeout: parseInt(ussiCoreConfig['core.throttlerAttemptTimeout']),
            throttlerQueueSize: parseInt(ussiCoreConfig['core.throttlerQueueSize']),
            maxMobileInitTransactions: parseInt(ussiCoreConfig['core.maxMobileInitTransactions']),
            maxNetworkInitTransactions: parseInt(ussiCoreConfig['core.maxNetworkInitTransactions'])
        };

        $scope.originalUssiCoreConfig = angular.copy($scope.ussiCoreConfig);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalUssiCoreConfig, $scope.ussiCoreConfig);
        };


        $scope.save = function () {
            var serviceProfile = {
                'core.sipTimeout': $scope.ussiCoreConfig.sipTimeout.toString(),
                'core.mapTimeout': $scope.ussiCoreConfig.mapTimeout.toString(),
                'core.throttlerAttemptTimeout': $scope.ussiCoreConfig.throttlerAttemptTimeout.toString(),
                'core.throttlerQueueSize': $scope.ussiCoreConfig.throttlerQueueSize.toString(),
                'core.maxMobileInitTransactions': $scope.ussiCoreConfig.maxMobileInitTransactions.toString(),
                'core.maxNetworkInitTransactions': $scope.ussiCoreConfig.maxNetworkInitTransactions.toString(),
            };

            UssiCoreConfService.updateCoreConfig(serviceProfile).then(function (response) {
                $log.debug('Update Ussi Browser config:', response);

                if ($scope.ussiCoreConfig.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: $scope.ussiCoreConfig.errorCode,
                            errorText: $scope.ussiCoreConfig.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }

                $state.go($state.$current, null, {reload: true});

            }, function (response) {
                $log.debug('Cannot update Ussi Browser Configuration');
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
