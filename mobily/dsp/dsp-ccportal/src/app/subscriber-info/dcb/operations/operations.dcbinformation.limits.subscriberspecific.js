(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific', []);

    var DCBOperationsDCBInformationLimitsSubscriberSpecificModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific');

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific', {
            url: "/subscriber-specific",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.subscriberspecific.html'
        }).state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.allservices', {
            url: "/all-services",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.subscriberspecific.details.html',
            controller: 'DCBOperationsDCBInformationLimitsSubscriberSpecificAllServicesCtrl',
            resolve: {
                serviceId: function (DCBService) {
                    return DCBService.GENERIC_DCB_ALL_SERVICE_ID;
                },
                subscriberCapping: function (UtilService, DCBService) {
                    var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    return DCBService.getSubscriberCapping(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber, DCBService.GENERIC_DCB_ALL_SERVICE_ID)
                }
            }
        }).state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.alluntrustedservices', {
            url: "/all-untrusted-services",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.subscriberspecific.details.html',
            controller: 'DCBOperationsDCBInformationLimitsSubscriberSpecificAllUntrustedServicesCtrl',
            resolve: {
                serviceId: function (DCBService) {
                    return DCBService.GENERIC_DCB_SERVICE_ID;
                },
                subscriberCapping: function (Restangular, UtilService, DCBService, genericDCBSettings) {
                    var genericDCBSettings = Restangular.stripRestangular(genericDCBSettings);
                    if (genericDCBSettings && genericDCBSettings.allowanceResponse) {
                        var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                        return DCBService.getSubscriberCapping(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber, DCBService.GENERIC_DCB_SERVICE_ID)
                    } else {
                        return;
                    }
                }
            }
        }).state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.servicespecific', {
            url: "/service-specific",
            template: '<div ui-view></div>'
        }).state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.servicespecific.list', {
            url: "/list",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.subscriberspecific.servicespecific.html',
            controller: 'DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                },
                subscriberCapping: function ($q, UtilService, DCBService, services) {
                    var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    var allServiceList = services.services;

                    var deferred = $q.defer();

                    DCBService.getSubscriberCapping(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber).then(function (cappingRuleResponse) {
                        var filteredCappingRuleList = {};
                        if (cappingRuleResponse && cappingRuleResponse.length > 0) {
                            _.each(cappingRuleResponse, function (cappingRule) {
                                if (cappingRule.serviceId !== DCBService.GENERIC_DCB_ALL_SERVICE_ID && cappingRule.serviceId !== DCBService.GENERIC_DCB_SERVICE_ID) {
                                    if (!filteredCappingRuleList[cappingRule.serviceId]) {
                                        filteredCappingRuleList[cappingRule.serviceId] = {};
                                    }

                                    var foundService = _.findWhere(allServiceList, {id: Number(cappingRule.serviceId)});
                                    if (foundService) {
                                        filteredCappingRuleList[cappingRule.serviceId].service = foundService;
                                    } else {
                                        filteredCappingRuleList[cappingRule.serviceId].service = {
                                            name: 'N/A'
                                        };
                                    }

                                    if (cappingRule.ruleType === "PER_DAY") {
                                        filteredCappingRuleList[cappingRule.serviceId].dailySubscriberCappingRule = cappingRule;
                                        filteredCappingRuleList[cappingRule.serviceId].dailySubscriberCappingRule.dailyLimit = Number(cappingRule.amount);
                                    } else if (cappingRule.ruleType === "PER_MONTH") {
                                        filteredCappingRuleList[cappingRule.serviceId].monthlySubscriberCappingRule = cappingRule;
                                        filteredCappingRuleList[cappingRule.serviceId].monthlySubscriberCappingRule.monthlyLimit = Number(cappingRule.amount);
                                    } else if (cappingRule.ruleType === "PER_PURCHASE") {
                                        filteredCappingRuleList[cappingRule.serviceId].purchaseSubscriberCappingRule = cappingRule;
                                        filteredCappingRuleList[cappingRule.serviceId].purchaseSubscriberCappingRule.purchaseLimit = Number(cappingRule.amount);
                                    }
                                }
                            });
                        }

                        deferred.resolve(filteredCappingRuleList);
                    }, function (response) {
                        deferred.resolve([]);
                    });

                    return deferred.promise;
                }
            }
        }).state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.servicespecific.new', {
            url: "/new",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.subscriberspecific.details.html',
            controller: 'DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificNewCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true, true, [CMPFService.SERVICE_PROFILE, CMPFService.SERVICE_DCB_SERVICE_PROFILE], CMPFService.SERVICE_PROFILE, {"Type": "DCB_SERVICE"});
                }
            }
        }).state('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.servicespecific.update', {
            url: "/update/:serviceId",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.subscriberspecific.details.html',
            controller: 'DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificUpdateCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true, true, [CMPFService.SERVICE_PROFILE, CMPFService.SERVICE_DCB_SERVICE_PROFILE], CMPFService.SERVICE_PROFILE, {"Type": "DCB_SERVICE"});
                },
                subscriberCapping: function ($stateParams, UtilService, DCBService) {
                    var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    if ($stateParams.serviceId) {
                        return DCBService.getSubscriberCapping(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber, $stateParams.serviceId)
                    } else {
                        return [];
                    }
                }
            }
        });

    });

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.controller('DCBOperationsDCBInformationLimitsSubscriberSpecificCommonCtrl', function ($scope, $log, $q, $filter, $translate, notification, UtilService, CMPFService, DCBService, dcbSettingsOrganization,
                                                                                                                                                    predefinedSuccessMessage, predefinedErrorMessage, serviceId, subscriberCapping) {
        $log.debug('DCBOperationsDCBInformationLimitsSubscriberSpecificCommonCtrl');

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

        var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

        $scope.limits = {
            dailyLimit: null,
            monthlyLimit: null,
            purchaseLimit: null
        };

        if (subscriberCapping && subscriberCapping.length > 0) {
            $scope.limits.dailySubscriberCappingRule = _.findWhere(subscriberCapping, {
                ruleType: "PER_DAY",
                serviceId: serviceId
            });
            if ($scope.limits.dailySubscriberCappingRule) {
                $scope.limits.dailyLimit = $scope.limits.dailySubscriberCappingRule.amount;
            }

            $scope.limits.monthlySubscriberCappingRule = _.findWhere(subscriberCapping, {
                ruleType: "PER_MONTH",
                serviceId: serviceId
            });
            if ($scope.limits.monthlySubscriberCappingRule) {
                $scope.limits.monthlyLimit = $scope.limits.monthlySubscriberCappingRule.amount;
            }

            $scope.limits.purchaseSubscriberCappingRule = _.findWhere(subscriberCapping, {
                ruleType: "PER_PURCHASE",
                serviceId: serviceId
            });
            if ($scope.limits.purchaseSubscriberCappingRule) {
                $scope.limits.purchaseLimit = $scope.limits.purchaseSubscriberCappingRule.amount;
            }
        }

        $scope.originalLimits = angular.copy($scope.limits);
        $scope.isNotChanged = function () {
            return angular.equals($scope.limits, $scope.originalLimits);
        };

        $scope.save = function (limits) {
            $log.debug('Updating all services dcb subscriber capping rules: ', limits);

            var commonCappingRule = {
                "accountNumber": subscriberResponse.subscriberAccountNumber,
                "msisdn": subscriberResponse.msisdn,
                "serviceId": serviceId
            };

            var promises = [];

            if (!angular.equals($scope.limits.dailyLimit, $scope.originalLimits.dailyLimit)) {
                if ($scope.limits.dailyLimit) {
                    var dailyCappingRule = _.extend({
                        amount: $filter('number')(limits.dailyLimit, 2),
                        ruleType: 'PER_DAY'
                    }, commonCappingRule);

                    promises.push(DCBService.createSubscriberCapping(dailyCappingRule));
                } else {
                    promises.push(DCBService.deleteSubscriberCapping($scope.limits.dailySubscriberCappingRule.uuid));
                }
            }

            if (!angular.equals($scope.limits.monthlyLimit, $scope.originalLimits.monthlyLimit)) {
                if ($scope.limits.monthlyLimit) {
                    var monthlyCappingRule = _.extend({
                        amount: $filter('number')(limits.monthlyLimit, 2),
                        ruleType: 'PER_MONTH'
                    }, commonCappingRule);

                    promises.push(DCBService.createSubscriberCapping(monthlyCappingRule));
                } else {
                    promises.push(DCBService.deleteSubscriberCapping($scope.limits.monthlySubscriberCappingRule.uuid));
                }
            }

            if (!angular.equals($scope.limits.purchaseLimit, $scope.originalLimits.purchaseLimit)) {
                if ($scope.limits.purchaseLimit) {
                    var purchaseCappingRule = _.extend({
                        amount: $filter('number')(limits.purchaseLimit, 2),
                        ruleType: 'PER_PURCHASE'
                    }, commonCappingRule);

                    promises.push(DCBService.createSubscriberCapping(purchaseCappingRule));
                } else {
                    promises.push(DCBService.deleteSubscriberCapping($scope.limits.purchaseSubscriberCappingRule.uuid));
                }
            }

            if (promises.length > 0) {
                $q.all(promises).then(function (results) {
                    $log.debug('Updated all services dcb subscriber capping rules: ', results);

                    var errorMessage;
                    try {
                        _.each(results, function (result) {
                            if (result && result.status === 'ERROR') {
                                errorMessage = (result && result.message);
                                throw new Error('Found!');
                            }
                        })
                    } catch (e) {
                        // Ignore the error.
                    }

                    if (errorMessage) {
                        notification({
                            type: 'warning',
                            text: errorMessage
                        });
                    } else {
                        notification.flash({
                            type: 'success',
                            text: predefinedSuccessMessage
                        });

                        if (serviceId !== DCBService.GENERIC_DCB_ALL_SERVICE_ID && serviceId !== DCBService.GENERIC_DCB_SERVICE_ID) {
                            $scope.cancel();
                        }
                    }
                }, function (response) {
                    $log.debug('Cannot update all services dcb subscriber capping rules. Error: ', response);

                    notification({
                        type: 'warning',
                        text: predefinedErrorMessage
                    });
                });
            }
        }
    });

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.controller('DCBOperationsDCBInformationLimitsSubscriberSpecificAllServicesCtrl', function ($scope, $log, $state, $controller, $translate, dcbSettingsOrganization, serviceId, subscriberCapping) {
        $log.debug('DCBOperationsDCBInformationLimitsSubscriberSpecificAllServicesCtrl');

        $controller('DCBOperationsDCBInformationLimitsSubscriberSpecificCommonCtrl', {
            $scope: $scope,
            dcbSettingsOrganization: dcbSettingsOrganization,
            serviceId: serviceId,
            subscriberCapping: subscriberCapping,
            predefinedSuccessMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitAllServicesSettingsUpdated'),
            predefinedErrorMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitAllServicesSettingsUpdatingError')
        });

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.controller('DCBOperationsDCBInformationLimitsSubscriberSpecificAllUntrustedServicesCtrl', function ($scope, $log, $state, $controller, $translate, dcbSettingsOrganization, serviceId, subscriberCapping) {
        $log.debug('DCBOperationsDCBInformationLimitsSubscriberSpecificAllUntrustedServicesCtrl');

        if ($scope.genericDCBSettings.enabled) {
            $controller('DCBOperationsDCBInformationLimitsSubscriberSpecificCommonCtrl', {
                $scope: $scope,
                dcbSettingsOrganization: dcbSettingsOrganization,
                serviceId: serviceId,
                subscriberCapping: subscriberCapping,
                predefinedSuccessMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitAllUntrustedServicesSettingsUpdated'),
                predefinedErrorMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitAllUntrustedServicesSettingsUpdatingError')
            });
        } else {
            $state.go('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.allservices', null, {reload: true});
        }

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.controller('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificCtrl', function ($scope, $log, $q, $state, $controller, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                             DCBService, UtilService, subscriberCapping) {
        $log.debug('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificCtrl');

        var subscriberCappingList = [];
        _.each(subscriberCapping, function (subscriberCappingItem) {
            subscriberCappingList.push({
                service: subscriberCappingItem.service,
                dailySubscriberCappingRule: subscriberCappingItem.dailySubscriberCappingRule,
                monthlySubscriberCappingRule: subscriberCappingItem.monthlySubscriberCappingRule,
                purchaseSubscriberCappingRule: subscriberCappingItem.purchaseSubscriberCappingRule
            });
        });

        $scope.subscriberCappingList = {
            list: subscriberCappingList,
            tableParams: {}
        };

        $scope.subscriberCappingList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "service.name": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.subscriberCappingList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.subscriberCappingList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.subscriberCappingList.tableParams.settings().$scope.filterText = filterText;
            $scope.subscriberCappingList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.subscriberCappingList.tableParams.page(1);
            $scope.subscriberCappingList.tableParams.reload();
        }, 500);

        $scope.remove = function (limits) {
            limits.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                limits.rowSelected = false;

                var promises = [];

                if (limits.dailySubscriberCappingRule) {
                    promises.push(DCBService.deleteSubscriberCapping(limits.dailySubscriberCappingRule.uuid));
                }
                if (limits.monthlySubscriberCappingRule) {
                    promises.push(DCBService.deleteSubscriberCapping(limits.monthlySubscriberCappingRule.uuid));
                }
                if (limits.purchaseSubscriberCappingRule) {
                    promises.push(DCBService.deleteSubscriberCapping(limits.purchaseSubscriberCappingRule.uuid));
                }

                if (promises.length > 0) {
                    $q.all(promises).then(function (results) {
                        $log.debug('Deleted service specific dcb subscriber capping rules: ', results);

                        var errorMessage;
                        try {
                            _.each(results, function (result) {
                                if (result && result.status === 'ERROR') {
                                    errorMessage = (result && result.message);
                                    throw new Error('Found!');
                                }
                            })
                        } catch (e) {
                            // Ignore the error.
                        }

                        if (errorMessage) {
                            notification({
                                type: 'warning',
                                text: errorMessage
                            });
                        } else {
                            var deletedListItem = _.findWhere($scope.subscriberCappingList.list, {
                                $$hashKey: limits.$$hashKey
                            });
                            $scope.subscriberCappingList.list = _.without($scope.subscriberCappingList.list, deletedListItem);
                            $scope.subscriberCappingList.tableParams.reload();

                            notification({
                                type: 'success',
                                text: $translate.instant('SubscriberInfo.DCB.SubscriberLimitServiceSpecificSettingsDeleted', {serviceName: limits.service.name})
                            });
                        }
                    }, function (response) {
                        $log.debug('Cannot delete service specific dcb subscriber capping rules. Error: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('SubscriberInfo.DCB.SubscriberLimitServiceSpecificSettingsDeletingError', {serviceName: limits.service.name})
                        });
                    });
                }
            }, function () {
                project.rowSelected = false;
            });
        };
    });

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.controller('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificNewCtrl', function ($scope, $log, $q, $state, $controller, $filter, $translate, notification, DCBService, UtilService,
                                                                                                                                                                CMPFService, dcbSettingsOrganization, services) {
        $log.debug('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificNewCtrl');

        var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

        $scope.allServiceList = services.services;

        $scope.dcbServiceList = [];
        _.each($scope.allServiceList, function (service) {
            // ServiceProfile
            var serviceProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_PROFILE);
            if (serviceProfiles.length > 0) {
                service.serviceProfile = angular.copy(serviceProfiles[0]);
            } else {
                service.serviceProfile = {
                    Type: 'N/A'
                };
            }

            // DCBServiceProfile
            var dcbServiceProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
            if (dcbServiceProfiles.length > 0) {
                service.dcbServiceProfile = angular.copy(dcbServiceProfiles[0]);

                if (service.dcbServiceProfile.TrustStatus) {
                    service.dcbServiceProfile.TrustStatusLabel = (service.dcbServiceProfile.TrustStatus === 'TRUSTED' ? 'Trusted DCB Services' : 'Untrusted DCB Services');
                }
            }
            if (!service.dcbServiceProfile || !service.dcbServiceProfile.TrustStatus) {
                service.dcbServiceProfile = {
                    TrustStatus: 'UNTRUSTED',
                    TrustStatusLabel: 'Untrusted DCB Services'
                };
            }

            // Filter out the ACTIVE or PENDING, DCB and Trusted services.
            if ((service.state === 'ACTIVE' || service.state === 'PENDING') && service.serviceProfile.Type === 'DCB_SERVICE') {
                if ($scope.genericDCBSettings.enabled) {
                    $scope.dcbServiceList.push(service);
                } else if (service.dcbServiceProfile.TrustStatus === 'TRUSTED') {
                    $scope.dcbServiceList.push(service);
                }
            }
        });
        $scope.dcbServiceList = $filter('orderBy')($scope.dcbServiceList, ['dcbServiceProfile.TrustStatus', 'name']);

        $scope.changeService = function (service) {
            if (service.id) {
                DCBService.getSubscriberCapping(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber, service.id).then(function (response) {
                    $controller('DCBOperationsDCBInformationLimitsSubscriberSpecificCommonCtrl', {
                        $scope: $scope,
                        dcbSettingsOrganization: dcbSettingsOrganization,
                        serviceId: service.id,
                        subscriberCapping: response,
                        predefinedSuccessMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitServiceSpecificSettingsCreated', {serviceName: service.name}),
                        predefinedErrorMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitServiceSpecificSettingsCreatingError', {serviceName: service.name})
                    });

                    $scope.limits.service = service;
                    $scope.originalLimits = angular.copy($scope.limits);
                });
            } else {
                $scope.limits = {
                    dailyLimit: null,
                    monthlyLimit: null,
                    purchaseLimit: null,
                    service: service
                };
            }
        };

        $scope.cancel = function () {
            $state.go('subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific.servicespecific.list', null, {reload: true});
        };
    });

    DCBOperationsDCBInformationLimitsSubscriberSpecificModule.controller('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificUpdateCtrl', function ($scope, $log, $state, $stateParams, $controller, $translate, dcbSettingsOrganization, services, subscriberCapping) {
        $log.debug('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificUpdateCtrl');

        $controller('DCBOperationsDCBInformationLimitsSubscriberSpecificServiceSpecificNewCtrl', {
            $scope: $scope,
            dcbSettingsOrganization: dcbSettingsOrganization,
            services: services
        });

        var foundService = _.findWhere(services.services, {id: Number($stateParams.serviceId)});
        if (foundService) {
            $scope.service = foundService;
        } else {
            $scope.service = {
                name: 'N/A'
            };
        }

        $controller('DCBOperationsDCBInformationLimitsSubscriberSpecificCommonCtrl', {
            $scope: $scope,
            dcbSettingsOrganization: dcbSettingsOrganization,
            serviceId: Number($stateParams.serviceId),
            subscriberCapping: subscriberCapping,
            predefinedSuccessMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitServiceSpecificSettingsUpdated', {serviceName: $scope.service.name}),
            predefinedErrorMessage: $translate.instant('SubscriberInfo.DCB.SubscriberLimitServiceSpecificSettingsUpdatingError', {serviceName: $scope.service.name})
        });

        $scope.limits.service = $scope.service;
        $scope.limits.id = _.uniqueId();

        $scope.originalLimits = angular.copy($scope.limits);
    });

})();
