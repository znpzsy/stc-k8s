(function () {

    'use strict';

    angular.module('adminportal.services.rbt.screening-lists', []);

    var RbtScreeningListsModule = angular.module('adminportal.services.rbt.screening-lists');

    RbtScreeningListsModule.config(['$stateProvider', function ($stateProvider) {

        $stateProvider
            .state('services.rbt.screening-lists', {
                url: "/screening-lists",
                templateUrl: 'services/rbt/screening-lists/rbt.screening-lists.html',
                controller: 'RbtScreeningListsCommonCtrl',
                data: {
                    pageHeaderKey: 'GenericTabs.ScreeningLists'
                },
                resolve: {
                    screeningLists: function (ScreeningManagerService) {
                        var name = ScreeningManagerService.scopes.RBT_SCOPE_KEY;
                        return ScreeningManagerService.getScreeningListsByServiceName(name);
                    }
                }
            })
            .state('services.rbt.screening-lists.type', {
                abstract: true,
                url: "/type",
                templateUrl: 'services/rbt/screening-lists/rbt.screening-lists.list.html',
            })
            .state('services.rbt.screening-lists.type.incoming', {
                url: "/incoming",
                data: {
                    pageHeaderKey: 'Services.RBT.ScreeningLists.Type.PageHeader',
                    subPageHeaderKey: 'Services.RBT.ScreeningLists.Type.Incoming',
                    screeningScopeId: 'rbt-promotion-incoming',
                    permissions: ['READ_SCREENING_LISTS']
                },
                templateUrl: "partials/simple.abstract.html"
            })
            .state('services.rbt.screening-lists.type.outgoing', {
                url: "/outgoing",
                templateUrl: "partials/simple.abstract.html",
                data: {
                    pageHeaderKey: 'Services.RBT.ScreeningLists.Type.PageHeader',
                    subPageHeaderKey: 'Services.RBT.ScreeningLists.Type.Outgoing',
                    screeningScopeId: 'rbt-promotion-outgoing',
                    permissions: ['READ_SCREENING_LISTS']
                }
            })
            .state('services.rbt.screening-lists.vip', {
                abstract: true,
                url: "/vip",
                templateUrl: 'services/rbt/screening-lists/rbt.screening-lists.list.html'
            })
            .state('services.rbt.screening-lists.vip.incoming', {
                url: "/incoming",
                templateUrl: "partials/simple.abstract.html",
                data: {
                    pageHeaderKey: 'Services.RBT.ScreeningLists.VIP.PageHeader',
                    subPageHeaderKey: 'Services.RBT.ScreeningLists.VIP.Incoming',
                    screeningScopeId: 'rbt-promotion-vip-incoming',
                    permissions: ['RBT_SERVICE_VIP_SCREENINGLISTS_READ']
                }
            })
            .state('services.rbt.screening-lists.vip.outgoing', {
                url: "/outgoing",
                templateUrl: "partials/simple.abstract.html",
                data: {
                    pageHeaderKey: 'Services.RBT.ScreeningLists.VIP.PageHeader',
                    subPageHeaderKey: 'Services.RBT.ScreeningLists.VIP.Outgoing',
                    screeningScopeId: 'rbt-promotion-vip-outgoing',
                    permissions: ['RBT_SERVICE_VIP_SCREENINGLISTS_READ']
                }
            });

    }]);

    RbtScreeningListsModule.controller('RbtScreeningListsCommonCtrl', function ($scope, $state, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService, ScreeningManagerService, screeningLists) {
        $log.debug('RbtScreeningListsCommonCtrl');
        // $log.debug('screeningLists: ', screeningLists);
        // $log.debug('$state.current.data.screeningScopeId: ', $state.current && $state.current.data ? $state.current.data.screeningScopeId : '');
        $scope.msisdn = '';

        $scope.screeningScopeId = $state.current && $state.current.data ? $state.current.data.screeningScopeId : '';
        $scope.screeningScope = {};
        $scope.blacklist = [];

        if (screeningLists && screeningLists.screeningSubscriber && screeningLists.screeningSubscriber.screeningScopes) {
            var screeningScope = screeningLists.screeningSubscriber.screeningScopes.find(function (scope) {
                return scope.screeningScopeId === $scope.screeningScopeId;
            });
            $scope.screeningScope = screeningScope; // Screening Manager Rules
            $scope.blacklist = screeningScope.blackList;
        }

        // Table Data
        $scope.blacklistTblList = {
            list: $scope.blacklist ? $scope.blacklist : [],
            tableParams: {}
        };

        $scope.blacklistTblList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "screenableEntryId": 'asc'
            }
        }, {
            total: $scope.blacklistTblList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.blacklistTblList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.blacklistTblList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        // END - Table Data

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.blacklistTblList.tableParams.settings().$scope.filterText = filterText;
            $scope.blacklistTblList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.blacklistTblList.tableParams.page(1);
            $scope.blacklistTblList.tableParams.reload();
        }, 750);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'screenableEntryId',
                    headerKey: 'ScreeningLists.Identifiers.MSISDN'
                }
            ]
        };

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing msisdn from blacklist: ', entry);
                ScreeningManagerService.deleteListItemV3('rbt', $scope.screeningScopeId, 'blacklist', entry.screenableEntryId).then(function (response) {
                    $log.debug('Removed msisdn from blacklist: ', entry, ', response: ', response);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $state.reload();

                }, function (response) {
                    $log.debug('Cannot delete msisdn from blacklist: ', entry, ', response: ', response);
                });
            });
        };

        var openModal = function (key, pageHeaderKey) {
            return $uibModal.open({
                templateUrl: 'services/rbt/screening-lists/rbt.screening-lists.modal.html',
                controller: function ($scope, $uibModalInstance, key, pageHeaderKey) {
                    $scope.key = key;
                    $scope.pageHeaderKey = pageHeaderKey;
                    $scope.entry = {
                        screenableEntryId: ''
                    };
                    $scope.originalEntry = angular.copy($scope.entry);

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.entry, $scope.originalEntry);
                    };

                    $scope.ok = function () {
                        $uibModalInstance.close($scope.entry);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    // Save entry
                    $scope.save = function (entry) {
                        $log.debug('Adding new list item: ', entry);

                        ScreeningManagerService.addNewListItemV3('rbt', $scope.key, 'blacklist', $scope.entry).then(function (response) {
                            $log.debug('Added new list item ', entry, ', response: ', response);

                            notification({
                                type: 'success',
                                text: $translate.instant('CommonLabels.OperationSuccessful')
                            });
                            $scope.ok();

                        }, function (response) {
                            $log.debug('Cannot add list item: ', entry, ', response: ', response);
                        });

                    };
                },
                resolve: {
                    key: function () {
                        return key;
                    },
                    pageHeaderKey: function () {
                        return pageHeaderKey;
                    }
                }
            });
        };

        $scope.addListEntry = function () {
            var pageHeaderKey = $translate.instant('CommonLabels.AddNewEntry') + ' / ' + $translate.instant($state.current.data.subPageHeaderKey);
            var modalInstance = openModal($scope.screeningScopeId, pageHeaderKey);

            modalInstance.result.then(function (entry) {
                $scope.blacklistTblList.tableParams.reload();
                $state.go($state.$current, null, {reload: true});
            }, function () {
                // Ignored
            });
        };

        $scope.search = function (msisdn) {
            $log.debug('Checking allowance for msisdn: ', msisdn);


            ScreeningManagerService.checkAllowance('rbt', $scope.screeningScopeId, msisdn).then(function (response) {
                $log.debug('Allowance response: ', response);
                if (response && response.allowanceResponse) {
                    if(response.allowanceResponse.allowed){
                        notification({
                            type: 'success',
                            text: $translate.instant('Services.RBT.ScreeningLists.Messages.Success')
                        });
                    } else {
                        var LIST_TYPE = {
                            'rbt-promotion-incoming': 'Services.RBT.ScreeningLists.Type.Incoming',
                            'rbt-promotion-outgoing': 'Services.RBT.ScreeningLists.Type.Outgoing',
                            'rbt-promotion-vip-incoming': 'Services.RBT.ScreeningLists.VIP.Incoming',
                            'rbt-promotion-vip-outgoing': 'Services.RBT.ScreeningLists.VIP.Outgoing'
                        }

                        var listType = response.allowanceResponse.screeningScopeId ? $translate.instant(LIST_TYPE[response.allowanceResponse.screeningScopeId]) : '';

                        notification({
                            type: 'warning',
                            text: $translate.instant('Services.RBT.ScreeningLists.Messages.MsisdnAlreadyDefinedError', {msisdn: msisdn, listType: listType})
                        });
                    }
                } else {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                }
            }, function (error) {
                $log.debug('Error: ', error);
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        }
    });

})();
