(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.frauddetection', []);

    var AntiSpamSMSConfigurationsFraudDetectionModule = angular.module('adminportal.products.antispamsms.configuration.settings.frauddetection');

    AntiSpamSMSConfigurationsFraudDetectionModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.frauddetection', {
            url: "/frauddetection",
            templateUrl: "products/antispamsms/configuration/configuration.settings.frauddetection.html",
            controller: 'AntiSpamSMSConfigurationsFraudDetectionCtrl',
            resolve: {
                fraudDetectionConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionConfiguration();
                },
                fraudDetectionMOIBConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionConfiguration(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB);
                },
                fraudDetectionMOOBConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionConfiguration(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB);
                },
                fraudDetectionMTFraudConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getFraudDetectionConfiguration(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD);
                },
                fraudDetectionMOAntiSpoofingConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMOAntiSpoofingConfiguration();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsFraudDetectionModule.controller('AntiSpamSMSConfigurationsFraudDetectionCtrl', function ($scope, $log, $state, $q, $translate, notification, SMS_ANTISPAM_REJECT_METHODS_2, SMS_ANTISPAM_REJECTION_ERROR_CODES,
                                                                                                                      SMS_ANTISPAM_CHECKING_PARAMETERS, SMSAntiSpamConfigService, fraudDetectionConf, fraudDetectionMOIBConf,
                                                                                                                      fraudDetectionMOOBConf, fraudDetectionMTFraudConf, fraudDetectionMOAntiSpoofingConf) {
        $log.debug('AntiSpamSMSConfigurationsFraudDetectionCtrl');

        $scope.SMS_ANTISPAM_REJECT_METHODS_2 = SMS_ANTISPAM_REJECT_METHODS_2;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;
        $scope.SMS_ANTISPAM_CHECKING_PARAMETERS = SMS_ANTISPAM_CHECKING_PARAMETERS;

        $scope.fraudDetection = {
            // Main configuration
            mainConf: {
                status: fraudDetectionConf.status,
                rejectMethod: fraudDetectionConf.rejectMethod,
                rejectCode: fraudDetectionConf.rejectCode,
            },
            // MO IB configuration
            moFSMInboundConf: {
                name: fraudDetectionMOIBConf.name,
                status: fraudDetectionMOIBConf.status,
                rejectMethod: fraudDetectionMOIBConf.rejectMethod,
                rejectCode: fraudDetectionMOIBConf.rejectCode
            },
            // MO OB configuration
            moFSMOutboundConf: {
                name: fraudDetectionMOOBConf.name,
                status: fraudDetectionMOOBConf.status,
                rejectMethod: fraudDetectionMOOBConf.rejectMethod,
                rejectCode: fraudDetectionMOOBConf.rejectCode
            },
            // MT fraud configuration
            mtFSMConf: {
                name: fraudDetectionMTFraudConf.name,
                status: fraudDetectionMTFraudConf.status,
                rejectMethod: fraudDetectionMTFraudConf.rejectMethod,
                rejectCode: fraudDetectionMTFraudConf.rejectCode,
                checkingParameters: fraudDetectionMTFraudConf.checkingParameters
            },
            // MO Anti-Spoofing
            moAntiSpoofingConf: {
                status: fraudDetectionMOAntiSpoofingConf.status,
                rejectMethod: fraudDetectionMOAntiSpoofingConf.rejectMethod,
                rejectCode: fraudDetectionMOAntiSpoofingConf.rejectCode,
                rejectMOFSMWithoutIMSI: fraudDetectionMOAntiSpoofingConf.rejectMOFSMWithoutIMSI,
                verifyWithSRIAttributes: fraudDetectionMOAntiSpoofingConf.verifyWithSRIAttributes,
                comparisionSensitiviy: fraudDetectionMOAntiSpoofingConf.comparisionSensitiviy
            }
        };

        $scope.originalFraudDetection = angular.copy($scope.fraudDetection);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalFraudDetection, $scope.fraudDetection);
        };

        var updateFraudDetectionConf = function (mainConf) {
            var confItem = {
                "status": mainConf.status,
                "rejectMethod": mainConf.rejectMethod,
                "rejectCode": mainConf.rejectCode
            };

            return SMSAntiSpamConfigService.updateFraudDetectionConfiguration(confItem);
        };
        var updateFraudDetectionMOIBConf = function (moFSMInboundConf) {
            var confItem = {
                "name": $scope.originalFraudDetection.moFSMInboundConf.name,
                "status": moFSMInboundConf.status,
                "rejectMethod": moFSMInboundConf.rejectMethod,
                "rejectCode": moFSMInboundConf.rejectCode
            };

            return SMSAntiSpamConfigService.updateFraudDetectionConfiguration(confItem, SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB);
        };
        var updateFraudDetectionMOOBConf = function (moFSMOutboundConf) {
            var confItem = {
                "name": $scope.originalFraudDetection.moFSMOutboundConf.name,
                "status": moFSMOutboundConf.status,
                "rejectMethod": moFSMOutboundConf.rejectMethod,
                "rejectCode": moFSMOutboundConf.rejectCode
            };

            return SMSAntiSpamConfigService.updateFraudDetectionConfiguration(confItem, SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB);
        };
        var updateFraudDetectionMTFraudConf = function (mtFSMConf) {
            var confItem = {
                "name": $scope.originalFraudDetection.mtFSMConf.name,
                "status": mtFSMConf.status,
                "rejectMethod": mtFSMConf.rejectMethod,
                "rejectCode": mtFSMConf.rejectCode,
                "checkingParameters": mtFSMConf.checkingParameters
            };

            return SMSAntiSpamConfigService.updateFraudDetectionConfiguration(confItem, SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD);
        };
        var updateFraudDetectionMOAntiSpoofingConf = function (moAntiSpoofingConf) {
            var confItem = {
                "status": moAntiSpoofingConf.status,
                "rejectMethod": moAntiSpoofingConf.rejectMethod,
                "rejectCode": moAntiSpoofingConf.rejectCode,
                "rejectMOFSMWithoutIMSI": moAntiSpoofingConf.rejectMOFSMWithoutIMSI,
                "verifyWithSRIAttributes": moAntiSpoofingConf.verifyWithSRIAttributes,
                "comparisionSensitiviy": moAntiSpoofingConf.comparisionSensitiviy
            };

            return SMSAntiSpamConfigService.updateMOAntiSpoofingConfiguration(confItem);
        };

        $scope.save = function (fraudDetection) {
            /*
             * Below update requests have made cascaded, since the restful service can not handle parallel update requests
             * because of the updates are handling in same transaction.
             */
            updateFraudDetectionConf(fraudDetection.mainConf).then(function (response) {
                $log.debug('Updated fraud detection main configuration: ', fraudDetection.mainConf, ', response: ', response);

                $scope.originalFraudDetection.mainConf = angular.copy(fraudDetection.mainConf);

                updateFraudDetectionMOIBConf(fraudDetection.moFSMInboundConf).then(function (response) {
                    $log.debug('Updated fraud detection moFSMInbound configuration: ', fraudDetection.moFSMInboundConf, ', response: ', response);

                    $scope.originalFraudDetection.moFSMInboundConf = angular.copy(fraudDetection.moFSMInboundConf);

                    updateFraudDetectionMOOBConf(fraudDetection.moFSMOutboundConf).then(function (response) {
                        $log.debug('Updated fraud detection moFSMOutbound configuration: ', fraudDetection.moFSMOutboundConf, ', response: ', response);

                        $scope.originalFraudDetection.moFSMOutboundConf = angular.copy(fraudDetection.moFSMOutboundConf);

                        updateFraudDetectionMTFraudConf(fraudDetection.mtFSMConf).then(function (response) {
                            $log.debug('Updated fraud detection mtFSM configuration: ', fraudDetection.mtFSMConf, ', response: ', response);

                            $scope.originalFraudDetection.mtFSMConf = angular.copy(fraudDetection.mtFSMConf);

                            updateFraudDetectionMOAntiSpoofingConf(fraudDetection.moAntiSpoofingConf).then(function (response) {
                                $log.debug('Updated fraud detection moAntiSpoofing configuration: ', fraudDetection.moAntiSpoofingConf, ', response: ', response);

                                $scope.originalFraudDetection.moAntiSpoofingConf = angular.copy(fraudDetection.moAntiSpoofingConf);

                                notification({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });
                            }, function (response) {
                                $log.debug('Cannot update fraud detection moAntiSpoofing configuration: ', fraudDetection.moAntiSpoofingConf, ', response: ', response);
                            });
                        }, function (response) {
                            $log.debug('Cannot update fraud detection mtFSM configuration: ', fraudDetection.mtFSMConf, ', response: ', response);
                        });
                    }, function (response) {
                        $log.debug('Cannot update fraud detection moFSMOutbound configuration: ', fraudDetection.moFSMOutboundConf, ', response: ', response);
                    });
                }, function (response) {
                    $log.debug('Cannot update fraud detection moFSMInbound configuration: ', fraudDetection.moFSMInboundConf, ', response: ', response);
                });
            }, function (response) {
                $log.debug('Cannot update fraud detection main configuration: ', fraudDetection.mainConf, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
