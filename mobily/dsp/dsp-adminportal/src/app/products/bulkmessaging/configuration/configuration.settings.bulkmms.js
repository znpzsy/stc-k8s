(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.configuration.settings.bulkmms', [
        'adminportal.products.bulkmessaging.configuration.settings.bulkmms.mm7routelist'
    ]);

    var BulkMessagingConfigurationSettingsBulkMMSModule = angular.module('adminportal.products.bulkmessaging.configuration.settings.bulkmms');

    BulkMessagingConfigurationSettingsBulkMMSModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.configuration.settings.bulkmms', {
            url: "/bulkmms",
            templateUrl: "products/bulkmessaging/configuration/configuration.settings.bulkmms.html",
            controller: "BulkMessagingConfigurationSettingsBulkMMSCtrl",
            resolve: {
                settings: function (BulkMessagingConfService) {
                    return BulkMessagingConfService.getMMSConfig();
                }
            }
        });

    });

    BulkMessagingConfigurationSettingsBulkMMSModule.controller('BulkMessagingConfigurationSettingsBulkMMSCtrl', function ($scope, $log, $state, $controller, $uibModal, $translate, notification,
                                                                                                                          BulkMessagingConfService, settings) {
        $log.debug('BulkMessagingConfigurationSettingsBulkMMSCtrl');

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
                "notifyRetryMaxCount": settings.notifyRetryMaxCount,
                "blackListEnabled": settings.blackListEnabled,
                "disablePrepaidSender": settings.disablePrepaidSender,
                "dailyLimitEnabled": settings.dailyLimitEnabled,
                "dailyLimitValue": settings.dailyLimitValue,
                "mM7Enabled": settings.mM7Enabled,
                "mM7SocketTimeout": settings.mM7SocketTimeout,
                "messageExpiryDuration": settings.messageExpiryDuration,
                "messageExpiredSubject": settings.messageExpiredSubject,
            };

            $log.debug('Updating bulk mms settings: ', settingsItem);

            BulkMessagingConfService.updateMMSConfig(settingsItem).then(function (response) {
                $log.debug('Updated bulk mms settings: ', settingsItem, ', response: ', response);

                $scope.originalSettings = angular.copy(settings);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update bulk mms settings: ', settingsItem, ', response: ', response);
            });
        }

        // Opens the mm7 route list management modal.
        $scope.manageMM7RouteList = function () {
            $uibModal.open({
                templateUrl: 'products/bulkmessaging/configuration/configuration.settings.bulkmms.mm7routelist.modal.html',
                size: 'lg',
                controller: 'BulkMessagingConfigurationSettingsBulkMMSMM7RouteListCtrl',
                resolve: {}
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
