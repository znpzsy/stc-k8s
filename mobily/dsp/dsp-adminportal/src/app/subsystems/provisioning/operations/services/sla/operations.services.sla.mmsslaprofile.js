(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.sla.mmsslaprofile', []);

    var ProvisioningOperationsServicesMmsSlaProfileModule = angular.module('adminportal.subsystems.provisioning.operations.services.sla.mmsslaprofile');

    ProvisioningOperationsServicesMmsSlaProfileModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.sla.mmsslaprofile', {
            url: "/mms/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/sla/operations.services.sla.mmsslaprofile.detail.html',
            controller: 'ProvisioningOperationsServicesMmsSlaProfileCtrl',
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

    ProvisioningOperationsServicesMmsSlaProfileModule.controller('ProvisioningOperationsServicesMmsSlaProfileCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                              SERVICE_SLA_VIOLATION_POLICIES, service) {
        $log.debug('ProvisioningOperationsServicesMmsSlaProfileCtrl');

        $scope.service = service;

        $scope.SERVICE_SLA_VIOLATION_POLICIES = SERVICE_SLA_VIOLATION_POLICIES;

        // MMSSLAProfile
        var mmsSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_MMS_SLA_PROFILE);
        if (mmsSLAProfiles.length > 0) {
            $scope.service.mmsSLAProfile = angular.copy(mmsSLAProfiles[0]);
        } else {
            $scope.service.mmsSLAProfile = {
                IsMaxMMSSizeSLAEnabled: false,
                MaxMMSSize: null,
                MaxMMSSizeViolationPolicy: null,
                IsMaxRecipientsSLAEnabled: false,
                MaxRecipients: null,
                MaxRecipientsViolationPolicy: null,
                IsContentTypesSLAEnabled: false,
                ContentTypesSLAViolationPolicy: null
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

            // MMSSLAProfile
            if (service.mmsSLAProfile) {
                var originalMMSSLAProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_MMS_SLA_PROFILE);
                var updatedMMSSLAProfile = JSON.parse(angular.toJson(service.mmsSLAProfile));
                var mmsSLAProfileArray = CMPFService.prepareProfile(updatedMMSSLAProfile, originalMMSSLAProfile);
                // ---
                if (originalMMSSLAProfile) {
                    originalMMSSLAProfile.attributes = mmsSLAProfileArray;
                } else {
                    var mmsSLAProfile = {
                        name: CMPFService.SERVICE_MMS_SLA_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_MMS_SLA_PROFILE,
                        attributes: mmsSLAProfileArray
                    };

                    serviceItem.profiles.push(mmsSLAProfile);
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