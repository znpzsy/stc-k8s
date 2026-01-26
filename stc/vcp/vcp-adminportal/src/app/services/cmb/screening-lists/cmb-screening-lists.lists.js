(function () {

    'use strict';

    angular.module('adminportal.services.cmb.screening-lists.lists', []);

    var CMBScreeningListsListsModule = angular.module('adminportal.services.cmb.screening-lists.lists');

    // Screening List Black List Controller
    CMBScreeningListsListsModule.controller('CMBScreeningListsListsCtrl', function ($scope, $rootScope, $q, $log, $timeout, $uibModal, $filter, UtilService, NgTableParams, NgTableService,
                                                                                    ScreeningManagerService, AdmPortalMainPromiseTracker, $translate, notification, cmbScopesList,
                                                                                    SCREENING_MANAGER_RULES, CMBScreeningListsFactory) {
        $scope.cmbScopesList = cmbScopesList;

        $scope.SCREENING_MANAGER_RULES = _.reject(SCREENING_MANAGER_RULES, function (item) {
            return item.value === 'AcceptWhitelist';
        });

        // Black list of current scope definitions
        $scope.blackList = {
            list: $scope.cmbScopesList.blackList,
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
            count: 5, // count per page
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
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $sce, $controller) {
                    var message = $translate.instant('ScreeningLists.Messages.DeleteConfirmationMessage', {
                        value: item.screenableEntryId,
                        identifier: $translate.instant(item.identifier.label)
                    });

                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {$scope: $scope, $uibModalInstance: $uibModalInstance});
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing screening entry: ', item);

                ScreeningManagerService.deleteListItem(ScreeningManagerService.scopes.COC_SCOPE_KEY, item.scopeSubscriberKey, item.scopeKey, $listObj.listkey, item.screenableEntryId).then(function (response) {
                    $log.debug('Removed screening entry: ', item);

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
            });
        };

        $scope.deleteBlackListItem = function (item) {
            deleteListItem($scope.blackList, item);
        };

        $scope.originalScreeningRules = angular.copy($scope.cmbScopesList.screeningRules);
        $scope.isScreeningRuleConfigurationNotChanged = function () {
            return angular.equals($scope.originalScreeningRules, $scope.cmbScopesList.screeningRules);
        };

        // Screening Rule update method. Makes decision according to the direction for which scope's screening rule will be updated.
        $scope.updateScreeningRule = function (screeningRules, direction) {
            var promises = [];
            var timeoutPromise;

            var callUpdateScreeningRules = function (identifier, scopeKey, value, timeout) {
                return $timeout(function () {
                    promises.push(ScreeningManagerService.updateScreeningRule(ScreeningManagerService.scopes.COC_SCOPE_KEY, identifier, scopeKey, value));
                }, timeout);
            };

            if (direction === 'incoming') {
                timeoutPromise = callUpdateScreeningRules(ScreeningManagerService.lists.CMB_GLOBAL_INCOMING_LIST_KEY, ScreeningManagerService.scopes.GLOBAL_SCOPE_KEY, screeningRules.MSISDN.value, 100);
            } else if (direction === 'outgoing') {
                timeoutPromise = callUpdateScreeningRules(ScreeningManagerService.lists.CMB_GLOBAL_OUTGOING_LIST_KEY, ScreeningManagerService.scopes.GLOBAL_SCOPE_KEY, screeningRules.MSISDN.value, 100);
            }

            AdmPortalMainPromiseTracker.addPromise(timeoutPromise);
            timeoutPromise.then(function () {
                $q.all(promises).then(function (results) {
                    notification({
                        type: 'success',
                        text: $translate.instant('ScreeningLists.Messages.ScreeningRuleUpdatedSuccessfully')
                    });

                    // Copy to original object again to disable save button again.
                    $scope.originalScreeningRules = angular.copy($scope.cmbScopesList.screeningRules);

                    $log.debug('Screening Rule updated for cmb ', direction, ' scopes. Result: ', results);
                });
            });
        };

        $scope.cancelScreeningRuleUpdate = function () {
            $scope.cmbScopesList.screeningRules.MSISDN = _.findWhere($scope.SCREENING_MANAGER_RULES, {value: $scope.originalScreeningRules.MSISDN.value});
        };

        // Add new item methods and modal window definitions
        $scope.addNewListItem = function ($listObj, direction) {
            var modalInstance = $uibModal.open({
                templateUrl: 'services/cmb/screening-lists/cmb-screening-lists.detail.html',
                controller: function ($scope, $uibModalInstance, $translate, CMB_SCREENING_IDENTIFIERS) {
                    $scope.currentList = $listObj.list;

                    $scope.addFormTitle = $translate.instant('ScreeningLists.AddForm.Title', {listkey: '"Black List"'});

                    $scope.CMB_SCREENING_IDENTIFIERS = CMB_SCREENING_IDENTIFIERS;
                    $scope.listItem = {
                        identifier: $scope.CMB_SCREENING_IDENTIFIERS[0]
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

                var identifier = ScreeningManagerService.lists.CMB_GLOBAL_INCOMING_LIST_KEY;
                if (direction === 'outgoing') {
                    identifier = ScreeningManagerService.lists.CMB_GLOBAL_OUTGOING_LIST_KEY;
                }

                var scopeKey = ScreeningManagerService.scopes.GLOBAL_SCOPE_KEY;

                ScreeningManagerService.addNewListItem(ScreeningManagerService.scopes.COC_SCOPE_KEY, identifier, scopeKey, $listObj.listkey, screenableEntry).then(function (response) {
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

                        listItem.scopeSubscriberKey = listItem.identifier.value;
                        listItem.scopeKey = scopeKey;

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
