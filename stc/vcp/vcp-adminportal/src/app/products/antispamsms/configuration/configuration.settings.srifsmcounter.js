(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.srifsmcounter', []);

    var AntiSpamSMSConfigurationsSRIFSMCounterModule = angular.module('adminportal.products.antispamsms.configuration.settings.srifsmcounter');

    AntiSpamSMSConfigurationsSRIFSMCounterModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.srifsmcounter', {
            url: "/sri-sm-counter",
            templateUrl: "products/antispamsms/configuration/configuration.settings.srifsmcounter.html",
            controller: 'AntiSpamSMSConfigurationsSRIFSMCounterCtrl',
            resolve: {
                srifsmcounterConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSRIFSMCounterConfiguration();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsSRIFSMCounterModule.controller('AntiSpamSMSConfigurationsSRIFSMCounterCtrl', function ($scope, $log, $state, $q, $translate, notification, SMS_ANTISPAM_REJECT_METHODS_1, SMS_ANTISPAM_REJECTION_ERROR_CODES,
                                                                                                                    SMSAntiSpamConfigService, srifsmcounterConf) {
        $log.debug('AntiSpamSMSConfigurationsSRIFSMCounterCtrl');

        $scope.SMS_ANTISPAM_REJECT_METHODS_1 = SMS_ANTISPAM_REJECT_METHODS_1;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;

        $scope.srifsmcounter = {
            rejectMethod: srifsmcounterConf.rejectMethod,
            rejectCode: srifsmcounterConf.rejectCode,
            callingGtCheck: srifsmcounterConf.callingGtCheck,
            duration: srifsmcounterConf.duration,
            maxReqCallingGt: srifsmcounterConf.maxReqCallingGt,
            smscGtCheck: srifsmcounterConf.smscGtCheck,
            maxReqSmscGt: srifsmcounterConf.maxReqSmscGt
        };

        $scope.originalSrifsmcounter = angular.copy($scope.srifsmcounter);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSrifsmcounter, $scope.srifsmcounter);
        };

        $scope.save = function (srifsmcounter) {
            var srifsmcounterItem = {
                "rejectMethod": srifsmcounter.rejectMethod,
                "rejectCode": srifsmcounter.rejectCode,
                "callingGtCheck": srifsmcounter.callingGtCheck,
                "duration": srifsmcounter.duration,
                "maxReqCallingGt": srifsmcounter.maxReqCallingGt,
                "smscGtCheck": srifsmcounter.smscGtCheck,
                "maxReqSmscGt": srifsmcounter.maxReqSmscGt
            };

            SMSAntiSpamConfigService.updateSRIFSMCounterConfiguration(srifsmcounterItem).then(function (response) {
                $log.debug('Updated srifsmcounter configuration: ', srifsmcounter, ', response: ', response);

                $scope.originalSrifsmcounter = angular.copy($scope.srifsmcounter);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update srifsmcounter configuration: ', srifsmcounter, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
