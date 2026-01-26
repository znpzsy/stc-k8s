(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration.settings.bulkivr', []);

    var BulkMessagingConfigurationSettingsBulkIVRModule = angular.module('adminportal.products.bulkmessaging.configuration.settings.bulkivr');

    BulkMessagingConfigurationSettingsBulkIVRModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.configuration.settings.bulkivr', {
            url: "/bulkivr",
            templateUrl: "products/bulkmessaging/configuration/configuration.settings.bulkivr.html",
            controller: "BulkMessagingConfigurationSettingsBulkIVRCtrl",
            resolve: {
                settings: function (BulkMessagingConfService) {
                    return BulkMessagingConfService.getIVRConfig();
                }
            }
        });

    });

    BulkMessagingConfigurationSettingsBulkIVRModule.controller('BulkMessagingConfigurationSettingsBulkIVRCtrl', function ($scope, $log, $state, $translate, notification, BulkMessagingConfService,
                                                                                                                          settings) {
        $log.debug('BulkMessagingConfigurationSettingsBulkIVRCtrl');

        $scope.settings = settings;

        $scope.originalSettings = angular.copy($scope.settings);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSettings, $scope.settings);
        };

        $scope.save = function (settings) {
            var settingsItem = {
                "blackListEnabled": settings.blackListEnabled,
                "disablePrepaidSender": settings.disablePrepaidSender,
                "dailyLimitEnabled": settings.dailyLimitEnabled,
                "dailyLimitValue": settings.dailyLimitValue
            };

            $log.debug('Updating bulk ivr settings: ', settingsItem);

            BulkMessagingConfService.updateIVRConfig(settingsItem).then(function (response) {
                $log.debug('Updated bulk ivr settings: ', settingsItem, ', response: ', response);

                $scope.originalSettings = angular.copy(settings);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update bulk ivr settings: ', settingsItem, ', response: ', response);
            });
        }

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
