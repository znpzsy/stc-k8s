(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.sla.smsslaprofile', []);

    var ProvisioningOperationsServicesSmsSlaProfileModule = angular.module('adminportal.subsystems.provisioning.operations.services.sla.smsslaprofile');

    ProvisioningOperationsServicesSmsSlaProfileModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.sla.smsslaprofile', {
            url: "/sms/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/sla/operations.services.sla.smsslaprofile.detail.html',
            controller: 'ProvisioningOperationsServicesSmsSlaProfileCtrl',
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

    ProvisioningOperationsServicesSmsSlaProfileModule.controller('ProvisioningOperationsServicesSmsSlaProfileCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                              SERVICE_SLA_VIOLATION_POLICIES, service) {
        $log.debug('ProvisioningOperationsServicesSmsSlaProfileCtrl');

        $scope.service = service;

        $scope.SERVICE_SLA_VIOLATION_POLICIES = SERVICE_SLA_VIOLATION_POLICIES;

        // SMSSLAProfile
        var smsSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_SMS_SLA_PROFILE);
        if (smsSLAProfiles.length > 0) {
            $scope.service.smsSLAProfile = angular.copy(smsSLAProfiles[0]);
        } else {
            $scope.service.smsSLAProfile = {
                IsMaxSMSLengthSLAEnabled: false,
                MaxSMSLength: null,
                MaxSMSLengthSLAViolationPolicy: null,
                IsMaxRecipientsSLAEnabled: false,
                MaxRecipients: null,
                MaxRecipientsSLAViolationPolicy: null
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

            // SMSSLAProfile
            if (service.smsSLAProfile) {
                var originalSMSSLAProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_SMS_SLA_PROFILE);
                var updatedSMSSLAProfile = JSON.parse(angular.toJson(service.smsSLAProfile));
                var smsSLAProfileArray = CMPFService.prepareProfile(updatedSMSSLAProfile, originalSMSSLAProfile);
                // ---
                if (originalSMSSLAProfile) {
                    originalSMSSLAProfile.attributes = smsSLAProfileArray;
                } else {
                    var smsSLAProfile = {
                        name: CMPFService.SERVICE_SMS_SLA_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_SMS_SLA_PROFILE,
                        attributes: smsSLAProfileArray
                    };

                    serviceItem.profiles.push(smsSLAProfile);
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