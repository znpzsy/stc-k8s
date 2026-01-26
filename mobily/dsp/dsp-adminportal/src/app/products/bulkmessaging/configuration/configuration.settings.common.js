(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration.settings.common', []);

    var BulkMessagingConfigurationSettingsCommonModule = angular.module('adminportal.products.bulkmessaging.configuration.settings.common');

    BulkMessagingConfigurationSettingsCommonModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.configuration.settings.common', {
            url: "/common",
            templateUrl: "products/bulkmessaging/configuration/configuration.settings.common.html",
            controller: "BulkMessagingConfigurationSettingsCommonCtrl",
            resolve: {
                settings: function (BulkMessagingConfService) {
                    return BulkMessagingConfService.getCommonConfig();
                }
            }
        });

    });

    BulkMessagingConfigurationSettingsCommonModule.controller('BulkMessagingConfigurationSettingsCommonCtrl', function ($scope, $log, $state, $translate, notification, BulkMessagingConfService,
                                                                                                                        settings) {
        $log.debug('BulkMessagingConfigurationSettingsCommonCtrl');

        $scope.settings = settings;

        $scope.originalSettings = angular.copy($scope.settings);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSettings, $scope.settings);
        };

        $scope.save = function (settings) {
            var settingsItem = {
                "regexPatterns": settings.regexPatterns
            };

            $log.debug('Updating common settings: ', settingsItem);

            BulkMessagingConfService.updateCommonConfig(settingsItem).then(function (response) {
                $log.debug('Updated common settings: ', settingsItem, ', response: ', response);

                $scope.originalSettings = angular.copy(settings);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update common settings: ', settingsItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
