(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.services.dcb', []);

    var ProvisioningOperationsServicesDcbModule = angular.module('adminportal.subsystems.provisioning.operations.services.dcb');

    ProvisioningOperationsServicesDcbModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.services.dcb', {
            url: "/dcb-settings/:serviceId",
            templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcb.detail.html',
            controller: 'ProvisioningOperationsServicesDcbCtrl',
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

    ProvisioningOperationsServicesDcbModule.controller('ProvisioningOperationsServicesDcbCtrl', function ($scope, $log, $state, $uibModal, $filter, $translate, notification, CMPFService, UtilService, SERVICE_CURRENCIES,
                                                                                                          SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR, SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS, service) {
        $log.debug('ProvisioningOperationsServicesDcbCtrl');

        $scope.service = service;

        $scope.SERVICE_CURRENCIES = SERVICE_CURRENCIES;
        $scope.SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR = SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR;
        $scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS = SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS;

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
                ClientAPIPassword: '',
                BlockDCBEnabled: false
            };
        }

        // DCBPrepaidCappingRuleProfile
        var dcbPrepaidCappingRuleProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE);
        if (dcbPrepaidCappingRuleProfiles.length > 0) {
            $scope.service.dcbPrepaidCappingRuleProfileList = [];
            _.each(dcbPrepaidCappingRuleProfiles, function (dcbPrepaidCappingRuleProfile) {
                var dcbPrepaidCappingRuleProfileItem = _.extend({id: _.uniqueId()}, dcbPrepaidCappingRuleProfile);
                dcbPrepaidCappingRuleProfileItem.isUnlimited = (Number(dcbPrepaidCappingRuleProfileItem.FixedCappingLimit) === -1);

                $scope.service.dcbPrepaidCappingRuleProfileList.push(dcbPrepaidCappingRuleProfileItem);
            });

            $scope.service.dcbPrepaidCappingRuleProfileList = $filter('orderBy')($scope.service.dcbPrepaidCappingRuleProfileList, ['RuleType']);
        }

        // DCBPostpaidCappingRuleProfile
        var dcbPostpaidCappingRuleProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE);
        if (dcbPostpaidCappingRuleProfiles.length > 0) {
            $scope.service.dcbPostpaidCappingRuleProfileList = [];
            _.each(dcbPostpaidCappingRuleProfiles, function (dcbPostpaidCappingRuleProfile) {
                var dcbPostpaidCappingRuleProfileItem = _.extend({id: _.uniqueId()}, dcbPostpaidCappingRuleProfile);
                dcbPostpaidCappingRuleProfileItem.isUnlimited = (Number(dcbPostpaidCappingRuleProfileItem.FixedCappingLimit) === -1);
                dcbPostpaidCappingRuleProfileItem.CreditSegments = dcbPostpaidCappingRuleProfileItem.CreditSegments.split(',');

                $scope.service.dcbPostpaidCappingRuleProfileList.push(dcbPostpaidCappingRuleProfileItem);
            });

            $scope.service.dcbPostpaidCappingRuleProfileList = $filter('orderBy')($scope.service.dcbPostpaidCappingRuleProfileList, ['RuleOrder']);
        }

        // DCBServiceDisputeRuleProfile
        var dcbServiceDisputeRuleProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE);
        if (dcbServiceDisputeRuleProfiles.length > 0) {
            $scope.service.dcbServiceDisputeRuleProfileList = [];
            _.each(dcbServiceDisputeRuleProfiles, function (dcbServiceDisputeRuleProfile) {
                var dcbServiceDisputeRuleProfileItem = _.extend({id: _.uniqueId()}, dcbServiceDisputeRuleProfile);

                $scope.service.dcbServiceDisputeRuleProfileList.push(dcbServiceDisputeRuleProfileItem);
            });

            $scope.service.dcbServiceDisputeRuleProfileList = $filter('orderBy')($scope.service.dcbServiceDisputeRuleProfileList, ['TransactionType']);
        }

        // DCBServiceActivationProfile
        var dcbServiceActivationProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE);
        if (dcbServiceActivationProfiles.length > 0) {
            $scope.service.dcbServiceActivationProfile = angular.copy(dcbServiceActivationProfiles[0]);
        } else {
            // DCBServiceActivationProfile
            $scope.service.dcbServiceActivationProfile = {
                UseHeaderEnrichment: false,
                UseSilentSMS: false,
                UseOTTOTP: false,
                UseOperatorOTP: false,
                SubscriberIDatOperator: 'SAN',
                SubscriberIDatOTT: ''
            };
        }

        // DCBServiceDeactivationProfile
        var dcbServiceDeactivationProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_DEACTIVATION_PROFILE);
        if (dcbServiceDeactivationProfiles.length > 0) {
            $scope.service.dcbServiceDeactivationProfile = angular.copy(dcbServiceDeactivationProfiles[0]);
        } else {
            $scope.service.dcbServiceDeactivationProfile = {
                Post2Pre: false,
                Pre2Post: false,
                Post2Post: false,
                Pre2Pre: false,
                TOO: false,
                NumberSwap: false,
                SIMSwap: false,
                Barred: false,
                Unbarred: false,
                CreditSegmentUpdate: false,
                PackageUpdate: false
            };
        }

        // DCBServiceEligibilityProfile
        $scope.dummyAllowedCreditSegments = [];
        var dcbServiceEligibilityProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_ELIGIBILITY_PROFILE);
        if (dcbServiceEligibilityProfiles.length > 0) {
            $scope.service.dcbServiceEligibilityProfile = angular.copy(dcbServiceEligibilityProfiles[0]);
            $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments = $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments.split(',');

            _.each($scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS, function (creditSegment, index) {
                $scope.dummyAllowedCreditSegments[index] = _.contains($scope.service.dcbServiceEligibilityProfile.allowedCreditSegments, creditSegment);
            });
        } else {
            $scope.service.dcbServiceEligibilityProfile = {
                allowedCreditSegments: '',
                allowBusiness: false,
                allowConsumer: false,
                allowPrepaid: false,
                allowPostpaid: false,
                allowData: false,
                allowVoice: false
            };
        }
        // allowedCreditSegments
        $scope.toggleAllowedCreditSegment = function (creditSegment, isChecked) {
            $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments = $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments || [];

            if (isChecked) {
                $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments.push(creditSegment);
            } else {
                $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments = _.without($scope.service.dcbServiceEligibilityProfile.allowedCreditSegments, creditSegment);
            }

            $scope.service.dcbServiceEligibilityProfile.allowedCreditSegments = $filter('orderBy')($scope.service.dcbServiceEligibilityProfile.allowedCreditSegments);
        };

        // DCBServiceCDRProfile
        var dcbServiceCDRProfiles = CMPFService.getProfileAttributes($scope.service.profiles, CMPFService.SERVICE_DCB_SERVICE_CDR_PROFILE);
        if (dcbServiceCDRProfiles.length > 0) {
            $scope.service.dcbServiceCDRProfile = angular.copy(dcbServiceCDRProfiles[0]);
        } else {
            $scope.service.dcbServiceCDRProfile = {
                ServiceTypeForContentPurchase: 900,
                ServiceTypeForApplicationPurchase: 900,
                ServiceTypeForOtherPurchase: 900
            };
        }

        // DCBPrepaidCappingRuleProfiles managing methods.
        $scope.addDCBPrepaidCappingRuleProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbprepaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES, SERVICE_DCB_PREPAID_CAPPING_POLICIES) {
                    $scope.service = service;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES = SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_POLICIES = SERVICE_DCB_PREPAID_CAPPING_POLICIES;

                    $scope.dcbPrepaidCappingRuleProfile = {
                        isUnlimited: false
                    };

                    $scope.$watch('dcbPrepaidCappingRuleProfile.RuleType', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(service.dcbPrepaidCappingRuleProfileList, {RuleType: newVal});

                            $scope.form.RuleType.$setValidity('availabilityCheck', _.isUndefined(foundProfile));
                        }
                    });

                    $scope.save = function (dcbPrepaidCappingRuleProfile) {
                        if (dcbPrepaidCappingRuleProfile.isUnlimited) {
                            dcbPrepaidCappingRuleProfile.FixedCappingLimit = -1;
                        }

                        $uibModalInstance.close(dcbPrepaidCappingRuleProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (dcbPrepaidCappingRuleProfile) {
                service.dcbPrepaidCappingRuleProfileList = service.dcbPrepaidCappingRuleProfileList || [];

                dcbPrepaidCappingRuleProfile.id = _.uniqueId();
                service.dcbPrepaidCappingRuleProfileList.push(dcbPrepaidCappingRuleProfile);
            }, function () {
                //
            });
        };
        $scope.editDCBPrepaidCappingRuleProfile = function (service, dcbPrepaidCappingRuleProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbprepaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES, SERVICE_DCB_PREPAID_CAPPING_POLICIES) {
                    $scope.service = service;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES = SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_POLICIES = SERVICE_DCB_PREPAID_CAPPING_POLICIES;

                    $scope.dcbPrepaidCappingRuleProfile = angular.copy(dcbPrepaidCappingRuleProfile);
                    $scope.dcbPrepaidCappingRuleProfileOriginal = angular.copy($scope.dcbPrepaidCappingRuleProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.dcbPrepaidCappingRuleProfile, $scope.dcbPrepaidCappingRuleProfileOriginal);
                    };

                    $scope.$watch('dcbPrepaidCappingRuleProfile.RuleType', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(service.dcbPrepaidCappingRuleProfileList, {RuleType: newVal});

                            var isDifferent = foundProfile ? dcbPrepaidCappingRuleProfile.id !== foundProfile.id : false;
                            $scope.form.RuleType.$setValidity('availabilityCheck', !(isDifferent && foundProfile));
                        }
                    });

                    $scope.save = function (dcbPrepaidCappingRuleProfile) {
                        if (dcbPrepaidCappingRuleProfile.isUnlimited) {
                            dcbPrepaidCappingRuleProfile.FixedCappingLimit = -1;
                        }

                        $uibModalInstance.close(dcbPrepaidCappingRuleProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (editedDcbPrepaidCappingRuleProfile) {
                var foundDcbPrepaidCappingRuleProfile = _.findWhere(service.dcbPrepaidCappingRuleProfileList, {id: editedDcbPrepaidCappingRuleProfile.id});
                if (foundDcbPrepaidCappingRuleProfile) {
                    foundDcbPrepaidCappingRuleProfile.isUnlimited = editedDcbPrepaidCappingRuleProfile.isUnlimited;
                    foundDcbPrepaidCappingRuleProfile.RuleType = editedDcbPrepaidCappingRuleProfile.RuleType;
                    foundDcbPrepaidCappingRuleProfile.CappingPolicy = editedDcbPrepaidCappingRuleProfile.CappingPolicy;
                    foundDcbPrepaidCappingRuleProfile.FixedCappingLimit = editedDcbPrepaidCappingRuleProfile.FixedCappingLimit;
                    foundDcbPrepaidCappingRuleProfile.BalancePercentage = editedDcbPrepaidCappingRuleProfile.BalancePercentage;
                }
            }, function () {
            });
        };
        $scope.removeDCBPrepaidCappingRuleProfile = function (service, dcbPrepaidCappingRuleProfile) {
            var index = _.indexOf(service.dcbPrepaidCappingRuleProfileList, dcbPrepaidCappingRuleProfile);
            if (index !== -1) {
                service.dcbPrepaidCappingRuleProfileList.splice(index, 1);
            }
        };
        $scope.getDcbPrepaidCappingRuleProfileString = function (dcbPrepaidCappingRuleProfile) {
            var resultStr = dcbPrepaidCappingRuleProfile.RuleType + ', ' + dcbPrepaidCappingRuleProfile.CappingPolicy + ', ';

            if (dcbPrepaidCappingRuleProfile.CappingPolicy === 'FIXED_AMOUNT') {
                if (dcbPrepaidCappingRuleProfile.FixedCappingLimit !== -1) {
                    resultStr += dcbPrepaidCappingRuleProfile.FixedCappingLimit;

                    if ($scope.service.dcbServiceProfile.Currency) {
                        resultStr += ' (' + $scope.service.dcbServiceProfile.Currency + ')';
                    }
                } else {
                    resultStr += ' ' + $translate.instant('Subsystems.Provisioning.Services.DCBSettings.DCBPrepaidCappingRuleProfile.Unlimited');
                }
            } else if (dcbPrepaidCappingRuleProfile.CappingPolicy === 'PERCENTAGE_OF_BALANCE') {
                resultStr += '%' + dcbPrepaidCappingRuleProfile.BalancePercentage;
            }

            return resultStr;
        };

        // DCBPostpaidCappingRuleProfiles managing methods.
        $scope.addDCBPostpaidCappingRuleProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbpostpaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, $filter, SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES, SERVICE_DCB_POSTPAID_CAPPING_POLICIES,
                                      SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS) {
                    $scope.service = service;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES = SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_POLICIES = SERVICE_DCB_POSTPAID_CAPPING_POLICIES;
                    $scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS = SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS;

                    $scope.dcbPostpaidCappingRuleProfile = {
                        isUnlimited: false,
                        TenureBased: false,
                        CreditSegments: []
                    };

                    // CreditSegments
                    $scope.toggleCreditSegment = function (creditSegment, isChecked) {
                        $scope.dcbPostpaidCappingRuleProfile.CreditSegments = $scope.dcbPostpaidCappingRuleProfile.CreditSegments || [];

                        if (isChecked) {
                            $scope.dcbPostpaidCappingRuleProfile.CreditSegments.push(creditSegment);
                        } else {
                            $scope.dcbPostpaidCappingRuleProfile.CreditSegments = _.without($scope.dcbPostpaidCappingRuleProfile.CreditSegments, creditSegment);
                        }

                        $scope.dcbPostpaidCappingRuleProfile.CreditSegments = $filter('orderBy')($scope.dcbPostpaidCappingRuleProfile.CreditSegments);
                    };

                    $scope.$watch('dcbPostpaidCappingRuleProfile.RuleOrder', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(service.dcbPostpaidCappingRuleProfileList, {RuleOrder: newVal});

                            $scope.form.RuleOrder.$setValidity('availabilityCheck', _.isUndefined(foundProfile));
                        }
                    });

                    $scope.save = function (dcbPostpaidCappingRuleProfile) {
                        if (dcbPostpaidCappingRuleProfile.isUnlimited) {
                            dcbPostpaidCappingRuleProfile.FixedCappingLimit = -1;
                        }

                        $uibModalInstance.close(dcbPostpaidCappingRuleProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (dcbPostpaidCappingRuleProfile) {
                service.dcbPostpaidCappingRuleProfileList = service.dcbPostpaidCappingRuleProfileList || [];

                dcbPostpaidCappingRuleProfile.id = _.uniqueId();
                service.dcbPostpaidCappingRuleProfileList.push(dcbPostpaidCappingRuleProfile);

                service.dcbPostpaidCappingRuleProfileList = $filter('orderBy')(service.dcbPostpaidCappingRuleProfileList, ['RuleOrder']);
            }, function () {
                //
            });
        };
        $scope.editDCBPostpaidCappingRuleProfile = function (service, dcbPostpaidCappingRuleProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbpostpaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, $filter, SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES, SERVICE_DCB_POSTPAID_CAPPING_POLICIES,
                                      SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS) {
                    $scope.service = service;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES = SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_POLICIES = SERVICE_DCB_POSTPAID_CAPPING_POLICIES;
                    $scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS = SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS;

                    $scope.dcbPostpaidCappingRuleProfile = angular.copy(dcbPostpaidCappingRuleProfile);
                    $scope.dcbPostpaidCappingRuleProfileOriginal = angular.copy($scope.dcbPostpaidCappingRuleProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.dcbPostpaidCappingRuleProfile, $scope.dcbPostpaidCappingRuleProfileOriginal);
                    };

                    $scope.dummyCreditSegments = [];
                    _.each($scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS, function (creditSegment, index) {
                        $scope.dummyCreditSegments[index] = _.contains($scope.dcbPostpaidCappingRuleProfile.CreditSegments, creditSegment);
                    });

                    // CreditSegments
                    $scope.toggleCreditSegment = function (creditSegment, isChecked) {
                        $scope.dcbPostpaidCappingRuleProfile.CreditSegments = $scope.dcbPostpaidCappingRuleProfile.CreditSegments || [];

                        if (isChecked) {
                            $scope.dcbPostpaidCappingRuleProfile.CreditSegments.push(creditSegment);
                        } else {
                            $scope.dcbPostpaidCappingRuleProfile.CreditSegments = _.without($scope.dcbPostpaidCappingRuleProfile.CreditSegments, creditSegment);
                        }

                        $scope.dcbPostpaidCappingRuleProfile.CreditSegments = $filter('orderBy')($scope.dcbPostpaidCappingRuleProfile.CreditSegments);
                    };

                    $scope.$watch('dcbPostpaidCappingRuleProfile.RuleOrder', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(service.dcbPostpaidCappingRuleProfileList, {RuleOrder: newVal});

                            var isDifferent = foundProfile ? dcbPostpaidCappingRuleProfile.id !== foundProfile.id : false;
                            $scope.form.RuleOrder.$setValidity('availabilityCheck', !(isDifferent && foundProfile));
                        }
                    });

                    $scope.save = function (dcbPostpaidCappingRuleProfile) {
                        if (dcbPostpaidCappingRuleProfile.isUnlimited) {
                            dcbPostpaidCappingRuleProfile.FixedCappingLimit = -1;
                        }

                        $uibModalInstance.close(dcbPostpaidCappingRuleProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (editedDcbPostpaidCappingRuleProfile) {
                var foundDcbPostpaidCappingRuleProfile = _.findWhere(service.dcbPostpaidCappingRuleProfileList, {id: editedDcbPostpaidCappingRuleProfile.id});
                if (foundDcbPostpaidCappingRuleProfile) {
                    foundDcbPostpaidCappingRuleProfile.isUnlimited = editedDcbPostpaidCappingRuleProfile.isUnlimited;
                    foundDcbPostpaidCappingRuleProfile.RuleOrder = editedDcbPostpaidCappingRuleProfile.RuleOrder;
                    foundDcbPostpaidCappingRuleProfile.RuleType = editedDcbPostpaidCappingRuleProfile.RuleType;
                    foundDcbPostpaidCappingRuleProfile.CreditSegments = editedDcbPostpaidCappingRuleProfile.CreditSegments;
                    foundDcbPostpaidCappingRuleProfile.CappingPolicy = editedDcbPostpaidCappingRuleProfile.CappingPolicy;
                    foundDcbPostpaidCappingRuleProfile.FixedCappingLimit = editedDcbPostpaidCappingRuleProfile.FixedCappingLimit;
                    foundDcbPostpaidCappingRuleProfile.BalancePercentage = editedDcbPostpaidCappingRuleProfile.BalancePercentage;
                    foundDcbPostpaidCappingRuleProfile.TenureBased = editedDcbPostpaidCappingRuleProfile.TenureBased;
                    foundDcbPostpaidCappingRuleProfile.TenureRangeStart = editedDcbPostpaidCappingRuleProfile.TenureRangeStart;
                    foundDcbPostpaidCappingRuleProfile.TenureRangeEnd = editedDcbPostpaidCappingRuleProfile.TenureRangeEnd;
                }

                service.dcbPostpaidCappingRuleProfileList = $filter('orderBy')(service.dcbPostpaidCappingRuleProfileList, ['RuleOrder']);
            }, function () {
            });
        };
        $scope.removeDCBPostpaidCappingRuleProfile = function (service, dcbPostpaidCappingRuleProfile) {
            var index = _.indexOf(service.dcbPostpaidCappingRuleProfileList, dcbPostpaidCappingRuleProfile);
            if (index !== -1) {
                service.dcbPostpaidCappingRuleProfileList.splice(index, 1);
            }
        };
        $scope.getDcbPostpaidCappingRuleProfileString = function (dcbPostpaidCappingRuleProfile) {
            var resultStr = dcbPostpaidCappingRuleProfile.RuleOrder + ', ';

            if (dcbPostpaidCappingRuleProfile.CreditSegments && dcbPostpaidCappingRuleProfile.CreditSegments.length > 0) {
                resultStr += '[' + dcbPostpaidCappingRuleProfile.CreditSegments.join(', ') + '], ';
            }

            resultStr += dcbPostpaidCappingRuleProfile.RuleType + ', ' + dcbPostpaidCappingRuleProfile.CappingPolicy + ', ';

            if (dcbPostpaidCappingRuleProfile.CappingPolicy === 'FIXED_AMOUNT') {
                if (dcbPostpaidCappingRuleProfile.FixedCappingLimit !== -1) {
                    resultStr += dcbPostpaidCappingRuleProfile.FixedCappingLimit;

                    if ($scope.service.dcbServiceProfile.Currency) {
                        resultStr += ' (' + $scope.service.dcbServiceProfile.Currency + ')';
                    }
                } else {
                    resultStr += $translate.instant('Subsystems.Provisioning.Services.DCBSettings.DCBPostpaidCappingRuleProfile.Unlimited');
                }
            } else if (dcbPostpaidCappingRuleProfile.CappingPolicy === 'PERCENTAGE_OF_BALANCE') {
                resultStr += '%' + dcbPostpaidCappingRuleProfile.BalancePercentage;
            } else if (dcbPostpaidCappingRuleProfile.CappingPolicy === 'PERCENTAGE_OF_CREDIT_LIMIT') {
                resultStr += '%' + dcbPostpaidCappingRuleProfile.CreditLimitPercentage;
            }

            if (dcbPostpaidCappingRuleProfile.TenureBased) {
                resultStr += ', ' + $translate.instant('Subsystems.Provisioning.Services.DCBSettings.DCBPostpaidCappingRuleProfile.TenureBased');
                resultStr += ' [' + (dcbPostpaidCappingRuleProfile.TenureRangeStart || 'N/A') + '-';
                resultStr += (dcbPostpaidCappingRuleProfile.TenureRangeEnd || 'N/A') + ']';
            }

            return resultStr;
        };

        // DCBServiceDisputeRuleProfiles managing methods.
        $scope.addDCBServiceDisputeRuleProfile = function (service) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbservicedisputeruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES, SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS,
                                      SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS, SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES) {
                    $scope.service = service;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES = SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES = SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES;

                    $scope.dcbServiceDisputeRuleProfile = {};

                    var checkAndValidateAvailability = function (newVal, oldVal, formField) {
                        $scope.form.TransactionType.$setValidity('availabilityCheck', true);
                        $scope.form.StatusAtCarrier.$setValidity('availabilityCheck', true);
                        $scope.form.StatusAtClient.$setValidity('availabilityCheck', true);
                        $scope.form.ThresholdCondition.$setValidity('availabilityCheck', true);

                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere($scope.service.dcbServiceDisputeRuleProfileList, {
                                TransactionType: $scope.dcbServiceDisputeRuleProfile.TransactionType,
                                StatusAtCarrier: $scope.dcbServiceDisputeRuleProfile.StatusAtCarrier,
                                StatusAtClient: $scope.dcbServiceDisputeRuleProfile.StatusAtClient,
                                ThresholdCondition: $scope.dcbServiceDisputeRuleProfile.ThresholdCondition
                            });

                            formField.$setValidity('availabilityCheck', _.isUndefined(foundProfile));
                        }
                    };
                    $scope.$watch('dcbServiceDisputeRuleProfile.TransactionType', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.TransactionType);
                    });
                    $scope.$watch('dcbServiceDisputeRuleProfile.StatusAtCarrier', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.StatusAtCarrier);
                    });
                    $scope.$watch('dcbServiceDisputeRuleProfile.StatusAtClient', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.StatusAtClient);
                    });
                    $scope.$watch('dcbServiceDisputeRuleProfile.ThresholdCondition', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.ThresholdCondition);
                    });

                    $scope.save = function (dcbServiceDisputeRuleProfile) {
                        $uibModalInstance.close(dcbServiceDisputeRuleProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (dcbServiceDisputeRuleProfile) {
                service.dcbServiceDisputeRuleProfileList = service.dcbServiceDisputeRuleProfileList || [];

                dcbServiceDisputeRuleProfile.id = _.uniqueId();
                service.dcbServiceDisputeRuleProfileList.push(dcbServiceDisputeRuleProfile);
            }, function () {
                //
            });
        };
        $scope.editDCBServiceDisputeRuleProfile = function (service, dcbServiceDisputeRuleProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbservicedisputeruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES, SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS,
                                      SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS, SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES) {
                    $scope.service = service;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES = SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES = SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES;

                    $scope.dcbServiceDisputeRuleProfile = angular.copy(dcbServiceDisputeRuleProfile);
                    $scope.dcbServiceDisputeRuleProfileOriginal = angular.copy($scope.dcbServiceDisputeRuleProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.dcbServiceDisputeRuleProfile, $scope.dcbServiceDisputeRuleProfileOriginal);
                    };

                    var checkAndValidateAvailability = function (newVal, oldVal, formField) {
                        $scope.form.TransactionType.$setValidity('availabilityCheck', true);
                        $scope.form.StatusAtCarrier.$setValidity('availabilityCheck', true);
                        $scope.form.StatusAtClient.$setValidity('availabilityCheck', true);
                        $scope.form.ThresholdCondition.$setValidity('availabilityCheck', true);

                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere($scope.service.dcbServiceDisputeRuleProfileList, {
                                TransactionType: $scope.dcbServiceDisputeRuleProfile.TransactionType,
                                StatusAtCarrier: $scope.dcbServiceDisputeRuleProfile.StatusAtCarrier,
                                StatusAtClient: $scope.dcbServiceDisputeRuleProfile.StatusAtClient,
                                ThresholdCondition: $scope.dcbServiceDisputeRuleProfile.ThresholdCondition
                            });

                            var isDifferent = foundProfile ? $scope.dcbServiceDisputeRuleProfile.id !== foundProfile.id : false;
                            formField.$setValidity('availabilityCheck', !(isDifferent && foundProfile));
                        }
                    };
                    $scope.$watch('dcbServiceDisputeRuleProfile.TransactionType', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.TransactionType);
                    });
                    $scope.$watch('dcbServiceDisputeRuleProfile.StatusAtCarrier', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.StatusAtCarrier);
                    });
                    $scope.$watch('dcbServiceDisputeRuleProfile.StatusAtClient', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.StatusAtClient);
                    });
                    $scope.$watch('dcbServiceDisputeRuleProfile.ThresholdCondition', function (newVal, oldVal) {
                        checkAndValidateAvailability(newVal, oldVal, $scope.form.ThresholdCondition);
                    });

                    $scope.save = function (dcbServiceDisputeRuleProfile) {
                        $uibModalInstance.close(dcbServiceDisputeRuleProfile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (editedDcbServiceDisputeRuleProfile) {
                var foundDcbServiceDisputeRuleProfile = _.findWhere(service.dcbServiceDisputeRuleProfileList, {id: editedDcbServiceDisputeRuleProfile.id});
                if (foundDcbServiceDisputeRuleProfile) {
                    foundDcbServiceDisputeRuleProfile.TransactionType = editedDcbServiceDisputeRuleProfile.TransactionType;
                    foundDcbServiceDisputeRuleProfile.StatusAtCarrier = editedDcbServiceDisputeRuleProfile.StatusAtCarrier;
                    foundDcbServiceDisputeRuleProfile.StatusAtClient = editedDcbServiceDisputeRuleProfile.StatusAtClient;
                    foundDcbServiceDisputeRuleProfile.ThresholdCondition = editedDcbServiceDisputeRuleProfile.ThresholdCondition;
                    foundDcbServiceDisputeRuleProfile.Action = editedDcbServiceDisputeRuleProfile.Action;
                }
            }, function () {
            });
        };
        $scope.removeDCBServiceDisputeRuleProfile = function (service, dcbServiceDisputeRuleProfile) {
            var index = _.indexOf(service.dcbServiceDisputeRuleProfileList, dcbServiceDisputeRuleProfile);
            if (index !== -1) {
                service.dcbServiceDisputeRuleProfileList.splice(index, 1);
            }
        };
        $scope.getDcbServiceDisputeRuleProfileString = function (dcbServiceDisputeRuleProfile) {
            var resultStr = 'Trx: ' + dcbServiceDisputeRuleProfile.TransactionType + ', @Carrier: ' + dcbServiceDisputeRuleProfile.StatusAtCarrier;
            resultStr += ', @Client: ' + dcbServiceDisputeRuleProfile.StatusAtClient + ', Threshold: ' + dcbServiceDisputeRuleProfile.ThresholdCondition;
            resultStr += ', Action: ' + dcbServiceDisputeRuleProfile.Action;

            return resultStr;
        };

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

            // DCBPrepaidCappingRuleProfile
            if (service.dcbPrepaidCappingRuleProfileList && service.dcbPrepaidCappingRuleProfileList.length > 0) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalDCBPrepaidCappingRuleProfile) {
                    if (originalDCBPrepaidCappingRuleProfile.name === CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE) {
                        return _.findWhere(service.dcbPrepaidCappingRuleProfileList, {profileId: originalDCBPrepaidCappingRuleProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalDCBPrepaidCappingRuleProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE);

                _.each(service.dcbPrepaidCappingRuleProfileList, function (updatedDCBPrepaidCappingRuleProfile) {
                    updatedDCBPrepaidCappingRuleProfile = JSON.parse(angular.toJson(updatedDCBPrepaidCappingRuleProfile));

                    // Modify some attributes here.
                    delete updatedDCBPrepaidCappingRuleProfile.id;
                    delete updatedDCBPrepaidCappingRuleProfile.isUnlimited;

                    var originalDCBPrepaidCappingRuleProfile = _.findWhere(originalDCBPrepaidCappingRuleProfiles, {id: updatedDCBPrepaidCappingRuleProfile.profileId});
                    var dcbPrepaidCappingRuleProfileAttrArray = CMPFService.prepareProfile(updatedDCBPrepaidCappingRuleProfile, originalDCBPrepaidCappingRuleProfile);
                    // ---
                    if (originalDCBPrepaidCappingRuleProfile) {
                        originalDCBPrepaidCappingRuleProfile.attributes = dcbPrepaidCappingRuleProfileAttrArray;
                    } else {
                        var dcbPrepaidCappingRuleProfile = {
                            name: CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE,
                            attributes: dcbPrepaidCappingRuleProfileAttrArray
                        };

                        serviceItem.profiles.push(dcbPrepaidCappingRuleProfile);
                    }
                });
            } else {
                // Remove DCBPrepaidCappingRuleProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function(profile) { return profile.profileDefinitionName !== CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE; });
            }

            // DCBPostpaidCappingRuleProfile
            if (service.dcbPostpaidCappingRuleProfileList && service.dcbPostpaidCappingRuleProfileList.length > 0) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalDCBPostpaidCappingRuleProfile) {
                    if (originalDCBPostpaidCappingRuleProfile.name === CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE) {
                        return _.findWhere(service.dcbPostpaidCappingRuleProfileList, {profileId: originalDCBPostpaidCappingRuleProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalDCBPostpaidCappingRuleProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE);

                _.each(service.dcbPostpaidCappingRuleProfileList, function (updatedDCBPostpaidCappingRuleProfile) {
                    updatedDCBPostpaidCappingRuleProfile = JSON.parse(angular.toJson(updatedDCBPostpaidCappingRuleProfile));

                    // Modify some attributes here.
                    delete updatedDCBPostpaidCappingRuleProfile.id;
                    delete updatedDCBPostpaidCappingRuleProfile.isUnlimited;
                    if (updatedDCBPostpaidCappingRuleProfile.CreditSegments) {
                        updatedDCBPostpaidCappingRuleProfile.CreditSegments = updatedDCBPostpaidCappingRuleProfile.CreditSegments.join(',');
                    }

                    var originalDCBPostpaidCappingRuleProfile = _.findWhere(originalDCBPostpaidCappingRuleProfiles, {id: updatedDCBPostpaidCappingRuleProfile.profileId});
                    var dcbPostpaidCappingRuleProfileAttrArray = CMPFService.prepareProfile(updatedDCBPostpaidCappingRuleProfile, originalDCBPostpaidCappingRuleProfile);
                    // ---
                    if (originalDCBPostpaidCappingRuleProfile) {
                        originalDCBPostpaidCappingRuleProfile.attributes = dcbPostpaidCappingRuleProfileAttrArray;
                    } else {
                        var dcbPostpaidCappingRuleProfile = {
                            name: CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE,
                            attributes: dcbPostpaidCappingRuleProfileAttrArray
                        };

                        serviceItem.profiles.push(dcbPostpaidCappingRuleProfile);
                    }
                });
            } else {
                // Remove DCBPostpaidCappingRuleProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function(profile) { return profile.profileDefinitionName !== CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE; });
            }

            // DCBServiceDisputeRuleProfile
            if (service.dcbServiceDisputeRuleProfileList && service.dcbServiceDisputeRuleProfileList.length > 0) {
                // Filter out the removed items from the list.
                serviceItem.profiles = _.filter(serviceItem.profiles, function (originalDCBServiceDisputeRuleProfile) {
                    if (originalDCBServiceDisputeRuleProfile.name === CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE) {
                        return _.findWhere(service.dcbServiceDisputeRuleProfileList, {profileId: originalDCBServiceDisputeRuleProfile.id});
                    } else {
                        return true;
                    }
                });

                var originalDCBServiceDisputeRuleProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE);

                _.each(service.dcbServiceDisputeRuleProfileList, function (updatedDCBServiceDisputeRuleProfile) {
                    updatedDCBServiceDisputeRuleProfile = JSON.parse(angular.toJson(updatedDCBServiceDisputeRuleProfile));

                    // Modify some attributes here.
                    delete updatedDCBServiceDisputeRuleProfile.id;

                    var originalDCBServiceDisputeRuleProfile = _.findWhere(originalDCBServiceDisputeRuleProfiles, {id: updatedDCBServiceDisputeRuleProfile.profileId});
                    var dcbServiceDisputeRuleProfileAttrArray = CMPFService.prepareProfile(updatedDCBServiceDisputeRuleProfile, originalDCBServiceDisputeRuleProfile);
                    // ---
                    if (originalDCBServiceDisputeRuleProfile) {
                        originalDCBServiceDisputeRuleProfile.attributes = dcbServiceDisputeRuleProfileAttrArray;
                    } else {
                        var dcbServiceDisputeRuleProfile = {
                            name: CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE,
                            attributes: dcbServiceDisputeRuleProfileAttrArray
                        };

                        serviceItem.profiles.push(dcbServiceDisputeRuleProfile);
                    }
                });
            } else {
                // Remove DCBPostpaidCappingRuleProfile instances
                serviceItem.profiles = _.filter(serviceItem.profiles, function(profile) { return profile.profileDefinitionName !== CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE; });
            }

            // DCBServiceMessagei18nProfile
            if (service.dcbServiceMessagei18nProfiles && service.dcbServiceMessagei18nProfiles.length > 0) {
                var originalDCBServiceMessagei18nProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE);
                _.each(service.dcbServiceMessagei18nProfiles, function (updatedDCBServiceMessagei18nProfile) {
                    updatedDCBServiceMessagei18nProfile = JSON.parse(angular.toJson(updatedDCBServiceMessagei18nProfile));
                    var originalDCBServiceMessagei18nProfile = _.findWhere(originalDCBServiceMessagei18nProfiles, {id: updatedDCBServiceMessagei18nProfile.profileId});
                    var dcbServiceMessagei18nProfileAttrArray = CMPFService.prepareProfile(updatedDCBServiceMessagei18nProfile, originalDCBServiceMessagei18nProfile);
                    // ---
                    if (originalDCBServiceMessagei18nProfile) {
                        originalDCBServiceMessagei18nProfile.attributes = dcbServiceMessagei18nProfileAttrArray;
                    } else {
                        var dcbServiceMessagei18nProfile = {
                            name: CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE,
                            attributes: dcbServiceMessagei18nProfileAttrArray
                        };

                        serviceItem.profiles.push(dcbServiceMessagei18nProfile);
                    }
                });
            }

            // DCBServiceInvoicei18nProfile
            if (service.dcbServiceInvoicei18nProfiles && service.dcbServiceInvoicei18nProfiles.length > 0) {
                var originalDCBServiceInvoicei18nProfiles = CMPFService.findProfilesByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE);
                _.each(service.dcbServiceInvoicei18nProfiles, function (updatedDCBServiceInvoicei18nProfile) {
                    updatedDCBServiceInvoicei18nProfile = JSON.parse(angular.toJson(updatedDCBServiceInvoicei18nProfile));
                    var originalDCBServiceInvoicei18nProfile = _.findWhere(originalDCBServiceInvoicei18nProfiles, {id: updatedDCBServiceInvoicei18nProfile.profileId});
                    var dcbServiceInvoicei18nProfileAttrArray = CMPFService.prepareProfile(updatedDCBServiceInvoicei18nProfile, originalDCBServiceInvoicei18nProfile);
                    // ---
                    if (originalDCBServiceInvoicei18nProfile) {
                        originalDCBServiceInvoicei18nProfile.attributes = dcbServiceInvoicei18nProfileAttrArray;
                    } else {
                        var dcbServiceInvoicei18nProfile = {
                            name: CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE,
                            profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE,
                            attributes: dcbServiceInvoicei18nProfileAttrArray
                        };

                        serviceItem.profiles.push(dcbServiceInvoicei18nProfile);
                    }
                });
            }

            // DCBServiceActivationProfile
            if (service.dcbServiceActivationProfile) {
                var originalDCBServiceActivationProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE);
                var updatedDCBServiceActivationProfile = JSON.parse(angular.toJson(service.dcbServiceActivationProfile));
                var dcbServiceActivationProfileArray = CMPFService.prepareProfile(updatedDCBServiceActivationProfile, originalDCBServiceActivationProfile);
                // ---
                if (originalDCBServiceActivationProfile) {
                    originalDCBServiceActivationProfile.attributes = dcbServiceActivationProfileArray;
                } else {
                    var dcbServiceActivationProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_ACTIVATION_PROFILE,
                        attributes: dcbServiceActivationProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceActivationProfile);
                }
            }

            // DCBServiceDeactivationProfile
            if (service.dcbServiceDeactivationProfile) {
                var originalDCBServiceDeactivationProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_DEACTIVATION_PROFILE);
                var updatedDCBServiceDeactivationProfile = JSON.parse(angular.toJson(service.dcbServiceDeactivationProfile));
                var dcbServiceDeactivationProfileArray = CMPFService.prepareProfile(updatedDCBServiceDeactivationProfile, originalDCBServiceDeactivationProfile);
                // ---
                if (originalDCBServiceDeactivationProfile) {
                    originalDCBServiceDeactivationProfile.attributes = dcbServiceDeactivationProfileArray;
                } else {
                    var dcbServiceDeactivationProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_DEACTIVATION_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_DEACTIVATION_PROFILE,
                        attributes: dcbServiceDeactivationProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceDeactivationProfile);
                }
            }

            // DCBServiceEligibilityProfile
            if (service.dcbServiceEligibilityProfile) {
                var originalDCBServiceEligibilityProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_ELIGIBILITY_PROFILE);
                var updatedDCBServiceEligibilityProfile = JSON.parse(angular.toJson(service.dcbServiceEligibilityProfile));

                // Modify some attributes here.
                if (updatedDCBServiceEligibilityProfile.allowedCreditSegments) {
                    updatedDCBServiceEligibilityProfile.allowedCreditSegments = updatedDCBServiceEligibilityProfile.allowedCreditSegments.join(',');
                }

                var dcbServiceEligibilityProfileArray = CMPFService.prepareProfile(updatedDCBServiceEligibilityProfile, originalDCBServiceEligibilityProfile);
                // ---
                if (originalDCBServiceEligibilityProfile) {
                    originalDCBServiceEligibilityProfile.attributes = dcbServiceEligibilityProfileArray;
                } else {
                    var dcbServiceEligibilityProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_ELIGIBILITY_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_ELIGIBILITY_PROFILE,
                        attributes: dcbServiceEligibilityProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceEligibilityProfile);
                }
            }

            // DCBServiceCDRProfile
            if (service.dcbServiceCDRProfile) {
                var originalDCBServiceCDRProfile = CMPFService.findProfileByName(serviceItem.profiles, CMPFService.SERVICE_DCB_SERVICE_CDR_PROFILE);
                var updatedDCBServiceCDRProfile = JSON.parse(angular.toJson(service.dcbServiceCDRProfile));
                var dcbServiceCDRProfileArray = CMPFService.prepareProfile(updatedDCBServiceCDRProfile, originalDCBServiceCDRProfile);
                // ---
                if (originalDCBServiceCDRProfile) {
                    originalDCBServiceCDRProfile.attributes = dcbServiceCDRProfileArray;
                } else {
                    var dcbServiceCDRProfile = {
                        name: CMPFService.SERVICE_DCB_SERVICE_CDR_PROFILE,
                        profileDefinitionName: CMPFService.SERVICE_DCB_SERVICE_CDR_PROFILE,
                        attributes: dcbServiceCDRProfileArray
                    };

                    serviceItem.profiles.push(dcbServiceCDRProfile);
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