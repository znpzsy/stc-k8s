(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.sla.webwapslaprofile', []);

    var ProvisioningOperationsServicesWebWapSlaProfileModule = angular.module('adminportal.subsystems.provisioning.operations.services.sla.webwapslaprofile');

    ProvisioningOperationsServicesWebWapSlaProfileModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.sla.webwapslaprofile', {
            url: "/web-wap/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/sla/operations.services.sla.webwapslaprofile.detail.html',
            controller: 'ProvisioningOperationsServicesWebWapSlaProfileCtrl',
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

    ProvisioningOperationsServicesWebWapSlaProfileModule.controller('ProvisioningOperationsServicesWebWapSlaProfileCtrl', function ($scope, $log, $state, $translate, notification, UtilService, CMPFService,
                                                                                                                                    SERVICE_SLA_VIOLATION_POLICIES, service) {
        $log.debug('ProvisioningOperationsServicesWebWapSlaProfileCtrl');

        $scope.service = service;

        $scope.SERVICE_SLA_VIOLATION_POLICIES = SERVICE_SLA_VIOLATION_POLICIES;

        // WEBWAPSLAProfile
        var webWAPSLAProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_WEB_WAP_SLA_PROFILE);
        if (webWAPSLAProfiles.length > 0) {
            $scope.service.webWAPSLAProfile = angular.copy(webWAPSLAProfiles[0]);
        } else {
            $scope.service.webWAPSLAProfile = {
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

            // WEBWAPSLAProfile
            if (service.webWAPSLAProfile) {
                var originalWEBWAPSLAProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_WEB_WAP_SLA_PROFILE);
                var updatedWEBWAPSLAProfile = JSON.parse(angular.toJson(service.webWAPSLAProfile));
                var webWAPSLAProfileArray = CMPFService.prepareProfile(updatedWEBWAPSLAProfile, originalWEBWAPSLAProfile);
                // ---
                if (originalWEBWAPSLAProfile) {
                    originalWEBWAPSLAProfile.attributes = webWAPSLAProfileArray;
                } else {
                    var webWAPSLAProfile = {
                        name: CMPFService.SERVICE_WEB_WAP_SLA_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_WEB_WAP_SLA_PROFILE,
                        attributes: webWAPSLAProfileArray
                    };

                    serviceItem.profiles.push(webWAPSLAProfile);
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