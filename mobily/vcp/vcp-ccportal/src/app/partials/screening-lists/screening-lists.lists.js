(function () {

    'use strict';

    angular.module('ccportal.screening-lists.lists', []);

    var ScreeningListsListsModule = angular.module('ccportal.screening-lists.lists');

    // Screening List Black/White Lists Controller
    ScreeningListsListsModule.controller('ScreeningListsListsCtrl', function ($scope, $rootScope, $log, $uibModal, $filter, UtilService, NgTableParams, NgTableService, ScreeningManagerService, $translate, notification, scopeKey, currentScope) {
        var msisdn = UtilService.getSubscriberMsisdn();

        if (currentScope && currentScope.error_message) {
            $scope.$parent.$parent.error_message = currentScope.error_message;
            return;
        }

        if (_.isUndefined(currentScope) || _.isUndefined(currentScope.screeningScope)) {
            $scope.initializeScreeningManagerScope(currentScope);
            return;
        }

        $scope.currentScope = currentScope;

        // White list of current scope definitions
        $scope.whiteList = {
            list: $scope.currentScope.screeningScope.whiteList,
            tableParams: {},
            listkey: 'whitelist'
        };
        $scope.filterWhiteList = _.debounce(function (filterText, filterColumns) {
            $scope.whiteList.tableParams.settings().$scope.filterText = filterText;
            $scope.whiteList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.whiteList.tableParams.reload();
        }, 500);
        $scope.whiteList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "screenableEntryId": 'asc'
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
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - White list definitions

        // Black list of current scope definitions
        $scope.blackList = {
            list: $scope.currentScope.screeningScope.blackList,
            tableParams: {},
            listkey: 'blacklist'
        };
        $scope.filterBlackList = _.debounce(function (filterText, filterColumns) {
            $scope.blackList.tableParams.settings().$scope.filterText = filterText;
            $scope.blackList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.blackList.tableParams.reload();
        }, 500);
        $scope.blackList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "screenableEntryId": 'asc'
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
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Black list definitions

        // Delete methods and modal window definitions
        var deleteListItem = function ($listObj, screenableEntryId) {
            var modalInstance = $uibModal.open({
                templateUrl: 'smListDeleteConfirmationModalContent.html',
                controller: function ($scope, $uibModalInstance, $translate, screenableEntryId, $sce) {
                    var message = $translate.instant('ScreeningLists.Messages.DeleteConfirmationMessage', {phone_number: screenableEntryId});
                    $scope.cancelConfirmationMessage = $sce.trustAsHtml(message);
                    $scope.yes = function () {
                        $uibModalInstance.close();
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    screenableEntryId: function () {
                        return screenableEntryId;
                    }
                }
            });
            modalInstance.result.then(function () {
                ScreeningManagerService.deleteListItem(scopeKey, $listObj, msisdn, screenableEntryId).then(function (response) {
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
                        var deletedListItem = _.findWhere($listObj.list, {screenableEntryId: screenableEntryId});
                        $listObj.list = _.without($listObj.list, deletedListItem);
                        $listObj.tableParams.reload();

                        $log.debug('Item with this id ', deletedListItem.screenableEntryId, ', ', deletedListItem.screenableCorrelator, ' has been deleted successfully.');

                        notification({
                            type: 'success',
                            text: $translate.instant('ScreeningLists.Messages.DeletedSuccessfully', {phone_number: screenableEntryId})
                        });
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }, function () {
                // Dismissed
            });
        };

        $scope.deleteWhiteListItem = function (screenableEntryId) {
            deleteListItem($scope.whiteList, screenableEntryId);
        };

        $scope.deleteBlackListItem = function (screenableEntryId) {
            deleteListItem($scope.blackList, screenableEntryId);
        };

        // Add new item methods and modal window definitions
        var addNewListItem = function ($listObj) {
            var modalInstance = $uibModal.open({
                templateUrl: 'smListAddFormModalContent.html',
                controller: function ($scope, $uibModalInstance, $translate) {
                    $scope.currentList = $listObj.list;
                    $scope.currentMsisdn = msisdn;
                    $scope.addFormTitle = $translate.instant('ScreeningLists.AddForm.Title', {listkey: $listObj.listkey});
                    $scope.save = function (listItem) {
                        $uibModalInstance.close(listItem);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });
            modalInstance.result.then(function (listItem) {
                ScreeningManagerService.addNewListItem(scopeKey, $listObj, msisdn, listItem).then(function (response) {
                    var opSucceeded = true;
                    if (!_.isUndefined(response)) {
                        if (response.errorCode === ScreeningManagerService.errorCodes.QUOTA_ERROR) {
                            opSucceeded = false;
                            // If maximum list member quota is exceeded show a quota information notification.
                            notification({
                                type: 'warning',
                                text: $translate.instant('ScreeningLists.Messages.QuotaExceeded', {
                                    msisdn: listItem.screenableEntryId,
                                    count: $listObj.list.length
                                })
                            });
                        } else if (response.errorCode === ScreeningManagerService.errorCodes.WRONG_REQUEST_ERROR) {
                            opSucceeded = false;
                            // If subscribe number is invalid
                            notification({
                                type: 'warning',
                                text: $translate.instant('ScreeningLists.Messages.SubscriberNumberInvalid', {msisdn: listItem.screenableEntryId})
                            });
                        } else if (!_.isUndefined(response.errorCode)) {
                            opSucceeded = false;
                            // If there are some other type errors
                            notification({
                                type: 'warning',
                                text: response.errorCode + ' - ' + response.message
                            });
                        }
                    }

                    if (opSucceeded) {
                        $listObj.list.splice(0, 0, listItem);
                        $listObj.tableParams.reload();
                        $log.debug('A new item [', listItem.screenableEntryId, ', ', listItem.screenableCorrelator, '] added to ' + $listObj.listkey + ' list.');

                        notification({
                            type: 'success',
                            text: $translate.instant('ScreeningLists.Messages.AddedSuccessfully', {phone_number: listItem.screenableEntryId})
                        });
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }, function () {
                // Dismissed
            });
        };

        $scope.addNewWhiteListItem = function () {
            addNewListItem($scope.whiteList);
        };

        $scope.addNewBlackListItem = function () {
            addNewListItem($scope.blackList);
        };

    });

})();
