(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates.serviceinvoicemessages', []);

    var ProvisioningOperationsServicesDcbTemplatesServiceInvoiceMessagesModule = angular.module('adminportal.subsystems.provisioning.operations.services.dcbtemplates.serviceinvoicemessages');

    ProvisioningOperationsServicesDcbTemplatesServiceInvoiceMessagesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.dcbtemplates.serviceinvoicemessages', {
            url: "/service-invoice-messages?ln",
            templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbtemplates.serviceinvoicemessages.detail.html',
            controller: 'ProvisioningOperationsServicesDcbTemplatesServiceInvoiceMessagesCtrl'
        });

    });

    ProvisioningOperationsServicesDcbTemplatesServiceInvoiceMessagesModule.controller('ProvisioningOperationsServicesDcbTemplatesServiceInvoiceMessagesCtrl', function ($scope, $log, $state, $stateParams, $translate, notification, CMPFService, service,
                                                                                                                                                                        SERVICE_DCB_SERVICE_MESSAGES_PAYMENT_TYPES, PROVISIONING_LANGUAGES) {
        $log.debug('ProvisioningOperationsServicesDcbTemplatesServiceInvoiceMessagesCtrl');

        if ($stateParams.ln) {
            if (!_.contains(['AR', 'EN'], $stateParams.ln)) {
                $state.transitionTo($state.$current, {
                    serviceId: $stateParams.serviceId,
                    ln: 'AR'
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
        var dcbServiceInvoicei18nProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE);
        $scope.service.dcbServiceInvoicei18nProfile = {
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
        $scope.$watch('service.dummyLanguage', function (newVal, oldVal) {
            var language = $scope.service.dummyLanguage;
            var paymentType = $scope.service.dummyPaymentType;
            if (newVal !== oldVal) {
                $state.transitionTo($state.$current, {
                    serviceId: $stateParams.serviceId,
                    ln: newVal ? newVal : undefined
                }, {
                    reload: false,
                    inherit: false,
                    notify: false
                });

                $scope.service.dcbServiceInvoicei18nProfile = findDCBServiceInvoicei18nProfileByLanguage(newVal);
                $scope.originalService = angular.copy($scope.service);
            }
        });
        if ($stateParams.ln) {
            $scope.service.dummyLanguage = $stateParams.ln;
            $scope.service.dcbServiceInvoicei18nProfile = findDCBServiceInvoicei18nProfileByLanguage($stateParams.ln);
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

            // DCBServiceInvoicei18nProfile
            if (service.dcbServiceInvoicei18nProfile && service.dcbServiceInvoicei18nProfile.Language) {
                var originalDCBServiceInvoicei18nProfiles = _.filter(serviceItem.profiles, function (profile) {
                    var languageAttribute = _.findWhere(profile.attributes, {value: service.dcbServiceInvoicei18nProfile.Language});

                    return profile.name === CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE && languageAttribute;
                });
                var originalDCBServiceInvoicei18nProfile = originalDCBServiceInvoicei18nProfiles.length > 0 ? originalDCBServiceInvoicei18nProfiles[0] : null;

                var updatedDCBServiceInvoicei18nProfile = JSON.parse(angular.toJson(service.dcbServiceInvoicei18nProfile));
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

                    serviceItem.profiles.push(dcbServiceInvoicei18nProfile);
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