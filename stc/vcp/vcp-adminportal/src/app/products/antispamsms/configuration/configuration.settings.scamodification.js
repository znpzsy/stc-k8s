(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.scamodification', []);

    var AntiSpamSMSConfigurationsSCAModificationModule = angular.module('adminportal.products.antispamsms.configuration.settings.scamodification');

    AntiSpamSMSConfigurationsSCAModificationModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.scamodification', {
            url: "/sca-modification",
            templateUrl: "products/antispamsms/configuration/configuration.settings.scamodification.html",
            controller: 'AntiSpamSMSConfigurationsSCAModificationCtrl',
            resolve: {
                scaModificationConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSCAModificationConfiguration();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsSCAModificationModule.controller('AntiSpamSMSConfigurationsSCAModificationCtrl', function ($scope, $log, $state, $translate, notification, SMSAntiSpamConfigService, scaModificationConf) {
        $log.debug('AntiSpamSMSConfigurationsSCAModificationCtrl');

        $scope.scaModification = {
            status: scaModificationConf.active
        };

        $scope.originalSCAModification = angular.copy($scope.scaModification);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSCAModification, $scope.scaModification);
        };

        $scope.save = function (scaModification) {
            var scaModificationItem = {
                status: scaModification.status
            };

            SMSAntiSpamConfigService.updateSCAModificationConfiguration(scaModificationItem).then(function (response) {
                $log.debug('Updated imsi masking configuration: ', scaModification, ', response: ', response);

                $scope.originalSCAModification = angular.copy(scaModification);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update imsi masking configuration: ', scaModification, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
