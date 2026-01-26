(function () {

    'use strict';

    angular.module('adminportal.products.dcb.templates.servicemessages', []);

    var DcbTemplatesServiceMessagesModule = angular.module('adminportal.products.dcb.templates.servicemessages');

    DcbTemplatesServiceMessagesModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.templates.servicemessages', {
            url: "/service-messages?ln&pt",
            templateUrl: "products/dcb/templates/templates.servicemessages.details.html",
            controller: 'DcbTemplatesServiceMessagesCtrl'
        });

    });

    DcbTemplatesServiceMessagesModule.controller('DcbTemplatesServiceMessagesCtrl', function ($scope, $log, $state, $stateParams, $uibModal, $filter, $translate, notification, CMPFService,
                                                                                              SERVICE_DCB_SERVICE_MESSAGES_PAYMENT_TYPES, PROVISIONING_LANGUAGES, dcbSettingsOrganization) {
        $log.debug('DcbTemplatesServiceMessagesCtrl');

        if ($stateParams.ln && $stateParams.pt) {
            if (!_.contains(['AR', 'EN'], $stateParams.ln) || !_.contains(['PREPAID', 'POSTPAID'], $stateParams.pt)) {
                $state.transitionTo($state.$current, {
                    ln: 'AR',
                    pt: 'PREPAID'
                }, {
                    reload: false,
                    inherit: false,
                    notify: true
                });
            }
        }

        $scope.SERVICE_DCB_SERVICE_MESSAGES_PAYMENT_TYPES = SERVICE_DCB_SERVICE_MESSAGES_PAYMENT_TYPES;
        $scope.PROVISIONING_LANGUAGES = PROVISIONING_LANGUAGES;

        $scope.dcbSettingsOrganization = dcbSettingsOrganization.organizations[0] || {};

        // DCBServiceMessagei18nProfile
        var prepareEmptyDCBServiceMessagei18nProfile = function (language, paymentType) {
            return {
                Language: language,
                PaymentType: paymentType,
                IsDefault: false,
                OTPMessage: '',
                ActivationMessage: '',
                DeactivationMessage: '',
                SuccessfulChargeMessage: '',
                SuccessRefundMessage: '',
                SuccessfulPartialRefundMessage: '',
                ActivationFailureMessage: '',
                InsufficientCreditMessage: '',
                CreditLimitExceededMessage: '',
                ServiceUnavailableMessage: '',
                RefundFailureMessage: '',
                PartialRefundFailureMessage: '',
                OptOutMessage: ''
            }
        };
        var dcbServiceMessagei18nProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE);
        $scope.dcbSettingsOrganization.dcbServiceMessagei18nProfile = {
            Language: null,
            PaymentType: null
        };
        var findDCBServiceMessagei18nProfileByLanguageAndPaymentType = function (language, paymentType) {
            if (language && paymentType) {
                var dcbServiceMessagei18nProfile = _.findWhere(dcbServiceMessagei18nProfiles, {
                    Language: language,
                    PaymentType: paymentType
                });

                if (dcbServiceMessagei18nProfile) {
                    return angular.copy(dcbServiceMessagei18nProfile);
                }
            }

            return prepareEmptyDCBServiceMessagei18nProfile(language, paymentType);
        };
        $scope.$watch('dummyPaymentType', function (newVal, oldVal) {
            var language = $scope.dummyLanguage;
            if (newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                    ln: language ? language : undefined,
                    pt: newVal ? newVal : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: false
                });

                $scope.dcbSettingsOrganization.dcbServiceMessagei18nProfile = findDCBServiceMessagei18nProfileByLanguageAndPaymentType(language, newVal);
                $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
            }
        });
        $scope.$watch('dummyLanguage', function (newVal, oldVal) {
            var paymentType = $scope.dummyPaymentType;
            if (newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                    ln: newVal ? newVal : undefined,
                    pt: paymentType ? paymentType : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: false
                });

                $scope.dcbSettingsOrganization.dcbServiceMessagei18nProfile = findDCBServiceMessagei18nProfileByLanguageAndPaymentType(newVal, paymentType);
                $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
            }
        });
        if ($stateParams.ln || $stateParams.pt) {
            $scope.dummyLanguage = $stateParams.ln;
            $scope.dummyPaymentType = $stateParams.pt;
            $scope.dcbSettingsOrganization.dcbServiceMessagei18nProfile = findDCBServiceMessagei18nProfileByLanguageAndPaymentType($stateParams.ln, $stateParams.pt);
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

            // DCBServiceMessagei18nProfile
            if (dcbSettingsOrganization.dcbServiceMessagei18nProfile.Language && dcbSettingsOrganization.dcbServiceMessagei18nProfile.PaymentType) {
                var originalDCBServiceMessagei18nProfiles = _.filter(dcbSettingsOrganizationItem.profiles, function (profile) {
                    var languageAttribute = _.findWhere(profile.attributes, {value: dcbSettingsOrganization.dcbServiceMessagei18nProfile.Language});
                    var paymentTypeAttribute = _.findWhere(profile.attributes, {value: dcbSettingsOrganization.dcbServiceMessagei18nProfile.PaymentType});

                    return profile.name === CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE && languageAttribute && paymentTypeAttribute;
                });
                var originalDCBServiceMessagei18nProfile = originalDCBServiceMessagei18nProfiles.length > 0 ? originalDCBServiceMessagei18nProfiles[0] : null;

                var updatedDCBServiceMessagei18nProfile = JSON.parse(angular.toJson(dcbSettingsOrganization.dcbServiceMessagei18nProfile));
                var dcbServiceMessagei18nProfileArray = CMPFService.prepareProfile(updatedDCBServiceMessagei18nProfile, originalDCBServiceMessagei18nProfile);
                // ---
                if (originalDCBServiceMessagei18nProfile) {
                    originalDCBServiceMessagei18nProfile.attributes = dcbServiceMessagei18nProfileArray;
                } else {
                    var dcbServiceMessagei18nProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE,
                        attributes: dcbServiceMessagei18nProfileArray
                    };

                    dcbSettingsOrganizationItem.profiles.push(dcbServiceMessagei18nProfile);
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
