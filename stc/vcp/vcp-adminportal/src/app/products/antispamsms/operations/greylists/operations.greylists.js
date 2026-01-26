(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.greylists', [
        "adminportal.products.antispamsms.operations.greylists.moinboundroamer",
        "adminportal.products.antispamsms.operations.greylists.mooutboundroamer",
        "adminportal.products.antispamsms.operations.greylists.moantispoofing",
        "adminportal.products.antispamsms.operations.greylists.mt"
    ]);

    var AntiSpamSMSOperationsGreyListsModule = angular.module('adminportal.products.antispamsms.operations.greylists');

    AntiSpamSMSOperationsGreyListsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.greylists', {
            abstract: true,
            url: "/greylists",
            template: '<div ui-view></div>'
        });

    });

    AntiSpamSMSOperationsGreyListsModule.controller('AntiSpamSMSOperationsGreyListsCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                    SMSAntiSpamConfigService, key, entryList) {
        $log.debug('AntiSpamSMSOperationsGreyListsCtrl');

        $scope.key = key;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'prefix',
                    headerKey: 'Products.AntiSpamSMS.Operations.GreyLists.TableColumns.E164Prefix'
                },
                {
                    fieldName: 'sensitivity',
                    headerKey: 'Products.AntiSpamSMS.Operations.GreyLists.TableColumns.ComparisonSensitivity',
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State',
                    filter: {name: 'StatusTypeFilter'}
                }
            ]
        };

        if (!$scope.sensitivityAvailable) {
            $scope.exportOptions.columns = _.reject($scope.exportOptions.columns, function (c) {
                return c.fieldName === 'sensitivity';
            });
        }

        // Grey Lists list
        $scope.greyLists = {
            list: entryList ? entryList : [],
            tableParams: {}
        };

        $scope.greyLists.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "prefix": 'asc'
            }
        }, {
            total: $scope.greyLists.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.greyLists.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.greyLists.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Grey Lists list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.greyLists.tableParams.settings().$scope.filterText = filterText;
            $scope.greyLists.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.greyLists.tableParams.page(1);
            $scope.greyLists.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing grey list entry: ', entry);

                SMSAntiSpamConfigService.deleteGreyListEntry(key, entry.prefix).then(function (response) {
                    $log.debug('Removed grey list entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.greyLists.list, {prefix: entry.prefix});
                    $scope.greyLists.list = _.without($scope.greyLists.list, deletedListItem);

                    $scope.greyLists.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete grey list entry: ', entry, ', response: ', response);
                });
            });
        };
    });

    AntiSpamSMSOperationsGreyListsModule.controller('AntiSpamSMSOperationsGreyListsNewEntryCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMSAntiSpamConfigService, key) {
        $scope.STATES = STATES;

        $scope.entry = {
            status: $scope.STATES[0]
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.status = (entryItem.status === $scope.STATES[0]);

            SMSAntiSpamConfigService.createGreyListEntry(key, entryItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add grey list entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.GreyLists.Messages.EntryAlreadyDefinedError', {prefix: entryItem.prefix})
                    });
                } else {
                    $log.debug('Added grey list entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add grey list entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    AntiSpamSMSOperationsGreyListsModule.controller('AntiSpamSMSOperationsGreyListsUpdateEntryCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMSAntiSpamConfigService, key, entry) {
        $scope.STATES = STATES;

        $scope.entry = entry;
        $scope.entry.id = $scope.entry.prefix;
        $scope.entry.status = ($scope.entry.status ? $scope.STATES[0] : $scope.STATES[1]);

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);
            entryItem.status = (entryItem.status === $scope.STATES[0]);
            delete entryItem.id;

            SMSAntiSpamConfigService.updateGreyListEntry(key, entryItem).then(function (response) {
                $log.debug('Updated grey list entry: ', entryItem);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update grey list entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

})();
