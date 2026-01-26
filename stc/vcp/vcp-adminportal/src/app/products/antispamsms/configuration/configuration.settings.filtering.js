(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.filtering', []);

    var AntiSpamSMSConfigurationsFilteringModule = angular.module('adminportal.products.antispamsms.configuration.settings.filtering');

    AntiSpamSMSConfigurationsFilteringModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.filtering', {
            url: "/filtering",
            templateUrl: "products/antispamsms/configuration/configuration.settings.filtering.html",
            controller: 'AntiSpamSMSConfigurationsFilteringCtrl',
            resolve: {
                filteringConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMainFilteringConfiguration();
                },
                applicationMTFilteringConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getApplicationMTFilteringConfiguration();
                },
                intlToInboundFilteringConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getIntlToInboundFilteringConfiguration();
                },
                sriSMFilteringConf: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSRISMFilteringConfiguration();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsFilteringModule.controller('AntiSpamSMSConfigurationsFilteringCtrl', function ($scope, $log, $state, $q, $translate, notification, SMS_ANTISPAM_REJECT_METHODS_2, SMS_ANTISPAM_REJECTION_ERROR_CODES,
                                                                                                            SMSAntiSpamConfigService, filteringConf, applicationMTFilteringConf, intlToInboundFilteringConf, sriSMFilteringConf) {
        $log.debug('AntiSpamSMSConfigurationsFilteringCtrl');

        $scope.SMS_ANTISPAM_REJECT_METHODS_2 = SMS_ANTISPAM_REJECT_METHODS_2;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;

        $scope.filtering = {
            enabled: true,
            // Main filtering configuration
            policyInEffect: filteringConf.rejectMethod,
            defaultMOFSMRejectionErrorCode: filteringConf.moRejectCode,
            defaultMTFSMRejectionErrorCode: filteringConf.mtRejectCode,
            // Application MT
            applicationMTFilteringFeatureEnabled: applicationMTFilteringConf.status ? applicationMTFilteringConf.status : false,
            // Intl to Inbound Roamer
            internationalToInboundRoamerFilteringFeatureEnabled: intlToInboundFilteringConf.status ? intlToInboundFilteringConf.status : false,
            // SRI-SM
            srismFilteringFeatureEnabled: sriSMFilteringConf.status ? sriSMFilteringConf.status : false,
            replySRIFSMwithRealMSC: filteringConf.replySRIFSMwithRealMSC ? filteringConf.replySRIFSMwithRealMSC : false
        };

        $scope.originalFiltering = angular.copy($scope.filtering);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalFiltering, $scope.filtering);
        };

        var updateMainFilteringConf = function (filtering) {
            var filteringItem = {
                "rejectMethod": filtering.policyInEffect,
                "moRejectCode": filtering.defaultMOFSMRejectionErrorCode,
                "mtRejectCode": filtering.defaultMTFSMRejectionErrorCode,
                "replySRIFSMwithRealMSC": filtering.replySRIFSMwithRealMSC,
                // Other values
                "memcachedServers": $scope.originalFiltering.memcachedServers ? $scope.originalFiltering.memcachedServers : '',
                "messageHistorySize": $scope.originalFiltering.messageHistorySize ? $scope.originalFiltering.messageHistorySize : 0,
                "smsAntispamLocalPointCode": $scope.originalFiltering.smsAntispamLocalPointCode ? $scope.originalFiltering.smsAntispamLocalPointCode : '',
                "smsAntispamSSN": $scope.originalFiltering.smsAntispamSSN ? $scope.originalFiltering.smsAntispamSSN : '',
                "smscGtAddress": $scope.originalFiltering.smscGtAddress ? $scope.originalFiltering.smscGtAddress : '',
                "smscSSN": $scope.originalFiltering.smscSSN ? $scope.originalFiltering.smscSSN : '',
                "smsAntispamGtAddress": $scope.originalFiltering.smsAntispamGtAddress ? $scope.originalFiltering.smsAntispamGtAddress : ''
            };

            return SMSAntiSpamConfigService.updateMainFilteringConfiguration(filteringItem);
        };

        var updateApplicationMTFilteringConf = function (applicationMTFilteringFeatureEnabled) {
            var statusItem = {
                status: applicationMTFilteringFeatureEnabled
            };

            return SMSAntiSpamConfigService.updateApplicationMTFilteringConfiguration(statusItem);
        };

        var updateIntlToInboundFilteringConf = function (internationalToInboundRoamerFilteringFeatureEnabled) {
            var statusItem = {
                status: internationalToInboundRoamerFilteringFeatureEnabled
            };

            return SMSAntiSpamConfigService.updateIntlToInboundFilteringConfiguration(statusItem);
        };

        var updateSRISMFilteringConf = function (srismFilteringFeatureEnabled) {
            var statusItem = {
                status: srismFilteringFeatureEnabled
            };

            return SMSAntiSpamConfigService.updateSRISMFilteringConfiguration(statusItem);
        };

        $scope.save = function (filtering) {
            $q.all([
                updateMainFilteringConf(filtering),
                updateApplicationMTFilteringConf(filtering.applicationMTFilteringFeatureEnabled),
                updateIntlToInboundFilteringConf(filtering.internationalToInboundRoamerFilteringFeatureEnabled),
                updateSRISMFilteringConf(filtering.srismFilteringFeatureEnabled)
            ]).then(function (response) {
                $log.debug('Updated filtering configuration: ', filtering, ', response: ', response);

                $scope.originalFiltering = angular.copy(filtering);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }, function (response) {
                $log.debug('Cannot update filtering configuration: ', filtering, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
