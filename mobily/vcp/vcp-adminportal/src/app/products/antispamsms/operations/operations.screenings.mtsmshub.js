(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.mtsmshub', []);

    var AntiSpamSMSOperationsScreeningsMTSMSHubModule = angular.module('adminportal.products.antispamsms.operations.screenings.mtsmshub');

    AntiSpamSMSOperationsScreeningsMTSMSHubModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.mtsmshub', {
            url: "/mtsmshub",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.mtsmshub.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.screenings.mtsmshub.html",
            controller: "AntiSpamSMSOperationsScreeningsMTSMSHubCtrl",
            resolve: {
                mtSMSHubList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMTSMSHubFilteringList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsMTSMSHubModule.controller('AntiSpamSMSOperationsScreeningsMTSMSHubCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                      SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, mtSMSHubList) {
        $log.debug('AntiSpamSMSOperationsScreeningsMTSMSHubCtrl');

        var inclusionList = mtSMSHubList ? mtSMSHubList : [];
        inclusionList = $filter('orderBy')(inclusionList, 'gt');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'gt',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.SMSHubGT'
                },
                {
                    fieldName: 'status',
                    headerKey: 'CommonLabels.State',
                    filter: {name: 'StatusTypeFilter'}
                }
            ]
        };

        $scope.SCREENING_MANAGER_RULES = SCREENING_MANAGER_RULES;

        $scope.screeningRule = $scope.SCREENING_MANAGER_RULES[1].value;

        // MT SMS Hub White List list
        $scope.whiteList = {
            list: inclusionList,
            tableParams: {}
        };

        $scope.whiteList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "gt": 'asc'
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
        // END - MT SMS Hub White List list

        $scope.filterWhiteList = _.debounce(function (filterText, filterColumns) {
            $scope.whiteList.tableParams.settings().$scope.filterText = filterText;
            $scope.whiteList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.whiteList.tableParams.page(1);
            $scope.whiteList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing mt sms hub filtering entry: ', entry);

                SMSAntiSpamConfigService.deleteMTSMSHubFilteringListEntry(entry.gt).then(function (response) {
                    $log.debug('Removed mt sms hub filtering entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.whiteList.list, {
                        gt: entry.gt
                    });
                    $scope.whiteList.list = _.without($scope.whiteList.list, deletedListItem);

                    $scope.whiteList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete mt sms hub filtering entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.screenings.mtsmshub.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsMTSMSHubDetailCtrl',
                resolve: {
                    mtSMSHubList: function () {
                        return inclusionList;
                    },
                    entry: function () {
                        return entry;
                    }
                }
            });
        };

        $scope.addNewEntry = function () {
            var modalInstance = openDetailModal();

            modalInstance.result.then(function (entry) {
                $scope.whiteList.list.push(entry);

                $scope.whiteList.tableParams.page(1);
                $scope.whiteList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };

        $scope.updateEntry = function (entry) {
            var modalInstance = openDetailModal(entry);

            modalInstance.result.then(function (entry) {
                var updatedListItem = _.findWhere($scope.whiteList.list, {
                    gt: entry.gt
                });
                updatedListItem.status = entry.status;

                $scope.whiteList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };
    });

    AntiSpamSMSOperationsScreeningsMTSMSHubModule.controller('AntiSpamSMSOperationsScreeningsMTSMSHubDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, STATES,
                                                                                                                            mtSMSHubList, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsMTSMSHubDetailCtrl');

        $scope.mtSMSHubList = mtSMSHubList;

        $scope.STATES = STATES;

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.MTSMSHub.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                gt: entry.gt,
                status: entry.status ? $scope.STATES[0] : $scope.STATES[1]
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.MTSMSHub.AddNewEntryModalTitle';

            $scope.entry = {
                status: $scope.STATES[0]
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.gt', function (newVal) {
                if (newVal) {
                    var foundItem = _.find($scope.mtSMSHubList, function (item) {
                        return (String(item.gt) === String(newVal));
                    });

                    $scope.form.gt.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createMTSMSHubFilteringListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateMTSMSHubFilteringListEntry(entryItem);
        };

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var isCreate = _.isUndefined(entry.id);
            var entryItem = angular.copy(entry);
            entryItem.status = (entryItem.status === $scope.STATES[0]);

            if (!isCreate) {
                delete entryItem.id;
                entryItem.gt = $scope.originalEntry.gt;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add mt sms hub filtering entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added mt sms hub filtering entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add mt sms hub filtering entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
    