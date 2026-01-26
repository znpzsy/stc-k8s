(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates.servicemessages', []);

    var ProvisioningOperationsServicesDcbTemplatesServiceMessagesModule = angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates.servicemessages');

    ProvisioningOperationsServicesDcbTemplatesServiceMessagesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.dcbtemplates.servicemessages', {
            url: "/service-messages?ln&pt",
            templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbtemplates.servicemessages.detail.html',
            controller: 'ProvisioningOperationsServicesDcbTemplatesServiceMessagesCtrl'
        });

    });

    ProvisioningOperationsServicesDcbTemplatesServiceMessagesModule.controller('ProvisioningOperationsServicesDcbTemplatesServiceMessagesCtrl', function ($scope, $log, $state, $stateParams, $translate, notification, CMPFService, service,
                                                                                                                                                          SERVICE_DCB_SERVICE_MESSAGES_PAYMENT_TYPES, PROVISIONING_LANGUAGES) {
        $log.debug('ProvisioningOperationsServicesDcbTemplatesServiceMessagesCtrl');

        if ($stateParams.ln && $stateParams.pt) {
            if (!_.contains(['AR', 'EN'], $stateParams.ln) || !_.contains(['PREPAID', 'POSTPAID'], $stateParams.pt)) {
                $state.transitionTo($state.$current, {
                    serviceId: $stateParams.serviceId,
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

        $scope.service = service;

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
        var dcbServiceMessagei18nProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE);
        $scope.service.dcbServiceMessagei18nProfile = {
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
        $scope.$watch('service.dummyPaymentType', function (newVal, oldVal) {
            var language = $scope.service.dummyLanguage;
            var language2 = $scope.service.dummyLanguage2;
            if (newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                    serviceId: $stateParams.serviceId,
                    ln: language ? language : undefined,
                    pt: newVal ? newVal : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: false
                });

                $scope.service.dcbServiceMessagei18nProfile = findDCBServiceMessagei18nProfileByLanguageAndPaymentType(language, newVal);
                $scope.originalService = angular.copy($scope.service);
            }
        });
        $scope.$watch('service.dummyLanguage', function (newVal, oldVal) {
            var paymentType = $scope.service.dummyPaymentType;
            var language2 = $scope.service.dummyLanguage2;
            if (newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                    serviceId: $stateParams.serviceId,
                    ln: newVal ? newVal : undefined,
                    pt: paymentType ? paymentType : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: false
                });

                $scope.service.dcbServiceMessagei18nProfile = findDCBServiceMessagei18nProfileByLanguageAndPaymentType(newVal, paymentType);
                $scope.originalService = angular.copy($scope.service);
            }
        });
        if ($stateParams.ln && $stateParams.pt) {
            $scope.service.dummyPaymentType = $stateParams.pt;
            $scope.service.dummyLanguage = $stateParams.ln;
            $scope.service.dcbServiceMessagei18nProfile = findDCBServiceMessagei18nProfileByLanguageAndPaymentType($stateParams.ln, $stateParams.pt);
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

            // DCBServiceMessagei18nProfile
            if (service.dcbServiceMessagei18nProfile && service.dcbServiceMessagei18nProfile.Language && service.dcbServiceMessagei18nProfile.PaymentType) {
                var originalDCBServiceMessagei18nProfiles = _.filter(serviceItem.profiles, function (profile) {
                    var languageAttribute = _.findWhere(profile.attributes, {value: service.dcbServiceMessagei18nProfile.Language});
                    var paymentTypeAttribute = _.findWhere(profile.attributes, {value: service.dcbServiceMessagei18nProfile.PaymentType});

                    return profile.name === CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE && languageAttribute && paymentTypeAttribute;
                });
                var originalDCBServiceMessagei18nProfile = originalDCBServiceMessagei18nProfiles.length > 0 ? originalDCBServiceMessagei18nProfiles[0] : null;

                var updatedDCBServiceMessagei18nProfile = JSON.parse(angular.toJson(service.dcbServiceMessagei18nProfile));
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

                    serviceItem.profiles.push(dcbServiceMessagei18nProfile);
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