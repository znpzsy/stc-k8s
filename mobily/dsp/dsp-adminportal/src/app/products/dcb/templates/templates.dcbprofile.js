(function () {

    'use strict';

    angular.module('adminportal.products.dcb.templates.dcbprofile', []);

    var DcbTemplatesDCBProfileModule = angular.module('adminportal.products.dcb.templates.dcbprofile');

    DcbTemplatesDCBProfileModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.templates.dcbprofile', {
            url: "/dcb-profile",
            templateUrl: "products/dcb/templates/templates.dcbprofile.details.html",
            controller: 'DcbTemplatesDCBProfileCtrl'
        });

    });

    DcbTemplatesDCBProfileModule.controller('DcbTemplatesDCBProfileCtrl', function ($scope, $log, $state, $filter, $translate, notification, CMPFService, dcbSettingsOrganization) {
        $log.debug('DcbTemplatesDCBProfileCtrl');

        $scope.dcbSettingsOrganization = dcbSettingsOrganization.organizations[0] || {};

        // DCBProfile
        var dcbProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_PROFILE);
        if (dcbProfiles.length > 0) {
            $scope.dcbProfile = angular.copy(dcbProfiles[0]);
        } else {
            $scope.dcbProfile = {
                SenderID: '',
                Currency: 'SAR',
                IsCapped: false,
                LastUpdateTime: null
            };
        }

        $scope.originalDcbProfile = angular.copy($scope.dcbProfile);
        $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
        $scope.isNotChanged = function () {
            return angular.equals($scope.dcbSettingsOrganization, $scope.originalDcbSettingsOrganization) &&
                angular.equals($scope.dcbProfile, $scope.originalDcbProfile);
        };

        $scope.save = function (dcbSettingsOrganization, dcbProfile) {
            // Update the last update time for create first time or for update everytime.
            dcbProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var dcbSettingsOrganizationItem = {
                id: $scope.originalDcbSettingsOrganization.id,
                name: $scope.originalDcbSettingsOrganization.name,
                type: $scope.originalDcbSettingsOrganization.type,
                orgType: $scope.originalDcbSettingsOrganization.orgType,
                parentId: $scope.originalDcbSettingsOrganization.parentId,
                parentName: $scope.originalDcbSettingsOrganization.parentName,
                state: $scope.originalDcbSettingsOrganization.state,
                description: $scope.originalDcbSettingsOrganization.description,
                // Profiles
                profiles: angular.copy($scope.originalDcbSettingsOrganization.profiles)
            };

            // DCBProfile
            if (dcbProfile) {
                var originalDCBProfile = CMPFService.findProfileByName(dcbSettingsOrganizationItem.profiles, CMPFService.SERVICE_DCB_PROFILE);
                var updatedDCBProfile = JSON.parse(angular.toJson(dcbProfile));
                var dcbProfileArray = CMPFService.prepareProfile(updatedDCBProfile, originalDCBProfile);
                // ---
                if (originalDCBProfile) {
                    originalDCBProfile.attributes = dcbProfileArray;
                } else {
                    var dcbProfile = {
                        name: CMPFService.SERVICE_DCB_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_PROFILE,
                        attributes: dcbProfileArray
                    };

                    dcbSettingsOrganizationItem.profiles.push(dcbProfile);
                }
            }

            $log.debug('Trying update default organization: ', dcbSettingsOrganization);

            CMPFService.updateOperator(dcbSettingsOrganizationItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.originalDcbProfile = angular.copy($scope.dcbProfile);
                    $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
                }
            }, function (response) {
                $log.debug('Cannot update organization. Error: ', response);

                CMPFService.showApiError(response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
