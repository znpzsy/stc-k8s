(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.sla.dcbslasettings', []);

    var PartnerInfoServicesDcbSlaSettingsModule = angular.module('partnerportal.partner-info.services.sla.dcbslasettings');

    PartnerInfoServicesDcbSlaSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.sla.dcbslasettings', {
            url: "/dcb/:serviceId",
            templateUrl: 'partner-info/services/sla/operations.services.sla.dcbslasettings.detail.html',
            controller: 'PartnerInfoServicesDcbSlaSettingsCtrl',
            data: {
                backState: 'partner-info.services.list'
            },
            resolve: {
                service: function ($stateParams, CMPFService) {
                    return CMPFService.getService($stateParams.serviceId);
                }
            }
        });

    });

    PartnerInfoServicesDcbSlaSettingsModule.controller('PartnerInfoServicesDcbSlaSettingsCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                          DURATION_UNITS, service) {
        $log.debug('PartnerInfoServicesDcbSlaSettingsCtrl');

        $scope.service = service;

        $scope.DURATION_UNITS = DURATION_UNITS;

        // DCBServiceSLAProfile
        var dcbServiceSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_SLA_PROFILE);
        if (dcbServiceSLAProfiles.length > 0) {
            $scope.service.dcbServiceSLAProfile = angular.copy(dcbServiceSLAProfiles[0]);

            $scope.service.dcbServiceSLAProfile.maxAllowedPartialRefundPeriod = UtilService.convertPeriodStringToSimpleObject($scope.service.dcbServiceSLAProfile.maxAllowedPartialRefundPeriod);
            $scope.service.dcbServiceSLAProfile.maxAllowedRefundPeriod = UtilService.convertPeriodStringToSimpleObject($scope.service.dcbServiceSLAProfile.maxAllowedRefundPeriod);
            $scope.service.dcbServiceSLAProfile.maxAllowedReverseChargePeriod = UtilService.convertPeriodStringToSimpleObject($scope.service.dcbServiceSLAProfile.maxAllowedReverseChargePeriod);
        } else {
            $scope.service.dcbServiceSLAProfile = {
                allowCustomerEligibilityCheck: false,
                allowCustomerProfileLookup: false,
                allowPaymentStatusQuery: false,
                allowDebit: false,
                allowReservation: false,
                allowExtendShrink: false,
                maxAllowedChargeAmount: 0,
                allowRefund: false,
                allowRefundStatusQuery: false,
                maxAllowedRefundPeriod: {
                    duration: 1,
                    unit: $scope.DURATION_UNITS[3].key
                },
                maxAllowedRefundAmount: 0,
                allowPartialRefund: false,
                maxAllowedPartialRefundPeriod: {
                    duration: 1,
                    unit: $scope.DURATION_UNITS[3].key
                },
                allowSilentRefund: false,
                maxAllowedTrxPerDay: 0,
                maxAllowedTrxPerHour: 0,
                maxAllowedTrxPerMinute: 0,
                allowSubscriptionByOTT: false,
                allowSubscriptionByOperator: false,
                allowReverseCharge: false,
                maxAllowedReverseChargePeriod: {
                    duration: 1,
                    unit: $scope.DURATION_UNITS[0].key
                }
            };
        }
    });


})();