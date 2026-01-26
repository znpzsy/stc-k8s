(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.sla.dcbslasettings', []);

    var ProvisioningOperationsServicesDcbSlaSettingsModule = angular.module('adminportal.subsystems.provisioning.operations.services.sla.dcbslasettings');

    ProvisioningOperationsServicesDcbSlaSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.sla.dcbslasettings', {
            url: "/dcb/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/sla/operations.services.sla.dcbslasettings.detail.html',
            controller: 'ProvisioningOperationsServicesDcbSlaSettingsCtrl',
            data: {
                backState: 'subsystems.provisioning.operations.services.list'
            },
            resolve: {
                service: function ($stateParams, CMPFService) {
                    return CMPFService.getService($stateParams.serviceId);
                }
            }
        });

    });

    ProvisioningOperationsServicesDcbSlaSettingsModule.controller('ProvisioningOperationsServicesDcbSlaSettingsCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                                DURATION_UNITS, service) {
        $log.debug('ProvisioningOperationsServicesDcbSlaSettingsCtrl');

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

        $scope.originalService = angular.copy($scope.service);
        $scope.isNotChanged = function () {
            return angular.equals($scope.service, $scope.originalService);
        };

        $scope.save = function (service) {
            var serviceItem = {
                id: $scope.originalService.id,
                name: $scope.originalService.name,
                // Changed fields
                organizationId: $scope.originalService.organizationId,
                state: $scope.originalService.state,
                profiles: $scope.originalService.profiles
            };

            // DCBServiceSLAProfile
            if (service.dcbServiceSLAProfile) {
                var originalDCBServiceSLAProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_SLA_PROFILE);
                var updatedDCBServiceSLAProfile = JSON.parse(angular.toJson(service.dcbServiceSLAProfile));

                // Modify some attributes here.
                updatedDCBServiceSLAProfile.maxAllowedPartialRefundPeriod = UtilService.convertSimpleObjectToPeriod(updatedDCBServiceSLAProfile.maxAllowedPartialRefundPeriod);
                updatedDCBServiceSLAProfile.maxAllowedRefundPeriod = UtilService.convertSimpleObjectToPeriod(updatedDCBServiceSLAProfile.maxAllowedRefundPeriod);
                updatedDCBServiceSLAProfile.maxAllowedReverseChargePeriod = UtilService.convertSimpleObjectToPeriod(updatedDCBServiceSLAProfile.maxAllowedReverseChargePeriod);

                var dcbServiceSLAProfileArray = CMPFService.prepareProfile(updatedDCBServiceSLAProfile, originalDCBServiceSLAProfile);
                // ---
                if (originalDCBServiceSLAProfile) {
                    originalDCBServiceSLAProfile.attributes = dcbServiceSLAProfileArray;
                } else {
                    var dcbServiceSLAProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_SLA_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_SLA_PROFILE,
                        attributes: dcbServiceSLAProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceSLAProfile);
                }
            }

            $log.debug('Trying to update service: ', serviceItem);

            CMPFService.updateService(serviceItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go($state.$current.data.backState);
                }
            }, function (response) {
                $log.debug('Cannot update service. Error: ', response);

                CMPFService.showApiError(response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });


})();