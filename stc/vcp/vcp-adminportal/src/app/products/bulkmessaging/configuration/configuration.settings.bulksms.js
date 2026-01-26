(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration.settings.bulksms', []);

    var BulkMessagingConfigurationSettingsBulkSMSModule = angular.module('adminportal.products.bulkmessaging.configuration.settings.bulksms');

    BulkMessagingConfigurationSettingsBulkSMSModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.configuration.settings.bulksms', {
            url: "/bulksms",
            templateUrl: "products/bulkmessaging/configuration/configuration.settings.bulksms.html",
            controller: "BulkMessagingConfigurationSettingsBulkSMSCtrl",
            resolve: {
                settings: function (BulkMessagingConfService) {
                    return BulkMessagingConfService.getSMSConfig();
                }
            }
        });

    });

    BulkMessagingConfigurationSettingsBulkSMSModule.controller('BulkMessagingConfigurationSettingsBulkSMSCtrl', function ($scope, $log, $state, $translate, notification, BulkMessagingConfService,
                                                                                                                          settings) {
        $log.debug('BulkMessagingConfigurationSettingsBulkSMSCtrl');

        $scope.settings = settings;

        $scope.originalSettings = angular.copy($scope.settings);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSettings, $scope.settings);
        };

        $scope.chargingStage = {
            submit: s.include($scope.settings.chargingStage, 'submit'),
            delivery: s.include($scope.settings.chargingStage, 'delivery')
        };

        $scope.changeChargingStage = function () {
            var chargingStageArr = [];
            if ($scope.chargingStage.delivery) {
                chargingStageArr.push('delivery');
            }

            if ($scope.chargingStage.submit) {
                chargingStageArr.push('submit');
            }

            if (chargingStageArr.length > 0) {
                $scope.settings.chargingStage = chargingStageArr.join('|');
            } else {
                $scope.settings.chargingStage = null;
            }
        };

        $scope.save = function (settings) {
            var settingsItem = {
                "chargingStage": settings.chargingStage,
                "messageRetryMaxCount": settings.messageRetryMaxCount,
                "blackListEnabled": settings.blackListEnabled,
                "disablePrepaidSender": settings.disablePrepaidSender,
                "dailyLimitEnabled": settings.dailyLimitEnabled,
                "dailyLimitValue": settings.dailyLimitValue
            };

            $log.debug('Updating bulk sms settings: ', settingsItem);

            BulkMessagingConfService.updateSMSConfig(settingsItem).then(function (response) {
                $log.debug('Updated bulk sms settings: ', settingsItem, ', response: ', response);

                $scope.originalSettings = angular.copy(settings);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update bulk sms settings: ', settingsItem, ', response: ', response);
            });
        }

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
