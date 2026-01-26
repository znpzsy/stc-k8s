(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.antispamlists', []);

    var AntiSpamSMSOperationsAntispamListsModule = angular.module('adminportal.products.antispamsms.operations.antispamlists');

    AntiSpamSMSOperationsAntispamListsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.antispamlists', {
            url: "/aslists",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.antispamlists.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/antispamlists/operations.antispamlists.html",
            controller: 'AntiSpamSMSOperationsAntispamlistsCtrl',
            resolve: {
                antispamlists: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getAntispamLists();
                }
            },
            data: {
                permissions: [
                    'READ_ANTISPAM_ANTISPAMLISTS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.antispamlists.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/antispamlists/operations.antispamlists.detail.html",
            controller: 'AntiSpamSMSOperationsAntispamlistsNewCtrl',
            data: {
            permissions: [
                'CREATE_ANTISPAM_ANTISPAMLISTS_OPERATIONS'
            ]
        }
        }).state('products.antispamsms.operations.antispamlists.update', {
            url: "/update/:listId",
            templateUrl: "products/antispamsms/operations/antispamlists/operations.antispamlists.detail.html",
            controller: 'AntiSpamSMSOperationsAntispamlistsUpdateCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_ANTISPAMLISTS_OPERATIONS' // Let read-only mode
                ]
            },
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getAntispamListEntryWithPagination($stateParams.listId, 50, 0);

                },
                listTotalCount: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getAntispamListEntryListCount($stateParams.listId);
                }
            }
        });

    });

    AntiSpamSMSOperationsAntispamListsModule.controller('AntiSpamSMSOperationsAntispamListsCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsAntispamListsCommonCtrl');

        $scope.listState = "products.antispamsms.operations.antispamlists.list";
        $scope.newState = "products.antispamsms.operations.antispamlists.new";
        $scope.updateState = "products.antispamsms.operations.antispamlists.update";

        $scope.populatedResults = false;
    });

    AntiSpamSMSOperationsAntispamListsModule.controller('AntiSpamSMSOperationsAntispamlistsCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                      SMSAntiSpamConfigService, Restangular, antispamlists) {
        $log.debug('AntiSpamSMSOperationsAntispamlistsCtrl');

        $controller('AntiSpamSMSOperationsAntispamListsCommonCtrl', {$scope: $scope});

        $scope.entry = {};

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'listId',
                    headerKey: 'Products.AntiSpamSMS.Operations.AntispamLists.TableColumns.ListID'
                },
                {
                    fieldName: 'listName',
                    headerKey: 'Products.AntiSpamSMS.Operations.AntispamLists.TableColumns.ListName'
                },
                {
                    fieldName: 'listDescription',
                    headerKey: 'Products.AntiSpamSMS.Operations.AntispamLists.TableColumns.ListDescription'
                }
            ]
        };

        // Antispamlist
        $scope.antispamlists = {
            list: antispamlists,
            tableParams: {}
        };


        $scope.antispamlists.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "created": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.antispamlists.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.antispamlists.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Antispamlist  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.antispamlists.tableParams.settings().$scope.filterText = filterText;
            $scope.antispamlists.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.antispamlists.tableParams.page(1);
            $scope.antispamlists.tableParams.reload();
        }, 500);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Antispamlist  entry: ', entry);

                SMSAntiSpamConfigService.deleteAntispamListEntry(entry.listId).then(function (response) {
                    $log.debug('Removed Antispamlist  entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.antispamlists.list, {listId: entry.listId});
                    $scope.antispamlists.list = _.without($scope.antispamlists.list, deletedListItem);

                    $scope.antispamlists.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Antispamlist  entry: ', entry, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                });
            });
        };

        // $scope.search = function(ext){
        //     if (ext) {
        //         SMSAntiSpamConfigService.getAntispamLists(ext).then(function (response) {
        //             $log.debug('Success. Response: ', response);
        //             if(response && response.message && response.value){
        //                 var message = $translate.instant('CommonMessages.GenericServerError') + '\n' + response.value + ' - ' + response.message;
        //                 notification({
        //                     type: 'warning',
        //                     text: message
        //                 });
        //             }
        //
        //             var apiResponse = Restangular.stripRestangular(response);
        //
        //             $scope.antispamlists.list = apiResponse;
        //             $scope.populatedResults = true;
        //
        //             $scope.antispamlists.tableParams.page(1);
        //             $scope.antispamlists.tableParams.reload();
        //
        //         }, function (response) {
        //             $log.debug('Cannot read screenings. Error: ', response);
        //             $scope.populatedResults = false;
        //         });
        //     }
        // }


    });

    AntiSpamSMSOperationsAntispamListsModule.controller('AntiSpamSMSOperationsAntispamlistsNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService) {
        $controller('AntiSpamSMSOperationsAntispamListsCommonCtrl', {$scope: $scope});
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.AntispamLists.Create";
        $scope.isUpdate = false;
        $scope.entry = {
            listName: '',
            listDescription: '',
            list: ''
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createAntispamListEntry(entryItem).then(function (response) {
                $log.debug('Cannot add Antispamlist entry: ', entryItem, ', response: ', response);
                if (response && response.status !== 200) {
                    $log.debug('Cannot add Antispamlist entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });
                } else {
                    $log.debug('Added Antispamlist entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add Antispamlist entry: ', entryItem, ', response: ', response);

                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    AntiSpamSMSOperationsAntispamListsModule.controller('AntiSpamSMSOperationsAntispamlistsUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService, entry, listTotalCount) {
        $controller('AntiSpamSMSOperationsAntispamListsCommonCtrl', {$scope: $scope});
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.AntispamLists.Update";

        $scope.Math = Math;
        $scope.entry = entry;
        $scope.listTotalCount = listTotalCount.count;
        $scope.isUpdate = true;

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.pager = {
            page: 1,
            inputPage: 1, // input model
            count: 50,     // page size
            total: $scope.listTotalCount
        };

        // watch numeric entry user input, trigger navigation if changed
        $scope.$watch('pager.inputPage', function (newVal, oldVal) {
            if (newVal === oldVal) return;
            if (newVal == null || newVal === '') return;
            var p = Number(newVal);
            if (isNaN(p)) return;

            var maxPage = Math.max(1, Math.ceil($scope.pager.total / $scope.pager.count));
            var target;
            if (!angular.isNumber(p) || isNaN(p)) {
                target = $scope.pager.page;
            } else {
                target = Math.min(Math.max(1, p), maxPage);
            }

            if (target !== $scope.pager.page) {
                $scope.setPage(target);
            }
        });

        function getPageData(page, count) {
            SMSAntiSpamConfigService.getAntispamListEntryWithPagination($scope.entry.listId, count, (page - 1) * count).then(function (response) {

                if (response) {
                    if (response.message && response.value) {
                        $scope.entry = {};
                        var message = $translate.instant('CommonMessages.GenericServerError') + '\n' + response.value + ' - ' + response.message;
                        notification({
                            type: 'warning',
                            text: message
                        });
                    } else {
                        $scope.entry = response;
                        $scope.originalEntry = angular.copy($scope.entry);
                    }
                }


            }, function (response) {
                $log.debug('Cannot read screenings. Error: ', response);
            });
        }

        $scope.setPage = function (p) {
            //$log.debug('Changed page: ' + p, ' (current: ' + $scope.pager.page + ')', ' --- pager: ', $scope.pager);
            if (p < 1) {
                return;
            }
            var maxPage = Math.max(1, Math.ceil($scope.pager.total / $scope.pager.count));
            if (p > maxPage) {
                $scope.pager.page = 1; p = 1;
            }
            $scope.pager.page = p;
            $scope.pager.inputPage = $scope.pager.page;
            getPageData(p, $scope.pager.count);
        };

        $scope.nextPage = function () { $scope.setPage($scope.pager.page + 1); };
        $scope.prevPage = function () { $scope.setPage($scope.pager.page - 1); };

        $scope.changePageSize = function () {
            $scope.setPage(1);
            var firstIndex = ($scope.pager.page - 1) * $scope.pager.count;
            $scope.pager.page = Math.floor(firstIndex / $scope.pager.count) + 1;
            getPageData($scope.pager.page, $scope.pager.count);
        };

        $scope.save = function (entry) {

            SMSAntiSpamConfigService.updateAntispamListEntryWithPagination(entry, $scope.pager.count, ($scope.pager.page - 1) * $scope.pager.count).then(function (response) {
                if(response && response.value == "GENERAL_ERROR") {
                    $log.debug('Cannot Update Antispamlist entry: ', response.value);
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });

                } else {
                    $log.debug('Updated Antispamlist entry: ', entry);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot update Antispamlist entry: ', entry, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });


})();
