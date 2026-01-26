(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates.dcbprofile', []);

    var ProvisioningOperationsServicesDcbTemplatesDcbProfileModule = angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates.dcbprofile');

    ProvisioningOperationsServicesDcbTemplatesDcbProfileModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.dcbtemplates.dcbprofile', {
            url: "/dcb-profile",
            templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbtemplates.dcbprofile.detail.html',
            controller: 'ProvisioningOperationsServicesDcbTemplatesDcbProfileCtrl'
        });

    });

    ProvisioningOperationsServicesDcbTemplatesDcbProfileModule.controller('ProvisioningOperationsServicesDcbTemplatesDcbProfileCtrl', function ($scope, $log, $state, $translate, notification, CMPFService, service) {
        $log.debug('ProvisioningOperationsServicesDcbTemplatesDcbProfileCtrl');

        $scope.service = service;

        // DCBServiceProfile
        var dcbServiceProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
        if (dcbServiceProfiles.length > 0) {
            $scope.service.dcbServiceProfile = angular.copy(dcbServiceProfiles[0]);
        } else {
            $scope.service.dcbServiceProfile = {
                SenderID: '',
                AggregatorName: '',
                OTTName: '',
                CarrierId: '',
                SilentSMSShortCode: '',
                Currency: 'SAR',
                TrustStatus: 'UNTRUSTED',
                IsCapped: false,
                AssociationAPIURL: '',
                DeassociationAPIURL: '',
                ClientAPIUsername: '',
                ClientAPIPassword: ''
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

            // DCBServiceProfile
            if (service.dcbServiceProfile) {
                var originalDCBServiceProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
                var updatedDCBServiceProfile = JSON.parse(angular.toJson(service.dcbServiceProfile));
                var dcbServiceProfileArray = CMPFService.prepareProfile(updatedDCBServiceProfile, originalDCBServiceProfile);
                // ---
                if (originalDCBServiceProfile) {
                    originalDCBServiceProfile.attributes = dcbServiceProfileArray;
                } else {
                    var dcbServiceProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_PROFILE,
                        attributes: dcbServiceProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceProfile);
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