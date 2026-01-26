(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.moinboundoutboundroamer', [
        'adminportal.products.antispamsms.operations.screenings.moinboundoutboundroamer.smscgt'
    ]);

    var AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerModule = angular.module('adminportal.products.antispamsms.operations.screenings.moinboundoutboundroamer');

    AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.moinboundoutboundroamer', {
            url: "/moinboundoutboundroamer",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.moinboundoutboundroamer.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.moinboundoutboundroamer.html",
            controller: "AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                moInboundOutboundRoamerList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMOInboundOutboundRoamerFilteringList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerModule.controller('AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                    SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, moInboundOutboundRoamerList) {
        $log.debug('AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerCtrl');

        var inclusionList = moInboundOutboundRoamerList ? moInboundOutboundRoamerList : [];
        inclusionList = $filter('orderBy')(inclusionList, 'prefix');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'prefix',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.E164Prefix'
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

        // MO Inbound Outbound Roamer White List list
        $scope.whiteList = {
            list: inclusionList,
            tableParams: {}
        };

        $scope.whiteList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "prefix": 'asc'
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
        // END - MO Inbound Outbound Roamer White List list

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
                $log.debug('Removing MO Inbound Outbound Roamer filtering entry: ', entry);

                SMSAntiSpamConfigService.deleteMOInboundOutboundRoamerFilteringListEntry(entry.prefix).then(function (response) {
                    $log.debug('Removed MO Inbound Outbound Roamer filtering entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.whiteList.list, {
                        prefix: entry.prefix
                    });
                    $scope.whiteList.list = _.without($scope.whiteList.list, deletedListItem);

                    $scope.whiteList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete MO Inbound Outbound Roamer filtering entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/screenings/operations.screenings.moinboundoutboundroamer.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerDetailCtrl',
                resolve: {
                    moInboundOutboundRoamerList: function () {
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
                    prefix: entry.prefix
                });
                updatedListItem.status = entry.status;

                $scope.whiteList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };

        $scope.setSMSCSGT = function (entry) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/screenings/operations.screenings.moinboundoutboundroamer.smscgt.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerSMSCGTCtrl',
                size: 'lg',
                resolve: {
                    smscGTList: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getMOInboundOutboundRoamerFilteringSMSCGTList(entry.prefix);
                    },
                    entry: function () {
                        return entry;
                    }
                }
            });
        };
    });

    AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerModule.controller('AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, STATES,
                                                                                                                                                          moInboundOutboundRoamerList, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsMOInboundOutboundRoamerDetailCtrl');

        $scope.moInboundOutboundRoamerList = moInboundOutboundRoamerList;

        $scope.STATES = STATES;

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.MOInboundOutboundRoamer.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                prefix: entry.prefix,
                status: entry.status ? $scope.STATES[0] : $scope.STATES[1]
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.MOInboundOutboundRoamer.AddNewEntryModalTitle';

            $scope.entry = {
                status: $scope.STATES[0]
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.prefix', function (newVal) {
                if (newVal) {
                    var foundItem = _.find($scope.moInboundOutboundRoamerList, function (item) {
                        return String(item.prefix) === String(newVal);
                    });

                    $scope.form.prefix.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createMOInboundOutboundRoamerFilteringListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateMOInboundOutboundRoamerFilteringListEntry(entryItem);
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
                entryItem.prefix = $scope.originalEntry.prefix;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add MO Inbound Outbound Roamer entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added MO Inbound Outbound Roamer entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add MO Inbound Outbound Roamer entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
