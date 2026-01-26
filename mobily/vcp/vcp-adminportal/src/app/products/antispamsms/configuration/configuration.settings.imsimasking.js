(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.imsimasking', []);

    var AntiSpamSMSConfigurationsIMSIMaskingModule = angular.module('adminportal.products.antispamsms.configuration.settings.imsimasking');

    AntiSpamSMSConfigurationsIMSIMaskingModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.imsimasking', {
            url: "/imsimasking",
            templateUrl: "products/antispamsms/configuration/configuration.settings.imsimasking.html",
            controller: 'AntiSpamSMSConfigurationsIMSIMaskingCtrl',
            resolve: {
                imsiMaskingConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getIMSIMaskingConfiguration();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsIMSIMaskingModule.controller('AntiSpamSMSConfigurationsIMSIMaskingCtrl', function ($scope, $log, $state, $translate, notification, SMSAntiSpamConfigService, imsiMaskingConf) {
        $log.debug('AntiSpamSMSConfigurationsIMSIMaskingCtrl');

        imsiMaskingConf = imsiMaskingConf.allImsiMasking[0];

        $scope.imsiMasking = {
            status: imsiMaskingConf.active,
            name: imsiMaskingConf.name
        };

        $scope.originalIMSIMasking = angular.copy($scope.imsiMasking);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalIMSIMasking, $scope.imsiMasking);
        };

        $scope.save = function (imsiMasking) {
            var imsiMaskingItem = {
                active: imsiMasking.status,
                name: imsiMasking.name
            };

            SMSAntiSpamConfigService.updateIMSIMaskingConfiguration(imsiMaskingConf.name, imsiMaskingItem).then(function (response) {
                $log.debug('Updated imsi masking configuration: ', imsiMasking, ', response: ', response);

                $scope.originalIMSIMasking = angular.copy(imsiMasking);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update imsi masking configuration: ', imsiMasking, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
