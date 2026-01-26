(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.smscgtcorrection', []);

    var AntiSpamSMSConfigurationsSMSCGTCorrectionModule = angular.module('adminportal.products.antispamsms.configuration.settings.smscgtcorrection');

    AntiSpamSMSConfigurationsSMSCGTCorrectionModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.smscgtcorrection', {
            url: "/smscgtcorrection",
            templateUrl: "products/antispamsms/configuration/configuration.settings.smscgtcorrection.html",
            controller: 'AntiSpamSMSConfigurationsSMSCGTCorrectionCtrl',
            resolve: {
                smscGTConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSMSCGTConfiguration();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsSMSCGTCorrectionModule.controller('AntiSpamSMSConfigurationsSMSCGTCorrectionCtrl', function ($scope, $log, $state, $translate, notification, SMSAntiSpamConfigService, smscGTConf) {
        $log.debug('AntiSpamSMSConfigurationsSMSCGTCorrectionCtrl');

        $scope.smscGTCorrection = smscGTConf;

        $scope.originalSMSCGTCorrection = angular.copy($scope.smscGTCorrection);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSMSCGTCorrection, $scope.smscGTCorrection);
        };

        $scope.save = function (smscGTCorrection) {
            var smscGTCorrectionItem = {
                status: smscGTCorrection.status
            };

            SMSAntiSpamConfigService.updateSMSCGTConfiguration(smscGTCorrectionItem).then(function (response) {
                $log.debug('Updated smsc gt correction configuration: ', smscGTCorrection, ', response: ', response);

                $scope.originalSMSCGTCorrection = angular.copy(smscGTCorrection);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update smsc gt correction configuration: ', smscGTCorrection, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
