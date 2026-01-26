(function () {

    'use strict';

    angular.module('adminportal.products.smsc.screening-lists.lists', []);

    var SmscScreeningListsListsModule = angular.module('adminportal.products.smsc.screening-lists.lists');

    // Screening List Black/White Lists Controller
    SmscScreeningListsListsModule.controller('SmscScreeningListsListsCtrl', function ($scope, $rootScope, $q, $log, $timeout, $uibModal, $filter, UtilService, NgTableParams, NgTableService,
                                                                                      ScreeningManagerService, AdmPortalMainPromiseTracker, $translate, notification, smscScopesList,
                                                                                      SCREENING_MANAGER_RULES, SmscScreeningListsFactory) {
        $scope.smscScopesList = smscScopesList;

        $scope.SCREENING_MANAGER_RULES = SCREENING_MANAGER_RULES;

        // White list of current scope definitions
        $scope.whiteList = {
            list: $scope.smscScopesList.whiteList,
            tableParams: {},
            listkey: 'whitelist'
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

        // Black list of current scope definitions
        $scope.blackList = {
            list: $scope.smscScopesList.blackList,
            tableParams: {},
            listkey: 'blacklist'
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

        // Delete methods and modal window definitions
        var deleteListItem = function ($listObj, item) {
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
                ScreeningManagerService.deleteListItem(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, item.scopeSubscriberKey, item.scopeKey, $listObj.listkey, item.screenableEntryId).then(function (response) {
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
                // Dismissed
            });
        };

        $scope.deleteWhiteListItem = function (item) {
            deleteListItem($scope.whiteList, item);
        };

        $scope.deleteBlackListItem = function (item) {
            deleteListItem($scope.blackList, item);
        };

        $scope.changeVasApplication = function (vasApplication) {
            if (vasApplication) {
                var promise;
                if ($scope.smscScopesList.direction === 'incoming') {
                    promise = SmscScreeningListsFactory.getVasAppsIncomingLists(vasApplication.name);
                } else if ($scope.smscScopesList.direction === 'outgoing') {
                    promise = SmscScreeningListsFactory.getVasAppsOutgoingLists(vasApplication.name);
                }

                promise.then(function (_smscScopesList) {
                    $scope.smscScopesList = _smscScopesList;
                    $scope.smscScopesList.vasApplication = vasApplication;
                    $scope.originalScreeningRules = angular.copy($scope.smscScopesList.screeningRules);
                    $scope.whiteList.list = $scope.smscScopesList.whiteList;
                    $scope.blackList.list = $scope.smscScopesList.blackList;

                    $scope.whiteList.tableParams.reload();
                    $scope.blackList.tableParams.reload();
                });
            }
        };

        $scope.originalScreeningRules = angular.copy($scope.smscScopesList.screeningRules);
        $scope.isScreeningRuleConfigurationNotChanged = function () {
            return angular.equals($scope.originalScreeningRules, $scope.smscScopesList.screeningRules);
        };

        // Screening Rule update method. Makes decision according to the direction for which scope's screening rule will be updated.
        $scope.updateScreeningRule = function (screeningRules, direction) {
            var promises = [];
            var timeoutPromise;

            var callUpdateScreeningRules = function (identifier, scopeKey, value, timeout) {
                return $timeout(function () {
                    promises.push(ScreeningManagerService.updateScreeningRule(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, identifier, scopeKey, value));
                }, timeout);
            };

            var identifier;
            if ($scope.smscScopesList.vasApplication) {
                identifier = ScreeningManagerService.lists.SMSC_PER_APPLICATION_PREFIX_KEY + '-' + $scope.smscScopesList.vasApplication.name;
            } else {
                identifier = ScreeningManagerService.lists.SMSC_GLOBAL_KEY;
            }

            // screeningRules object keeps all three rule separately. In this condition all of them will be updated with their own values.
            if (direction === 'incoming') {
                callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_INCOMING_MSISDN_SCOPE_KEY, screeningRules.MSISDN.value, 100);
                callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_INCOMING_IMSI_SCOPE_KEY, screeningRules.IMSI.value, 200);
                timeoutPromise = callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_INCOMING_MSC_SCOPE_KEY, screeningRules.MSC.value, 300);
            } else if (direction === 'outgoing') {
                callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_OUTGOING_MSISDN_SCOPE_KEY, screeningRules.MSISDN.value, 100);
                callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_OUTGOING_IMSI_SCOPE_KEY, screeningRules.IMSI.value, 200);
                callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_OUTGOING_MSC_SCOPE_KEY, screeningRules.MSC.value, 300);
                timeoutPromise = callUpdateScreeningRules(identifier, ScreeningManagerService.scopes.SMSC_OUTGOING_HLR_SCOPE_KEY, screeningRules.HLR.value, 400);
            }

            AdmPortalMainPromiseTracker.addPromise(timeoutPromise);
            timeoutPromise.then(function () {
                $q.all(promises).then(function (results) {
                    notification({
                        type: 'success',
                        text: $translate.instant('ScreeningLists.Messages.ScreeningRuleUpdatedSuccessfully')
                    });

                    // Copy to original object again to disable save button again.
                    $scope.originalScreeningRules = angular.copy($scope.smscScopesList.screeningRules);

                    $log.debug('Screening Rule updated for smsc ', direction, ' scopes. Result: ', results);
                });
            });
        };

        $scope.cancelScreeningRuleUpdate = function () {
            $scope.smscScopesList.screeningRules.MSISDN = _.findWhere($scope.SCREENING_MANAGER_RULES, {value: $scope.originalScreeningRules.MSISDN.value});
            $scope.smscScopesList.screeningRules.IMSI = _.findWhere($scope.SCREENING_MANAGER_RULES, {value: $scope.originalScreeningRules.IMSI.value});
            $scope.smscScopesList.screeningRules.MSC = _.findWhere($scope.SCREENING_MANAGER_RULES, {value: $scope.originalScreeningRules.MSC.value});
        };

        // Add new item methods and modal window definitions
        $scope.addNewListItem = function ($listObj, direction) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/smsc/screening-lists/smsc-screening-lists.addform.modal.html',
                controller: function ($scope, $uibModalInstance, $translate, SMSC_SCREENING_IDENTIFIERS, scopeSubscriberKey) {
                    $scope.currentList = $listObj.list;

                    var screeningListKey = $listObj.listkey === 'blacklist' ? '"Black List"' : '"White List"';

                    $scope.addFormTitle = $translate.instant('ScreeningLists.AddForm.Title', {listkey: screeningListKey});

                    $scope.scopeSubscriberKey = scopeSubscriberKey;
                    $scope.direction = direction;

                    $scope.SMSC_SCREENING_IDENTIFIERS = SMSC_SCREENING_IDENTIFIERS;
                    if (direction === 'incoming') {
                        // Removing HLR item from the list because of HLR will not be used in the incoming screening lists
                        $scope.SMSC_SCREENING_IDENTIFIERS = _.without($scope.SMSC_SCREENING_IDENTIFIERS, _.findWhere($scope.SMSC_SCREENING_IDENTIFIERS, {value: 'HLR'}));
                    }

                    $scope.listItem = {
                        identifier: $scope.SMSC_SCREENING_IDENTIFIERS[0],
                        scopeSubscriberKey: scopeSubscriberKey
                    };

                    $scope.save = function (listItem) {
                        $uibModalInstance.close(listItem);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    scopeSubscriberKey: function () {
                        return $scope.smscScopesList.scopeSubscriberKey;
                    }
                }
            });

            modalInstance.result.then(function (listItem) {
                var screenableEntry = {
                    screenableEntryId: listItem.screenableEntryId,
                    screenableCorrelator: listItem.screenableCorrelator
                };

                // Concat direction and identifier value to creating scopeKey.
                var scopeKey = direction + '_' + listItem.identifier.value.toLowerCase();

                ScreeningManagerService.addNewListItem(ScreeningManagerService.scopes.SMSC_SCOPE_KEY, listItem.scopeSubscriberKey, scopeKey, $listObj.listkey, screenableEntry).then(function (response) {
                    if (!_.isUndefined(response) && !_.isUndefined(response.errorCode)) {
                        var text = '';
                        if (response.errorCode === ScreeningManagerService.errorCodes.QUOTA_ERROR) {
                            // If maximum list member quota is exceeded show a quota information notification.
                            text = $translate.instant('ScreeningLists.Messages.QuotaExceeded', {
                                value: listItem.screenableEntryId,
                                count: $listObj.list.length
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

                        listItem['identifier'] = listItem.identifier;
                        listItem['scopeSubscriberKey'] = listItem.scopeSubscriberKey;
                        listItem['scopeKey'] = scopeKey;

                        $listObj.list.push(listItem);
                        $listObj.tableParams.reload();

                        $log.debug('A new item [', listItem.screenableEntryId, ', ', listItem.screenableCorrelator, '] added to ' + $listObj.listkey + ' list.');
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }, function () {
                // Dismissed
            });
        };

    });

})();
