(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.configuration.settings', []);

    var BusinessManagementConfigurationSettingsModule = angular.module('adminportal.subsystems.businessmanagement.configuration.settings');

    BusinessManagementConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.configuration.settings', {
            url: "/settings",
            templateUrl: "subsystems/businessmanagement/configuration/configuration.settings.details.html",
            controller: 'BusinessManagementConfigurationSettingsCtrl',
            resolve: {
                settlementGlCodesSettingsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SETTLEMENT_GL_CODES_ORGANIZATION_NAME);
                }
            }
        });

    });

    BusinessManagementConfigurationSettingsModule.controller('BusinessManagementConfigurationSettingsCtrl', function ($scope, $log, $state, $filter, $translate, notification, CMPFService, settlementGlCodesSettingsOrganization) {
        $log.debug('BusinessManagementConfigurationSettingsCtrl');

        $scope.settlementGlCodesSettingsOrganization = settlementGlCodesSettingsOrganization.organizations[0] || {};

        $scope.settlementGLCodesProfile = {};

        // SettlementGLCodesProfile
        var settlementGLCodesProfiles = CMPFService.getProfileAttributes($scope.settlementGlCodesSettingsOrganization.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE);
        if (settlementGLCodesProfiles.length > 0) {
            $scope.settlementGLCodesProfile.vatSettlementGLCodesProfile = _.findWhere(settlementGLCodesProfiles, {GLCategoryName: 'VAT'});
            $scope.settlementGLCodesProfile.withholdingTaxSettlementGLCodesProfile = _.findWhere(settlementGLCodesProfiles, {GLCategoryName: 'WITHHOLDING_TAX'});
            $scope.settlementGLCodesProfile.badDebtSettlementGLCodesProfile = _.findWhere(settlementGLCodesProfiles, {GLCategoryName: 'BAD_DEBT'});
        }

        $scope.originalSettlementGLCodesProfile = angular.copy($scope.settlementGLCodesProfile);
        $scope.originalSettlementGlCodesSettingsOrganization = angular.copy($scope.settlementGlCodesSettingsOrganization);
        $scope.isNotChanged = function () {
            return angular.equals($scope.settlementGLCodesProfile, $scope.originalSettlementGLCodesProfile);
        };

        $scope.save = function (settlementGLCodesProfile) {
            var settlementGlCodesSettingsOrganizationItem = {
                id: $scope.originalSettlementGlCodesSettingsOrganization.id,
                name: $scope.originalSettlementGlCodesSettingsOrganization.name,
                type: $scope.originalSettlementGlCodesSettingsOrganization.type,
                orgType: $scope.originalSettlementGlCodesSettingsOrganization.orgType,
                parentId: $scope.originalSettlementGlCodesSettingsOrganization.parentId,
                parentName: $scope.originalSettlementGlCodesSettingsOrganization.parentName,
                state: $scope.originalSettlementGlCodesSettingsOrganization.state,
                description: $scope.originalSettlementGlCodesSettingsOrganization.description,
                // Profiles
                profiles: angular.copy($scope.originalSettlementGlCodesSettingsOrganization.profiles)
            };

            var originalSettlementGLCodesProfiles = CMPFService.findProfilesByName(settlementGlCodesSettingsOrganizationItem.profiles, CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE);

            // SettlementGLCodesProfile => SettlementGLCodesProfile ('VAT')
            if (settlementGLCodesProfile.vatSettlementGLCodesProfile) {
                var originalVatSettlementGLCodesProfiles = _.filter(originalSettlementGLCodesProfiles, function (originalSettlementGLCodesProfile) {
                    var nameAttr = _.findWhere(originalSettlementGLCodesProfile.attributes, {name: 'GLCategoryName'});
                    return nameAttr ? nameAttr.value === 'VAT' : false;
                });
                var originalVatSettlementGLCodesProfile = originalVatSettlementGLCodesProfiles.length > 0 ? originalVatSettlementGLCodesProfiles[0] : null;
                var updatedSettlementGLCodesProfile = JSON.parse(angular.toJson(settlementGLCodesProfile.vatSettlementGLCodesProfile));

                // Update the last update time for create first time or for update everytime.
                updatedSettlementGLCodesProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                var settlementGLCodesProfileArray = CMPFService.prepareProfile(updatedSettlementGLCodesProfile, originalVatSettlementGLCodesProfile);
                // ---
                if (originalVatSettlementGLCodesProfile) {
                    originalVatSettlementGLCodesProfile.attributes = settlementGLCodesProfileArray;
                } else {
                    var settlementGLCodesProfile = {
                        name: CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE,
                        attributes: settlementGLCodesProfileArray
                    };

                    settlementGlCodesSettingsOrganizationItem.profiles.push(settlementGLCodesProfile.vatSettlementGLCodesProfile);
                }
            }

            // SettlementGLCodesProfile => SettlementGLCodesProfile ('WITHHOLDING_TAX')
            if (settlementGLCodesProfile.withholdingTaxSettlementGLCodesProfile) {
                var originalWithholdingTaxSettlementGLCodesProfiles = _.filter(originalSettlementGLCodesProfiles, function (originalSettlementGLCodesProfile) {
                    var nameAttr = _.findWhere(originalSettlementGLCodesProfile.attributes, {name: 'GLCategoryName'});
                    return nameAttr ? nameAttr.value === 'WITHHOLDING_TAX' : false;
                });
                var originalWithholdingTaxSettlementGLCodesProfile = originalWithholdingTaxSettlementGLCodesProfiles.length > 0 ? originalWithholdingTaxSettlementGLCodesProfiles[0] : null;
                var updatedSettlementGLCodesProfile = JSON.parse(angular.toJson(settlementGLCodesProfile.withholdingTaxSettlementGLCodesProfile));

                // Update the last update time for create first time or for update everytime.
                updatedSettlementGLCodesProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                var settlementGLCodesProfileArray = CMPFService.prepareProfile(updatedSettlementGLCodesProfile, originalWithholdingTaxSettlementGLCodesProfile);
                // ---
                if (originalWithholdingTaxSettlementGLCodesProfile) {
                    originalWithholdingTaxSettlementGLCodesProfile.attributes = settlementGLCodesProfileArray;
                } else {
                    var settlementGLCodesProfile = {
                        name: CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE,
                        attributes: settlementGLCodesProfileArray
                    };

                    settlementGlCodesSettingsOrganizationItem.profiles.push(settlementGLCodesProfile.withholdingTaxSettlementGLCodesProfile);
                }
            }

            // SettlementGLCodesProfile => SettlementGLCodesProfile ('BAD_DEBT')
            if (settlementGLCodesProfile.badDebtSettlementGLCodesProfile) {
                var originalBadDebtSettlementGLCodesProfiles = _.filter(originalSettlementGLCodesProfiles, function (originalSettlementGLCodesProfile) {
                    var nameAttr = _.findWhere(originalSettlementGLCodesProfile.attributes, {name: 'GLCategoryName'});
                    return nameAttr ? nameAttr.value === 'BAD_DEBT' : false;
                });
                var originalBadDebtSettlementGLCodesProfile = originalBadDebtSettlementGLCodesProfiles.length > 0 ? originalBadDebtSettlementGLCodesProfiles[0] : null;
                var updatedSettlementGLCodesProfile = JSON.parse(angular.toJson(settlementGLCodesProfile.badDebtSettlementGLCodesProfile));

                // Update the last update time for create first time or for update everytime.
                updatedSettlementGLCodesProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                var settlementGLCodesProfileArray = CMPFService.prepareProfile(updatedSettlementGLCodesProfile, originalBadDebtSettlementGLCodesProfile);
                // ---
                if (originalBadDebtSettlementGLCodesProfile) {
                    originalBadDebtSettlementGLCodesProfile.attributes = settlementGLCodesProfileArray;
                } else {
                    var settlementGLCodesProfile = {
                        name: CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE,
                        attributes: settlementGLCodesProfileArray
                    };

                    settlementGlCodesSettingsOrganizationItem.profiles.push(settlementGLCodesProfile.badDebtSettlementGLCodesProfile);
                }
            }

            $log.debug('Trying update default organization: ', settlementGlCodesSettingsOrganizationItem);

            CMPFService.updateOperator(settlementGlCodesSettingsOrganizationItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    CMPFService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
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
