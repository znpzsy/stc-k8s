(function () {

    'use strict';

    angular.module('adminportal.products.smsf.configuration', []);

    var USCConfigurationModule = angular.module('adminportal.products.smsf.configuration');

    USCConfigurationModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsf.configuration', {
            url: "/configurations",
            abstract: true,
            templateUrl: "products/smsf/configuration/configuration.html"
        }).state('products.smsf.configuration.core', {
            url: "/core",
            templateUrl: "products/smsf/configuration/configuration.settings.core.html",
            controller: 'SMSFConfigurationCtrl',
            resolve: {
                smsfConfig: function (SmsfConfigService) {
                    return SmsfConfigService.getCoreConfig();
                }
            }
        });

    });

    USCConfigurationModule.controller('SMSFConfigurationCtrl', function ($scope, $log, $state, notification, $translate, SmsfConfigService,
                                                                             Restangular, smsfConfig) {
        $log.debug("SMSFConfigurationCtrl");

        $scope.smsfConfig = {
            maxGsmInputTransactions: parseInt(smsfConfig['momt.maxGsmInputTransactions']),
            moTimeout: parseInt(smsfConfig['momt.ss7subsystem.moTimeout']),
            n1N2RequestTimeout: parseInt(smsfConfig['momt.ss7subsystem.n1N2RequestTimeout']),
            maxGsmOutputTransactions: parseInt(smsfConfig['momt.maxGsmOutputTransactions']),
            throttlerQueueSize: parseInt(smsfConfig['momt.throttlerQueueSize']),
            throttlerAttemptTimeout: parseInt(smsfConfig['momt.throttlerAttemptTimeout'])
        };

        $scope.originalSmsfConfig = angular.copy($scope.smsfConfig);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSmsfConfig, $scope.smsfConfig);
        };


        $scope.save = function () {

            var serviceProfile = {
                'momt.maxGsmInputTransactions': $scope.smsfConfig.maxGsmInputTransactions.toString(),
                'momt.ss7subsystem.moTimeout': $scope.smsfConfig.moTimeout.toString(),
                'momt.ss7subsystem.n1N2RequestTimeout': $scope.smsfConfig.n1N2RequestTimeout.toString(),
                'momt.maxGsmOutputTransactions': $scope.smsfConfig.maxGsmOutputTransactions.toString(),
                'momt.throttlerQueueSize': $scope.smsfConfig.throttlerQueueSize.toString(),
                'momt.throttlerAttemptTimeout': $scope.smsfConfig.throttlerAttemptTimeout.toString()
            };

            SmsfConfigService.updateCoreConfig(serviceProfile).then(function (response) {
                $log.debug('Update SMSF config:', response);

                if ($scope.smsfConfig.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: $scope.smsfConfig.errorCode,
                            errorText: $scope.smsfConfig.errorText
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
                $log.debug('Cannot update SMSF Configuration');
            });
        };
        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
