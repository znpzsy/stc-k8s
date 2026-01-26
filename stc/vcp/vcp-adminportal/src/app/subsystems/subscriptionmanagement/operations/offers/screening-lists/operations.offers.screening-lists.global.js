(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.screening-lists.global', []);

    var SubscriptionManagementOperationsOffersGlobalScreeningListsGlobalModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.offers.screening-lists.global');

    SubscriptionManagementOperationsOffersGlobalScreeningListsGlobalModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.offers.screening-lists.global', {
            url: "/global",
            templateUrl: "subsystems/subscriptionmanagement/operations/offers/screening-lists/operations.offers.screening-lists.global.html",
            controller: 'SubscriptionManagementOperationsOffersScreeningListsGlobalListsCtrl',
            resolve: {
                msisdnList: function (offer, ScreeningManagerService) {
                    return ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.serviceNames.SSM, offer.name, ScreeningManagerService.scopes.MSISDN_SCOPE_KEY);
                },
                sanList: function (offer, ScreeningManagerService) {
                    return ScreeningManagerService.getScreeningListsByScopeAndService(ScreeningManagerService.serviceNames.SSM, offer.name, ScreeningManagerService.scopes.SAN_SCOPE_KEY);
                }
            }
        });

    });

    SubscriptionManagementOperationsOffersGlobalScreeningListsGlobalModule.controller('SubscriptionManagementOperationsOffersScreeningListsGlobalListsCtrl', function ($scope, $log, $controller, $filter, $uibModal, $translate, notification, UtilService, NgTableParams, NgTableService,
                                                                                                                                                                       AdmPortalMainPromiseTracker, Restangular, ScreeningManagerService, SCREENING_MANAGER_RULES, OFFER_SCREENING_IDENTIFIERS, offer,
                                                                                                                                                                       msisdnList, sanList) {
        $log.debug('SubscriptionManagementOperationsOffersScreeningListsGlobalListsCtrl');

        $scope.offer = offer;

        $scope.SCREENING_MANAGER_RULES = SCREENING_MANAGER_RULES;

        $scope.selectedScreeningModeTypes = {
            msisdn: SCREENING_MANAGER_RULES[0].value,
            san: SCREENING_MANAGER_RULES[0].value
        };

        var blackList = [];
        var whiteList = [];

        if (msisdnList && msisdnList.screeningScope) {
            _.each(msisdnList.screeningScope.blackList, function (screenableEntry) {
                screenableEntry['serviceKey'] = ScreeningManagerService.serviceNames.SSM;
                screenableEntry['identifier'] = OFFER_SCREENING_IDENTIFIERS[0];
                screenableEntry['scopeKey'] = ScreeningManagerService.scopes.MSISDN_SCOPE_KEY;

                blackList.push(screenableEntry);
            });

            _.each(msisdnList.screeningScope.whiteList, function (screenableEntry) {
                screenableEntry['serviceKey'] = ScreeningManagerService.serviceNames.SSM;
                screenableEntry['identifier'] = OFFER_SCREENING_IDENTIFIERS[0];
                screenableEntry['scopeKey'] = ScreeningManagerService.scopes.MSISDN_SCOPE_KEY;

                whiteList.push(screenableEntry);
            });

            $scope.selectedScreeningModeTypes.msisdn = msisdnList.screeningScope.selectedScreeningModeType;
        }

        if (sanList && sanList.screeningScope) {
            _.each(sanList.screeningScope.blackList, function (screenableEntry) {
                screenableEntry['serviceKey'] = ScreeningManagerService.serviceNames.SSM;
                screenableEntry['identifier'] = OFFER_SCREENING_IDENTIFIERS[1];
                screenableEntry['scopeKey'] = ScreeningManagerService.scopes.SAN_SCOPE_KEY;

                blackList.push(screenableEntry);
            });

            _.each(sanList.screeningScope.whiteList, function (screenableEntry) {
                screenableEntry['serviceKey'] = ScreeningManagerService.serviceNames.SSM;
                screenableEntry['identifier'] = OFFER_SCREENING_IDENTIFIERS[1];
                screenableEntry['scopeKey'] = ScreeningManagerService.scopes.SAN_SCOPE_KEY;

                whiteList.push(screenableEntry);
            });

            $scope.selectedScreeningModeTypes.san = sanList.screeningScope.selectedScreeningModeType;
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

        // Delete methods and modal window definitions
        var deleteListItem = function ($listObj, listKey, item) {
            item.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/screenings/screenings.deleteconfirmation.modal.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message = $translate.instant('ScreeningLists.Messages.DeleteConfirmationMessage', {
                        value: item.screenableEntryId,
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

                ScreeningManagerService.deleteListItem(item.serviceKey, $scope.offer.name, item.scopeKey, listKey, item.screenableEntryId).then(function (response) {
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

                        $log.debug('Item with this id ', deletedListItem.screenableEntryId, ', ', deletedListItem.screenableCorrelator, ' has been deleted successfully.');

                        notification({
                            type: 'success',
                            text: $translate.instant('ScreeningLists.Messages.DeletedSuccessfully', {
                                value: deletedListItem.screenableEntryId,
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

        // Add new item methods and modal window definitions
        var addNewListItem = function (currentTable, listKey) {
            var modalInstance = $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/offers/screening-lists/operations.offers.screening-lists.addform.modal.html',
                controller: function ($scope, $filter, $uibModalInstance, $translate, Restangular, OFFER_SCREENING_IDENTIFIERS) {
                    $scope.currentList = [];
                    $scope.currentList = $scope.currentList.concat(blackList);
                    $scope.currentList = $scope.currentList.concat(whiteList);

                    var screeningListKey = 'ScreeningLists.AddForm.BlackListTitle';
                    if (listKey === 'whitelist') {
                        screeningListKey = 'ScreeningLists.AddForm.WhiteListTitle';
                    }

                    $scope.addFormTitle = $translate.instant(screeningListKey);

                    $scope.identifierList = OFFER_SCREENING_IDENTIFIERS;

                    $scope.listItem = {
                        identifier: $scope.identifierList[0],
                        listKey: listKey,
                        screenableEntryId: '',
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
                resolve: {}
            });

            modalInstance.result.then(function (listItem) {
                var screenableEntry = {
                    screenableEntryId: listItem.screenableEntryId,
                    screenableCorrelator: listItem.screenableCorrelator
                };

                var scopeSubscriberKey = $scope.offer.name, scopeKey = '';
                if (listItem.identifier.value === 'MSISDN') {
                    scopeKey = ScreeningManagerService.scopes.MSISDN_SCOPE_KEY;
                } else if (listItem.identifier.value === 'SAN') {
                    scopeKey = ScreeningManagerService.scopes.SAN_SCOPE_KEY;
                }

                ScreeningManagerService.addNewListItem(ScreeningManagerService.serviceNames.SSM, scopeSubscriberKey, scopeKey, listItem.listKey, screenableEntry).then(function (response) {
                    if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                        var text = '';
                        if (response.errorCode === ScreeningManagerService.errorCodes.QUOTA_ERROR) {
                            // If maximum list member quota is exceeded show a quota information notification.
                            text = $translate.instant('ScreeningLists.Messages.QuotaExceeded', {
                                value: listItem.screenableEntryId,
                                count: $scope.blackList.list.length
                            });
                        } else if (response.errorCode === ScreeningManagerService.errorCodes.WRONG_REQUEST_ERROR) {
                            // If subscribe number is invalid
                            text = $translate.instant('ScreeningLists.Messages.ValueIsInvalid', {value: listItem.screenableEntryId});
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
                                value: listItem.screenableEntryId,
                                identifier: $translate.instant(listItem.identifier.label)
                            })
                        });

                        listItem['serviceKey'] = ScreeningManagerService.serviceNames.SSM;
                        listItem['identifier'] = listItem.identifier;
                        listItem['scopeKey'] = listItem.scopeKey;

                        listItem.currentTable.list.push(listItem);
                        listItem.currentTable.tableParams.reload();

                        $log.debug('A new item [', listItem.screenableEntryId, ', ', listItem.screenableCorrelator, '] added to ' + ScreeningManagerService.scopes.WELCOME_SMS_BLACKLIST_SCOPE_KEY + ' list.');
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
            ScreeningManagerService.updateScreeningRule(ScreeningManagerService.serviceNames.SSM, $scope.offer.name, ScreeningManagerService.scopes.MSISDN_SCOPE_KEY, selectedScreeningModeTypes.msisdn).then(function (response1) {
                ScreeningManagerService.updateScreeningRule(ScreeningManagerService.serviceNames.SSM, $scope.offer.name, ScreeningManagerService.scopes.SAN_SCOPE_KEY, selectedScreeningModeTypes.san).then(function (response2) {
                    notification({
                        type: 'success',
                        text: $translate.instant('ScreeningLists.Messages.ScreeningRuleUpdatedSuccessfully')
                    });

                    // Copy to original object again to disable save button again.
                    $scope.selectedScreeningModeTypesOriginal = angular.copy($scope.selectedScreeningModeTypes);

                    $log.debug('Screening rules updated. Result: ', response1, response2);
                });
            });
        };

        $scope.cancelScreeningRuleUpdate = function () {
            $scope.selectedScreeningModeTypes = angular.copy($scope.selectedScreeningModeTypesOriginal);
        };

    });

})();
