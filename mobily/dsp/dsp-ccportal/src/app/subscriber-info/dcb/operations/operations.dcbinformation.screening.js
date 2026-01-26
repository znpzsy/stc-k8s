(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.screening', []);

    var DCBOperationsDCBInformationScreeningModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.screening');

    DCBOperationsDCBInformationScreeningModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation.screening', {
            url: "/screening",
            templateUrl: "subscriber-info/dcb/operations/operations.dcbinformation.screening.html",
            controller: 'DCBOperationsDCBInformationScreeningCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true, true, [CMPFService.SERVICE_PROFILE, CMPFService.SERVICE_DCB_SERVICE_PROFILE], CMPFService.SERVICE_PROFILE, {"Type": "DCB_SERVICE"});
                },
                serviceScreeningList: function (UtilService, ScreeningManagerV2Service) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return ScreeningManagerV2Service.getScreeningListsByScopeAndService(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY);
                }
            }
        });

    });

    DCBOperationsDCBInformationScreeningModule.controller('DCBOperationsDCBInformationScreeningCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, UtilService, NgTableParams, NgTableService,
                                                                                                                Restangular, CMPFService, ScreeningManagerV2Service, SCREENING_MANAGER_RULES, DCB_SCREENING_IDENTIFIERS, services,
                                                                                                                serviceScreeningList) {
        $log.debug('DCBOperationsDCBInformationScreeningCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.allServiceList = services.services;
        _.each($scope.allServiceList, function (service) {
            // DCBServiceProfile
            var dcbServiceProfiles = CMPFService.getProfileAttributes(service.profiles, CMPFService.SERVICE_DCB_SERVICE_PROFILE);
            if (dcbServiceProfiles.length > 0) {
                service.dcbServiceProfile = angular.copy(dcbServiceProfiles[0]);
            }
            if (!service.dcbServiceProfile || !service.dcbServiceProfile.TrustStatus) {
                service.dcbServiceProfile = {
                    TrustStatus: 'UNTRUSTED'
                };
            }
        });

        $scope.SCREENING_MANAGER_RULES = SCREENING_MANAGER_RULES;

        $scope.selectedScreeningModeTypes = {
            service: SCREENING_MANAGER_RULES[0].value
        };

        var blackList = [];
        var whiteList = [];

        var prepareScreeningItem = function (screenableEntry) {
            screenableEntry['serviceKey'] = ScreeningManagerV2Service.serviceNames.SUBSCRIBER;
            screenableEntry['identifier'] = DCB_SCREENING_IDENTIFIERS[0];
            screenableEntry['scopeKey'] = ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY;

            var foundService = _.findWhere($scope.allServiceList, {id: Number(screenableEntry.screenableEntryId)});
            if (foundService) {
                screenableEntry.TrustStatus = $filter('YesNoFilter')(foundService.dcbServiceProfile.TrustStatus === 'TRUSTED');
                screenableEntry.screenableEntryIdText = foundService.name;
            } else {
                screenableEntry.TrustStatus = $filter('YesNoFilter')(false);
                screenableEntry.screenableEntryIdText = 'N/A';
            }

            return screenableEntry;
        };

        if (serviceScreeningList && serviceScreeningList.screeningScope) {
            _.each(serviceScreeningList.screeningScope.blackList, function (screenableEntry) {
                if (screenableEntry.screenableEntryId !== '-1') {
                    blackList.push(prepareScreeningItem(screenableEntry));
                }
            });

            _.each(serviceScreeningList.screeningScope.whiteList, function (screenableEntry) {
                if (screenableEntry.screenableEntryId !== '-1') {
                    whiteList.push(prepareScreeningItem(screenableEntry));
                }
            });

            $scope.selectedScreeningModeTypes.service = serviceScreeningList.screeningScope.selectedScreeningModeType;
        }

        // Black list of current scope definitions
        $scope.blackList = {
            list: blackList,
            tableParams: {}
        };
        $scope.filterBlackList = _.debounce(function (filterText, filterColumns) {
            $scope.blackList.tableParams.settings().$scope.filterText = filterText;
            $scope.blackList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.blackList.tableParams.page(1);
            $scope.blackList.tableParams.reload();
        }, 750);
        $scope.blackList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "screenableEntryId": 'asc' // initial sorting
            }
        }, {
            total: $scope.blackList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.blackList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.blackList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Black list definitions

        // White list of current scope definitions
        $scope.whiteList = {
            list: whiteList,
            tableParams: {}
        };
        $scope.filterWhiteList = _.debounce(function (filterText, filterColumns) {
            $scope.whiteList.tableParams.settings().$scope.filterText = filterText;
            $scope.whiteList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.whiteList.tableParams.page(1);
            $scope.whiteList.tableParams.reload();
        }, 750);
        $scope.whiteList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "screenableEntryId": 'asc' // initial sorting
            }
        }, {
            total: $scope.whiteList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.whiteList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.whiteList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - White list definitions

        // Add new item methods and modal window definitions
        var addNewListItem = function (currentTable, listKey) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.screening.addform.modal.html',
                controller: function ($scope, $filter, $uibModalInstance, $translate, Restangular, CMPFService, DCB_SCREENING_IDENTIFIERS,
                                      genericDCBSettings, services) {
                    $scope.currentList = [];
                    $scope.currentList = $scope.currentList.concat(blackList);
                    $scope.currentList = $scope.currentList.concat(whiteList);

                    $scope.allServiceList = services.services;

                    $scope.genericDCBSettings = Restangular.stripRestangular(genericDCBSettings);
                    if ($scope.genericDCBSettings && $scope.genericDCBSettings.allowanceResponse) {
                        $scope.genericDCBSettings.enabled = $scope.genericDCBSettings.allowanceResponse.allowed;
                    } else {
                        $scope.genericDCBSettings.enabled = false;
                    }

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

                    var screeningListKey = 'ScreeningLists.AddForm.BlackListTitle';
                    if (listKey === 'whitelist') {
                        screeningListKey = 'ScreeningLists.AddForm.WhiteListTitle';
                    }

                    $scope.addFormTitle = $translate.instant(screeningListKey);

                    $scope.identifierList = DCB_SCREENING_IDENTIFIERS;

                    $scope.listItem = {
                        identifier: $scope.identifierList[0],
                        listKey: listKey,
                        screenableEntryId: null,
                        screenableCorrelator: '',
                        currentTable: currentTable
                    };

                    $scope.save = function (listItem) {
                        $uibModalInstance.close(listItem);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    genericDCBSettings: function (UtilService, ScreeningManagerV2Service, DCBService) {
                        var msisdn = UtilService.getSubscriberMsisdn();

                        return ScreeningManagerV2Service.getAllowance(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY, DCBService.GENERIC_DCB_SERVICE_ID)
                    },
                    services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllServices(true, true, [CMPFService.SERVICE_PROFILE, CMPFService.SERVICE_DCB_SERVICE_PROFILE], CMPFService.SERVICE_PROFILE, {"Type": "DCB_SERVICE"});
                    }
                }
            });

            modalInstance.result.then(function (listItem) {
                var screenableEntry = {
                    screenableEntryId: listItem.screenableEntryId,
                    screenableCorrelator: listItem.screenableCorrelator
                };

                var scopeSubscriberKey = msisdn, scopeKey = ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY;

                var foundService = _.findWhere($scope.allServiceList, {id: Number(listItem.screenableEntryId)});
                if (foundService) {
                    listItem.TrustStatus = $filter('YesNoFilter')(foundService.dcbServiceProfile.TrustStatus === 'TRUSTED');
                    listItem.screenableEntryIdText = foundService.name;
                } else {
                    screenableEntry.TrustStatus = $filter('YesNoFilter')(false);
                    listItem.screenableEntryIdText = 'N/A';
                }

                ScreeningManagerV2Service.addNewListItem(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, scopeSubscriberKey, scopeKey, listItem.listKey, screenableEntry).then(function (response) {
                    if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                        var text = '';
                        if (response.errorCode === ScreeningManagerV2Service.errorCodes.QUOTA_ERROR) {
                            // If maximum list member quota is exceeded show a quota information notification.
                            text = $translate.instant('ScreeningLists.Messages.QuotaExceeded', {
                                value: listItem.screenableEntryIdText,
                                count: $scope.blackList.list.length
                            });
                        } else if (response.errorCode === ScreeningManagerV2Service.errorCodes.WRONG_REQUEST_ERROR) {
                            // If subscribe number is invalid
                            text = $translate.instant('ScreeningLists.Messages.ValueIsInvalid', {value: listItem.screenableEntryIdText});
                        } else {
                            // If there are some other type errors
                            text = response.errorCode + ' - ' + response.message;
                        }

                        notification({
                            type: 'warning',
                            text: text
                        });
                    } else {
                        notification({
                            type: 'success',
                            text: $translate.instant('ScreeningLists.Messages.AddedSuccessfully', {
                                value: listItem.screenableEntryIdText,
                                identifier: $translate.instant(listItem.identifier.label)
                            })
                        });

                        listItem['serviceKey'] = ScreeningManagerV2Service.serviceNames.SUBSCRIBER;
                        listItem['identifier'] = DCB_SCREENING_IDENTIFIERS[0];
                        listItem['scopeKey'] = scopeKey;

                        listItem.currentTable.list.push(listItem);
                        listItem.currentTable.tableParams.reload();

                        $log.debug('A new item [', listItem.screenableEntryIdText, ', ', listItem.screenableCorrelator, '] added to ' + ScreeningManagerV2Service.scopes.WELCOME_SMS_BLACKLIST_SCOPE_KEY + ' list.');
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }, function () {
                // Dismissed
            });
        };

        $scope.addNewBlackListItem = function () {
            addNewListItem($scope.blackList, 'blacklist');
        };

        $scope.addNewWhiteListItem = function () {
            addNewListItem($scope.whiteList, 'whitelist');
        };

        $scope.selectedScreeningModeTypesOriginal = angular.copy($scope.selectedScreeningModeTypes);
        $scope.isNotChanged = function () {
            return angular.equals($scope.selectedScreeningModeTypes, $scope.selectedScreeningModeTypesOriginal);
        };

        $scope.updateScreeningRule = function (selectedScreeningModeTypes, direction) {
            ScreeningManagerV2Service.updateScreeningRule(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY, selectedScreeningModeTypes.service).then(function (response) {
                $log.debug('Screening rules updated. Result: ', response);

                // Copy to original object again to disable save button again.
                $scope.selectedScreeningModeTypesOriginal = angular.copy($scope.selectedScreeningModeTypes);

                notification({
                    type: 'success',
                    text: $translate.instant('ScreeningLists.Messages.ScreeningRuleUpdatedSuccessfully')
                });
            });
        };

        $scope.cancelScreeningRuleUpdate = function () {
            $scope.selectedScreeningModeTypes.service = $scope.selectedScreeningModeTypesOriginal.service;
        };

        // Delete methods and modal window definitions
        var deleteListItem = function ($listObj, listKey, item) {
            item.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/screenings/screenings.deleteconfirmation.modal.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message = $translate.instant('ScreeningLists.Messages.DeleteConfirmationMessage', {
                        value: item.screenableEntryIdText,
                        identifier: $translate.instant(item.identifier.label)
                    });

                    $scope.cancelConfirmationMessage = $sce.trustAsHtml(message);

                    $scope.yes = function () {
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function () {
                item.rowSelected = false;

                ScreeningManagerV2Service.deleteListItem(item.serviceKey, msisdn, item.scopeKey, listKey, item.screenableEntryId).then(function (response) {
                    var opSucceeded = true;
                    if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                        opSucceeded = false;

                        // If there are some other type errors
                        notification({
                            type: 'warning',
                            text: response.errorCode + ' - ' + response.message
                        });
                    }

                    // Remove from the actual list.
                    if (!_.isEmpty($listObj.list) && opSucceeded) {
                        var deletedListItem = _.findWhere($listObj.list, {screenableEntryId: item.screenableEntryId});
                        $listObj.list = _.without($listObj.list, deletedListItem);
                        $listObj.tableParams.reload();

                        if (listKey === 'blacklist') {
                            blackList = $listObj.list;
                        } else {
                            whiteList = $listObj.list;
                        }

                        $log.debug('Item with this id ', deletedListItem.screenableEntryIdText, ', ', deletedListItem.screenableCorrelator, ' has been deleted successfully.');

                        notification({
                            type: 'success',
                            text: $translate.instant('ScreeningLists.Messages.DeletedSuccessfully', {
                                value: deletedListItem.screenableEntryIdText,
                                identifier: $translate.instant(deletedListItem.identifier.label)
                            })
                        });
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }, function () {
                item.rowSelected = false;
            });
        };

        $scope.deleteBlackListItem = function (item) {
            deleteListItem($scope.blackList, 'blacklist', item);
        };

        $scope.deleteWhiteListItem = function (item) {
            deleteListItem($scope.whiteList, 'whitelist', item);
        };

    });

})();
