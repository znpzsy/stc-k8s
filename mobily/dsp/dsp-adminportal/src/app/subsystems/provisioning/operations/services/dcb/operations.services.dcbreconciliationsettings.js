(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.dcbreconciliationsettings', []);

    var ProvisioningOperationsServicesDcbReconciliationSettingsModule = angular.module('adminportal.subsystems.provisioning.operations.services.dcbreconciliationsettings');

    ProvisioningOperationsServicesDcbReconciliationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.dcbreconciliationsettings', {
            url: "/dcb-reconciliation-settings/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbreconciliationsettings.detail.html',
            controller: 'ProvisioningOperationsServicesDcbReconciliationSettingsCtrl',
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

    ProvisioningOperationsServicesDcbReconciliationSettingsModule.controller('ProvisioningOperationsServicesDcbReconciliationSettingsCtrl', function ($scope, $log, $state, $filter, $translate, notification, UtilService, CMPFService,
                                                                                                                                                      SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS, SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_FILE_PERIODS,
                                                                                                                                                      service) {
        $log.debug('ProvisioningOperationsServicesDcbReconciliationSettingsCtrl');

        $scope.service = service;

        $scope.SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS = SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS;
        $scope.SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_FILE_PERIODS = SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_FILE_PERIODS;

        // DCBServiceReconciliationPolicyProfile
        var dcbServiceReconciliationPolicyProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_PROFILE);
        if (dcbServiceReconciliationPolicyProfiles.length > 0) {
            $scope.service.dcbServiceReconciliationPolicyProfile = angular.copy(dcbServiceReconciliationPolicyProfiles[0]);

            var DCBTransactionsFileGenTimeMoment = moment($scope.service.dcbServiceReconciliationPolicyProfile.DCBTransactionsFileGenTime, 'HH:mm:ss');
            if (DCBTransactionsFileGenTimeMoment.isValid()) {
                $scope.service.dcbServiceReconciliationPolicyProfile.DCBTransactionsFileGenTime = DCBTransactionsFileGenTimeMoment.toDate();
            } else {
                $scope.service.dcbServiceReconciliationPolicyProfile.DCBTransactionsFileGenTime = null;
            }
            var DCBSettlementFileGenTimeMoment = moment($scope.service.dcbServiceReconciliationPolicyProfile.DCBSettlementFileGenTime, 'HH:mm:ss');
            if (DCBSettlementFileGenTimeMoment.isValid()) {
                $scope.service.dcbServiceReconciliationPolicyProfile.DCBSettlementFileGenTime = DCBSettlementFileGenTimeMoment.toDate();
            } else {
                $scope.service.dcbServiceReconciliationPolicyProfile.DCBSettlementFileGenTime = null;
            }
            var ClientTransactionsFileRecTimeMoment = moment($scope.service.dcbServiceReconciliationPolicyProfile.ClientTransactionsFileRecTime, 'HH:mm:ss');
            if (ClientTransactionsFileRecTimeMoment.isValid()) {
                $scope.service.dcbServiceReconciliationPolicyProfile.ClientTransactionsFileRecTime = ClientTransactionsFileRecTimeMoment.toDate();
            } else {
                $scope.service.dcbServiceReconciliationPolicyProfile.ClientTransactionsFileRecTime = null;
            }
            var ClientSettlementFileRecTimeMoment = moment($scope.service.dcbServiceReconciliationPolicyProfile.ClientSettlementFileRecTime, 'HH:mm:ss');
            if (ClientSettlementFileRecTimeMoment.isValid()) {
                $scope.service.dcbServiceReconciliationPolicyProfile.ClientSettlementFileRecTime = ClientSettlementFileRecTimeMoment.toDate();
            } else {
                $scope.service.dcbServiceReconciliationPolicyProfile.ClientSettlementFileRecTime = null;
            }
        } else {
            $scope.service.dcbServiceReconciliationPolicyProfile = {
                DCBTransactionsFileName: '',
                ClientTransactionsFileName: '',
                GenerateSettlementFile: false,
                GenerateExceptionsFile: false,
                DCBSettlementFileName: '',
                DCBExceptionsFileName: '',
                ClientSettlementFileName: '',
                ClientExceptionsFileName: '',
                DCBTransactionsFileGenPeriod: 'DAILY',
                DCBTransactionsFileGenTime: null,
                DCBSettlementFileGenPeriod: 'DAILY',
                DCBSettlementFileGenTime: null,
                ClientTransactionsFileRecPeriod: 'DAILY',
                ClientTransactionsFileRecTime: null,
                ClientSettlementFileRecPeriod: 'MONTHLY',
                ClientSettlementFileRecTime: null,
                DisputeThreshold: null
            };
        }

        // DCBServiceReconciliationProfile
        var dcbServiceReconciliationProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE);
        if (dcbServiceReconciliationProfiles.length > 0) {
            $scope.service.dcbServiceReconciliationProfile = angular.copy(dcbServiceReconciliationProfiles[0]);
        } else {
            $scope.service.dcbServiceReconciliationProfile = {
                VATIncludedInAmountForPostpaid: true,
                VATIncludedInAmountForPrepaid: true,
                PostpaidChargingMethod: null,
                ChargeARC: '',
                RefundARC: '',
                PartialRefundARC: '',
                SilentRefundARC: '',
                TaxARC: '',
                ChargeGL: '',
                RefundGL: '',
                PartialRefundGL: '',
                SilentRefundGL: '',
                TaxGL: ''
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

            // DCBServiceReconciliationPolicyProfile
            if (service.dcbServiceReconciliationPolicyProfile) {
                var originalDCBServiceReconciliationPolicyProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_PROFILE);
                var updatedDCBServiceReconciliationPolicyProfile = JSON.parse(angular.toJson(service.dcbServiceReconciliationPolicyProfile));

                // Modify some attributes here.
                if (updatedDCBServiceReconciliationPolicyProfile.DCBTransactionsFileGenTime) {
                    updatedDCBServiceReconciliationPolicyProfile.DCBTransactionsFileGenTime = $filter('date')(updatedDCBServiceReconciliationPolicyProfile.DCBTransactionsFileGenTime, 'HH:mm:ss');
                }
                if (updatedDCBServiceReconciliationPolicyProfile.DCBSettlementFileGenTime) {
                    updatedDCBServiceReconciliationPolicyProfile.DCBSettlementFileGenTime = $filter('date')(updatedDCBServiceReconciliationPolicyProfile.DCBSettlementFileGenTime, 'HH:mm:ss');
                }
                if (updatedDCBServiceReconciliationPolicyProfile.ClientTransactionsFileRecTime) {
                    updatedDCBServiceReconciliationPolicyProfile.ClientTransactionsFileRecTime = $filter('date')(updatedDCBServiceReconciliationPolicyProfile.ClientTransactionsFileRecTime, 'HH:mm:ss');
                }
                if (updatedDCBServiceReconciliationPolicyProfile.ClientSettlementFileRecTime) {
                    updatedDCBServiceReconciliationPolicyProfile.ClientSettlementFileRecTime = $filter('date')(updatedDCBServiceReconciliationPolicyProfile.ClientSettlementFileRecTime, 'HH:mm:ss');
                }

                updatedDCBServiceReconciliationPolicyProfile.DCBTransactionsFileGenPeriod = 'DAILY';
                updatedDCBServiceReconciliationPolicyProfile.ClientTransactionsFileRecPeriod = 'DAILY';
                updatedDCBServiceReconciliationPolicyProfile.DCBSettlementFileGenPeriod = 'DAILY';
                updatedDCBServiceReconciliationPolicyProfile.GenerateExceptionsFile = false;
                updatedDCBServiceReconciliationPolicyProfile.ClientSettlementFileRecPeriod = 'MONTHLY';

                var dcbServiceReconciliationPolicyProfileArray = CMPFService.prepareProfile(updatedDCBServiceReconciliationPolicyProfile, originalDCBServiceReconciliationPolicyProfile);
                // ---
                if (originalDCBServiceReconciliationPolicyProfile) {
                    originalDCBServiceReconciliationPolicyProfile.attributes = dcbServiceReconciliationPolicyProfileArray;
                } else {
                    var dcbServiceReconciliationPolicyProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_PROFILE,
                        attributes: dcbServiceReconciliationPolicyProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceReconciliationPolicyProfile);
                }
            }

            // DCBServiceReconciliationProfile
            if (service.dcbServiceReconciliationProfile) {
                var originalDCBServiceReconciliationProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE);
                var updatedDCBServiceReconciliationProfile = JSON.parse(angular.toJson(service.dcbServiceReconciliationProfile));
                var dcbServiceReconciliationProfileArray = CMPFService.prepareProfile(updatedDCBServiceReconciliationProfile, originalDCBServiceReconciliationProfile);
                // ---
                if (originalDCBServiceReconciliationProfile) {
                    originalDCBServiceReconciliationProfile.attributes = dcbServiceReconciliationProfileArray;
                } else {
                    var dcbServiceReconciliationProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE,
                        attributes: dcbServiceReconciliationProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceReconciliationProfile);
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