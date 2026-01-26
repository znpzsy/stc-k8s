(function () {

    'use strict';

    angular.module('adminportal.products.dcb.templates.serviceinvoicemessages', []);

    var DcbTemplatesServiceInvoiceMessagesModule = angular.module('adminportal.products.dcb.templates.serviceinvoicemessages');

    DcbTemplatesServiceInvoiceMessagesModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.templates.serviceinvoicemessages', {
            url: "/service-invoice-messages?ln",
            templateUrl: "products/dcb/templates/templates.serviceinvoicemessages.details.html",
            controller: 'DcbTemplatesServiceInvoiceMessagesCtrl'
        });

    });

    DcbTemplatesServiceInvoiceMessagesModule.controller('DcbTemplatesServiceInvoiceMessagesCtrl', function ($scope, $log, $state, $stateParams, $uibModal, $filter, $translate, notification, CMPFService,
                                                                                                            PROVISIONING_LANGUAGES, dcbSettingsOrganization) {
        $log.debug('DcbTemplatesServiceInvoiceMessagesCtrl');

        if ($stateParams.ln) {
            if (!_.contains(['AR', 'EN'], $stateParams.ln)) {
                $state.transitionTo($state.$current, {
                    ln: 'AR'
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                });
            }
        }

        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

        $scope.dcbSettingsOrganization = dcbSettingsOrganization.organizations[0] || {};

        // DCBServiceInvoicei18nProfile
        var prepareEmptyDCBServiceInvoicei18nProfile = function (language) {
            return {
                Language: language,
                IsDefault: false,
                BRMDealNameCharge: '',
                BRMDealNameRefund: '',
                BRMDealNamePartialRefund: '',
                BRMDealNameChargeBack: '',
                BRMInvoiceDescriptionCharge: '',
                BRMInvoiceDescriptionRefund: '',
                BRMInvoiceDescriptionPartialRefund: '',
                BRMInvoiceDescriptionChargeBack: ''
            }
        };
        var dcbServiceInvoicei18nProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE);
        $scope.dcbSettingsOrganization.dcbServiceInvoicei18nProfile = {
            Language: null
        };
        var findDCBServiceInvoicei18nProfileByLanguage = function (language) {
            if (language) {
                var dcbServiceInvoicei18nProfile = _.findWhere(dcbServiceInvoicei18nProfiles, {
                    Language: language
                });

                if (dcbServiceInvoicei18nProfile) {
                    return angular.copy(dcbServiceInvoicei18nProfile);
                }
            }

            return prepareEmptyDCBServiceInvoicei18nProfile(language);
        };
        $scope.$watch('dummyLanguage', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                    ln: newVal ? newVal : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: false
                });

                $scope.dcbSettingsOrganization.dcbServiceInvoicei18nProfile = findDCBServiceInvoicei18nProfileByLanguage(newVal);
                $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
            }
        });
        if ($stateParams.ln) {
            $scope.dummyLanguage = $stateParams.ln;
            $scope.dcbSettingsOrganization.dcbServiceInvoicei18nProfile = findDCBServiceInvoicei18nProfileByLanguage($stateParams.ln);
        }

        $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
        $scope.isNotChanged = function () {
            return angular.equals($scope.dcbSettingsOrganization, $scope.originalDcbSettingsOrganization);
        };

        $scope.save = function (dcbSettingsOrganization) {
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

            // DCBServiceInvoicei18nProfile
            if (dcbSettingsOrganization.dcbServiceInvoicei18nProfile && dcbSettingsOrganization.dcbServiceInvoicei18nProfile.Language) {
                var originalDCBServiceInvoicei18nProfiles = _.filter(dcbSettingsOrganizationItem.profiles, function (profile) {
                    var languageAttribute = _.findWhere(profile.attributes, {value: dcbSettingsOrganization.dcbServiceInvoicei18nProfile.Language});

                    return profile.name === CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE && languageAttribute;
                });
                var originalDCBServiceInvoicei18nProfile = originalDCBServiceInvoicei18nProfiles.length > 0 ? originalDCBServiceInvoicei18nProfiles[0] : null;

                var updatedDCBServiceInvoicei18nProfile = JSON.parse(angular.toJson(dcbSettingsOrganization.dcbServiceInvoicei18nProfile));
                var dcbServiceInvoicei18nProfileArray = CMPFService.prepareProfile(updatedDCBServiceInvoicei18nProfile, originalDCBServiceInvoicei18nProfile);
                // ---
                if (originalDCBServiceInvoicei18nProfile) {
                    originalDCBServiceInvoicei18nProfile.attributes = dcbServiceInvoicei18nProfileArray;
                } else {
                    var dcbServiceInvoicei18nProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE,
                        attributes: dcbServiceInvoicei18nProfileArray
                    };

                    dcbSettingsOrganizationItem.profiles.push(dcbServiceInvoicei18nProfile);
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
