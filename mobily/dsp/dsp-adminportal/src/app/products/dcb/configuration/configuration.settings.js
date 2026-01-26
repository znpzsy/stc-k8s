(function () {

    'use strict';

    angular.module('adminportal.products.dcb.configuration.settings', []);

    var DcbConfigurationSettingsModule = angular.module('adminportal.products.dcb.configuration.settings');

    DcbConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.configuration.settings', {
            url: "/settings",
            templateUrl: "products/dcb/configuration/configuration.settings.details.html",
            controller: 'DcbConfigurationSettingsCtrl',
            resolve: {
                dcbSettingsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME);
                }
            }
        });

    });

    DcbConfigurationSettingsModule.controller('DcbConfigurationSettingsCtrl', function ($scope, $log, $state, $uibModal, $filter, $translate, notification, CMPFService, UtilService, DURATION_UNITS,
                                                                                        SERVICE_CURRENCIES, SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS, dcbSettingsOrganization) {
        $log.debug('DcbConfigurationSettingsCtrl');

        $scope.SERVICE_CURRENCIES = SERVICE_CURRENCIES;
        $scope.SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS = SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS;

        $scope.dcbSettingsOrganization = dcbSettingsOrganization.organizations[0] || {};

        // DCBProfile
        var dcbProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_PROFILE);
        if (dcbProfiles.length > 0) {
            $scope.dcbSettingsOrganization.dcbProfile = angular.copy(dcbProfiles[0]);
        } else {
            $scope.dcbSettingsOrganization.dcbProfile = {
                SenderID: '',
                Currency: 'SAR',
                IsCapped: false,
                LastUpdateTime: null
            };
        }

        // DCBPrepaidCappingRuleProfile
        var dcbPrepaidCappingRuleProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE);
        if (dcbPrepaidCappingRuleProfiles.length > 0) {
            $scope.dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList = [];
            _.each(dcbPrepaidCappingRuleProfiles, function (dcbPrepaidCappingRuleProfile) {
                var dcbPrepaidCappingRuleProfileItem = _.extend({id: _.uniqueId()}, dcbPrepaidCappingRuleProfile);
                dcbPrepaidCappingRuleProfileItem.isUnlimited = (Number(dcbPrepaidCappingRuleProfileItem.FixedCappingLimit) === -1);

                $scope.dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList.push(dcbPrepaidCappingRuleProfileItem);
            });

            $scope.dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList = $filter('orderBy')($scope.dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList, ['RuleType']);
        }

        // DCBPostpaidCappingRuleProfile
        var dcbPostpaidCappingRuleProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE);
        if (dcbPostpaidCappingRuleProfiles.length > 0) {
            $scope.dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList = [];
            _.each(dcbPostpaidCappingRuleProfiles, function (dcbPostpaidCappingRuleProfile) {
                var dcbPostpaidCappingRuleProfileItem = _.extend({id: _.uniqueId()}, dcbPostpaidCappingRuleProfile);
                dcbPostpaidCappingRuleProfileItem.isUnlimited = (Number(dcbPostpaidCappingRuleProfileItem.FixedCappingLimit) === -1);
                dcbPostpaidCappingRuleProfileItem.CreditSegments = dcbPostpaidCappingRuleProfileItem.CreditSegments.split(',');

                $scope.dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList.push(dcbPostpaidCappingRuleProfileItem);
            });

            $scope.dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList = $filter('orderBy')($scope.dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, ['RuleOrder']);
        }

        // DCBServiceDisputeRuleProfile
        var dcbServiceDisputeRuleProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE);
        if (dcbServiceDisputeRuleProfiles.length > 0) {
            $scope.dcbSettingsOrganization.dcbServiceDisputeRuleProfileList = [];
            _.each(dcbServiceDisputeRuleProfiles, function (dcbServiceDisputeRuleProfile) {
                var dcbServiceDisputeRuleProfileItem = _.extend({id: _.uniqueId()}, dcbServiceDisputeRuleProfile);

                $scope.dcbSettingsOrganization.dcbServiceDisputeRuleProfileList.push(dcbServiceDisputeRuleProfileItem);
            });

            $scope.dcbSettingsOrganization.dcbServiceDisputeRuleProfileList = $filter('orderBy')($scope.dcbSettingsOrganization.dcbServiceDisputeRuleProfileList, ['TransactionType']);
        }

        // DCBServiceReconciliationProfile
        var dcbServiceReconciliationProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE);
        if (dcbServiceReconciliationProfiles.length > 0) {
            $scope.dcbSettingsOrganization.dcbServiceReconciliationProfile = angular.copy(dcbServiceReconciliationProfiles[0]);
        } else {
            $scope.dcbSettingsOrganization.dcbServiceReconciliationProfile = {
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

        // DCBPrepaidCappingRuleProfiles managing methods.
        $scope.addDCBPrepaidCappingRuleProfile = function (dcbSettingsOrganization) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbprepaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES, SERVICE_DCB_PREPAID_CAPPING_POLICIES) {
                    $scope.dcbSettingsOrganization = dcbSettingsOrganization;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES = SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_POLICIES = SERVICE_DCB_PREPAID_CAPPING_POLICIES;

                    $scope.dcbPrepaidCappingRuleProfile = {
                        isUnlimited: false
                    };

                    // For service specific pages consistency.
                    $scope.service = {
                        dcbServiceProfile: {
                            Currency: dcbSettingsOrganization.dcbProfile.Currency
                        }
                    };

                    $scope.$watch('dcbPrepaidCappingRuleProfile.RuleType', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList, {RuleType: newVal});

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
                dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList = dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList || [];

                dcbPrepaidCappingRuleProfile.id = _.uniqueId();
                dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList.push(dcbPrepaidCappingRuleProfile);
            }, function () {
                //
            });
        };
        $scope.editDCBPrepaidCappingRuleProfile = function (dcbSettingsOrganization, dcbPrepaidCappingRuleProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbprepaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES, SERVICE_DCB_PREPAID_CAPPING_POLICIES) {
                    $scope.dcbSettingsOrganization = dcbSettingsOrganization;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES = SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_PREPAID_CAPPING_POLICIES = SERVICE_DCB_PREPAID_CAPPING_POLICIES;

                    // For service specific pages consistency.
                    $scope.service = {
                        dcbServiceProfile: {
                            Currency: dcbSettingsOrganization.dcbProfile.Currency
                        }
                    };

                    $scope.dcbPrepaidCappingRuleProfile = angular.copy(dcbPrepaidCappingRuleProfile);
                    $scope.dcbPrepaidCappingRuleProfileOriginal = angular.copy($scope.dcbPrepaidCappingRuleProfile);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.dcbPrepaidCappingRuleProfile, $scope.dcbPrepaidCappingRuleProfileOriginal);
                    };

                    $scope.$watch('dcbPrepaidCappingRuleProfile.RuleType', function (newVal, oldVal) {
                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere(dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList, {RuleType: newVal});

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
                var foundDcbPrepaidCappingRuleProfile = _.findWhere(dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList, {id: editedDcbPrepaidCappingRuleProfile.id});
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
        $scope.removeDCBPrepaidCappingRuleProfile = function (dcbSettingsOrganization, dcbPrepaidCappingRuleProfile) {
            var index = _.indexOf(dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList, dcbPrepaidCappingRuleProfile);
            if (index !== -1) {
                dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList.splice(index, 1);
            }
        };
        $scope.getDcbPrepaidCappingRuleProfileString = function (dcbPrepaidCappingRuleProfile) {
            var resultStr = dcbPrepaidCappingRuleProfile.RuleType + ', ' + dcbPrepaidCappingRuleProfile.CappingPolicy + ', ';

            if (dcbPrepaidCappingRuleProfile.CappingPolicy === 'FIXED_AMOUNT') {
                if (dcbPrepaidCappingRuleProfile.FixedCappingLimit !== -1) {
                    resultStr += dcbPrepaidCappingRuleProfile.FixedCappingLimit;

                    if ($scope.dcbSettingsOrganization.dcbProfile.Currency) {
                        resultStr += ' (' + $scope.dcbSettingsOrganization.dcbProfile.Currency + ')';
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
        $scope.addDCBPostpaidCappingRuleProfile = function (dcbSettingsOrganization) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbpostpaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, $filter, SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES, SERVICE_DCB_POSTPAID_CAPPING_POLICIES,
                                      SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS) {
                    $scope.dcbSettingsOrganization = dcbSettingsOrganization;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES = SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_POLICIES = SERVICE_DCB_POSTPAID_CAPPING_POLICIES;
                    $scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS = SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS;

                    $scope.dcbPostpaidCappingRuleProfile = {
                        isUnlimited: false,
                        TenureBased: false
                    };

                    // For service specific pages consistency.
                    $scope.service = {
                        dcbServiceProfile: {
                            Currency: dcbSettingsOrganization.dcbProfile.Currency
                        }
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
                            var foundProfile = _.findWhere(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, {RuleOrder: newVal});

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
                dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList = dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList || [];

                dcbPostpaidCappingRuleProfile.id = _.uniqueId();
                dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList.push(dcbPostpaidCappingRuleProfile);

                dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList = $filter('orderBy')(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, ['RuleOrder']);
            }, function () {
                //
            });
        };
        $scope.editDCBPostpaidCappingRuleProfile = function (dcbSettingsOrganization, dcbPostpaidCappingRuleProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbpostpaidcappingruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, $filter, SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES, SERVICE_DCB_POSTPAID_CAPPING_POLICIES,
                                      SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS) {
                    $scope.dcbSettingsOrganization = dcbSettingsOrganization;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES = SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES;
                    $scope.SERVICE_DCB_POSTPAID_CAPPING_POLICIES = SERVICE_DCB_POSTPAID_CAPPING_POLICIES;
                    $scope.SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS = SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS;

                    // For service specific pages consistency.
                    $scope.service = {
                        dcbServiceProfile: {
                            Currency: dcbSettingsOrganization.dcbProfile.Currency
                        }
                    };

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
                            var foundProfile = _.findWhere(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, {RuleOrder: newVal});

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
                var foundDcbPostpaidCappingRuleProfile = _.findWhere(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, {id: editedDcbPostpaidCappingRuleProfile.id});
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

                dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList = $filter('orderBy')(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, ['RuleOrder']);
            }, function () {
            });
        };
        $scope.removeDCBPostpaidCappingRuleProfile = function (dcbSettingsOrganization, dcbPostpaidCappingRuleProfile) {
            var index = _.indexOf(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, dcbPostpaidCappingRuleProfile);
            if (index !== -1) {
                dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList.splice(index, 1);
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

                    if ($scope.dcbSettingsOrganization.dcbProfile.Currency) {
                        resultStr += ' (' + $scope.dcbSettingsOrganization.dcbProfile.Currency + ')';
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
        $scope.addDCBServiceDisputeRuleProfile = function (dcbSettingsOrganization) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbservicedisputeruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES, SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS,
                                      SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS, SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES) {
                    $scope.dcbSettingsOrganization = dcbSettingsOrganization;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES = SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES = SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES;

                    $scope.dcbServiceDisputeRuleProfile = {};

                    // For service specific pages consistency.
                    $scope.service = {
                        dcbServiceProfile: {
                            Currency: dcbSettingsOrganization.dcbProfile.Currency
                        }
                    };

                    var checkAndValidateAvailability = function (newVal, oldVal, formField) {
                        $scope.form.TransactionType.$setValidity('availabilityCheck', true);
                        $scope.form.StatusAtCarrier.$setValidity('availabilityCheck', true);
                        $scope.form.StatusAtClient.$setValidity('availabilityCheck', true);
                        $scope.form.ThresholdCondition.$setValidity('availabilityCheck', true);

                        if (!angular.equals(newVal, oldVal)) {
                            var foundProfile = _.findWhere($scope.dcbSettingsOrganization.dcbServiceDisputeRuleProfileList, {
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
                dcbSettingsOrganization.dcbServiceDisputeRuleProfileList = dcbSettingsOrganization.dcbServiceDisputeRuleProfileList || [];

                dcbServiceDisputeRuleProfile.id = _.uniqueId();
                dcbSettingsOrganization.dcbServiceDisputeRuleProfileList.push(dcbServiceDisputeRuleProfile);
            }, function () {
                //
            });
        };
        $scope.editDCBServiceDisputeRuleProfile = function (dcbSettingsOrganization, dcbServiceDisputeRuleProfile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/services/dcb/operations.services.dcbservicedisputeruleprofile.modal.html',
                controller: function ($scope, $log, $uibModalInstance, SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES, SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS,
                                      SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS, SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES) {
                    $scope.dcbSettingsOrganization = dcbSettingsOrganization;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES = SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS = SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS;
                    $scope.SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES = SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES;

                    // For service specific pages consistency.
                    $scope.service = {
                        dcbServiceProfile: {
                            Currency: dcbSettingsOrganization.dcbProfile.Currency
                        }
                    };

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
                            var foundProfile = _.findWhere($scope.dcbSettingsOrganization.dcbServiceDisputeRuleProfileList, {
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
                var foundDcbServiceDisputeRuleProfile = _.findWhere(dcbSettingsOrganization.dcbServiceDisputeRuleProfileList, {id: editedDcbServiceDisputeRuleProfile.id});
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
        $scope.removeDCBServiceDisputeRuleProfile = function (dcbSettingsOrganization, dcbServiceDisputeRuleProfile) {
            var index = _.indexOf(dcbSettingsOrganization.dcbServiceDisputeRuleProfileList, dcbServiceDisputeRuleProfile);
            if (index !== -1) {
                dcbSettingsOrganization.dcbServiceDisputeRuleProfileList.splice(index, 1);
            }
        };
        $scope.getDcbServiceDisputeRuleProfileString = function (dcbServiceDisputeRuleProfile) {
            var resultStr = 'Trx: ' + dcbServiceDisputeRuleProfile.TransactionType + ', @Carrier: ' + dcbServiceDisputeRuleProfile.StatusAtCarrier;
            resultStr += ', @Client: ' + dcbServiceDisputeRuleProfile.StatusAtClient + ', Threshold: ' + dcbServiceDisputeRuleProfile.ThresholdCondition;
            resultStr += ', Action: ' + dcbServiceDisputeRuleProfile.Action;

            return resultStr;
        };

        $scope.originalDcbSettingsOrganization = angular.copy($scope.dcbSettingsOrganization);
        $scope.isNotChanged = function () {
            return angular.equals($scope.dcbSettingsOrganization, $scope.originalDcbSettingsOrganization);
        };

        $scope.save = function (dcbSettingsOrganization) {
            // Update the last update time for create first time or for update everytime.
            dcbSettingsOrganization.dcbProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

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
            if (dcbSettingsOrganization.dcbProfile) {
                var originalDCBProfile = CMPFService.findProfileByName(dcbSettingsOrganizationItem.profiles, CMPFService.SERVICE_DCB_PROFILE);
                var updatedDCBProfile = JSON.parse(angular.toJson(dcbSettingsOrganization.dcbProfile));
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

            // DCBPrepaidCappingRuleProfile
            if (dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList && dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList.length > 0) {
                var originalDCBPrepaidCappingRuleProfiles = CMPFService.findProfilesByName(dcbSettingsOrganizationItem.profiles, CMPFService.SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE);
                _.each(dcbSettingsOrganization.dcbPrepaidCappingRuleProfileList, function (updatedDCBPrepaidCappingRuleProfile) {
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

                        dcbSettingsOrganizationItem.profiles.push(dcbPrepaidCappingRuleProfile);
                    }
                });
            }

            // DCBPostpaidCappingRuleProfile
            if (dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList && dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList.length > 0) {
                var originalDCBPostpaidCappingRuleProfiles = CMPFService.findProfilesByName(dcbSettingsOrganizationItem.profiles, CMPFService.SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE);
                _.each(dcbSettingsOrganization.dcbPostpaidCappingRuleProfileList, function (updatedDCBPostpaidCappingRuleProfile) {
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

                        dcbSettingsOrganizationItem.profiles.push(dcbPostpaidCappingRuleProfile);
                    }
                });
            }

            // DCBServiceDisputeRuleProfile
            if (dcbSettingsOrganization.dcbServiceDisputeRuleProfileList && dcbSettingsOrganization.dcbServiceDisputeRuleProfileList.length > 0) {
                var originalDCBServiceDisputeRuleProfiles = CMPFService.findProfilesByName(dcbSettingsOrganizationItem.profiles, CMPFService.SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE);
                _.each(dcbSettingsOrganization.dcbServiceDisputeRuleProfileList, function (updatedDCBServiceDisputeRuleProfile) {
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

                        dcbSettingsOrganizationItem.profiles.push(dcbServiceDisputeRuleProfile);
                    }
                });
            }

            // DCBServiceReconciliationProfile
            if (dcbSettingsOrganization.dcbServiceReconciliationProfile) {
                var originalDCBServiceReconciliationProfile = CMPFService.findProfileByName(dcbSettingsOrganizationItem.profiles, CMPFService.SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE);
                var updatedDCBServiceReconciliationProfile = JSON.parse(angular.toJson(dcbSettingsOrganization.dcbServiceReconciliationProfile));
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

                    dcbSettingsOrganizationItem.profiles.push(dcbServiceReconciliationProfile);
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
