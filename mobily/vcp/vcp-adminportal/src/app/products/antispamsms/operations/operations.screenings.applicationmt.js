(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.applicationmt', [
        'adminportal.products.antispamsms.operations.screenings.applicationmt.smscgt'
    ]);

    var AntiSpamSMSOperationsScreeningsApplicationMTModule = angular.module('adminportal.products.antispamsms.operations.screenings.applicationmt');

    AntiSpamSMSOperationsScreeningsApplicationMTModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.applicationmt', {
            url: "/applicationmt",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.applicationmt.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.screenings.applicationmt.html",
            controller: "AntiSpamSMSOperationsScreeningsApplicationMTCtrl",
            resolve: {
                applicationMTFilteringList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getApplicationMTFilteringList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsApplicationMTModule.controller('AntiSpamSMSOperationsScreeningsApplicationMTCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, applicationMTFilteringList) {
        $log.debug('AntiSpamSMSOperationsScreeningsApplicationMTCtrl');

        $scope.exclusionList = applicationMTFilteringList.exclusionList ? applicationMTFilteringList.exclusionList : [];
        $scope.exclusionList = $filter('orderBy')($scope.exclusionList, 'senderAddressRangeStart');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'senderAddressRangeStart',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.AddressRangeStart'
                },
                {
                    fieldName: 'senderAddressRangeEnd',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.AddressRangeEnd'
                },
                {
                    fieldName: 'senderAddressType',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.AddressType'
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
        $scope.dataType = 'ALL';

        // Application MT White List list
        $scope.whiteList = {
            list: $scope.exclusionList,
            tableParams: {}
        };

        $scope.whiteList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "senderAddressRangeStart": 'asc'
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
        // END - Application MT White List list

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
                $log.debug('Removing application mt filtering entry: ', entry);

                SMSAntiSpamConfigService.deleteApplicationMTFilteringListEntry(entry.senderAddressRangeStart, entry.senderAddressRangeEnd).then(function (response) {
                    $log.debug('Removed application mt filtering entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.whiteList.list, {
                        senderAddressRangeStart: entry.senderAddressRangeStart,
                        senderAddressRangeEnd: entry.senderAddressRangeEnd
                    });
                    $scope.whiteList.list = _.without($scope.whiteList.list, deletedListItem);
                    $scope.exclusionList = _.without($scope.exclusionList, deletedListItem);

                    $scope.whiteList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete application mt filtering entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.screenings.applicationmt.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsApplicationMTDetailCtrl',
                resolve: {
                    applicationMTFilteringList: function () {
                        return $scope.exclusionList;
                    },
                    entry: function () {
                        return entry;
                    },
                    dataType: function () {
                        return $scope.dataType;
                    }
                }
            });
        };

        $scope.addNewEntry = function () {
            var modalInstance = openDetailModal();

            modalInstance.result.then(function (entry) {
                $scope.exclusionList.push(entry);

                if ($scope.dataType !== 'ALL' && $scope.dataType !== entry.senderAddressType) {
                    $scope.dataType = entry.senderAddressType;
                } else {
                    var dataType = ($scope.dataType === 'ALL' ? 'ALL' : entry.senderAddressType);
                    updateList(dataType);
                }
            }, function () {
                // Ignored
            });
        };

        $scope.updateEntry = function (entry) {
            var modalInstance = openDetailModal(entry);

            modalInstance.result.then(function (entry) {
                var updatedListItem = _.findWhere($scope.whiteList.list, {
                    senderAddressRangeStart: entry.senderAddressRangeStart,
                    senderAddressRangeEnd: entry.senderAddressRangeEnd
                });
                updatedListItem.status = entry.status;

                $scope.whiteList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };

        $scope.setSMSCSGT = function (entry) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.screenings.applicationmt.smscgt.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsApplicationMTSMSCGTCtrl',
                size: 'lg',
                resolve: {
                    smscGTList: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getApplicationMTFilteringSMSCGTList(entry.senderAddressRangeStart, entry.senderAddressRangeEnd);
                    },
                    entry: function () {
                        return entry;
                    }
                }
            });
        };
    });

    AntiSpamSMSOperationsScreeningsApplicationMTModule.controller('AntiSpamSMSOperationsScreeningsApplicationMTDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, STATES,
                                                                                                                                      SMS_ANTISPAM_SENDER_ADDRESS_TYPES, applicationMTFilteringList, dataType, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsApplicationMTDetailCtrl');

        $scope.applicationMTFilteringList = applicationMTFilteringList;

        $scope.STATES = STATES;
        $scope.TYPES = SMS_ANTISPAM_SENDER_ADDRESS_TYPES;

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.ApplicationMT.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                senderAddressRangeStart: entry.senderAddressRangeStart,
                senderAddressRangeEnd: entry.senderAddressRangeEnd,
                senderAddressType: entry.senderAddressType,
                status: entry.status ? $scope.STATES[0] : $scope.STATES[1]
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.ApplicationMT.AddNewEntryModalTitle';

            $scope.entry = {
                senderAddressType: (dataType === 'ALL' ? $scope.TYPES[0] : dataType),
                status: $scope.STATES[0]
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.senderAddressRangeStart', function (newVal) {
                if (!_.isUndefined(newVal) && $scope.entry) {
                    var foundItem = _.find($scope.applicationMTFilteringList, function (item) {
                        return String(item.senderAddressRangeStart) === String(newVal) &&
                            String(item.senderAddressRangeEnd) === String($scope.entry.senderAddressRangeEnd) &&
                            String(item.senderAddressType) === String($scope.entry.senderAddressType);
                    });

                    $scope.form.senderAddressRangeStart.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                    $scope.form.senderAddressRangeEnd.$setValidity('availabilityCheck', true);
                    $scope.form.senderAddressType.$setValidity('availabilityCheck', true);
                }
            });
            $scope.$watch('entry.senderAddressRangeEnd', function (newVal) {
                if (!_.isUndefined(newVal) && $scope.entry) {
                    var foundItem = _.find($scope.applicationMTFilteringList, function (item) {
                        return String(item.senderAddressRangeStart) === String($scope.entry.senderAddressRangeStart) &&
                            String(item.senderAddressRangeEnd) === String(newVal) &&
                            String(item.senderAddressType) === String($scope.entry.senderAddressType);
                    });

                    $scope.form.senderAddressRangeStart.$setValidity('availabilityCheck', true);
                    $scope.form.senderAddressRangeEnd.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                    $scope.form.senderAddressType.$setValidity('availabilityCheck', true);
                }
            });
            $scope.$watch('entry.senderAddressType', function (newVal) {
                if (!_.isUndefined(newVal) && $scope.entry) {
                    var foundItem = _.find($scope.applicationMTFilteringList, function (item) {
                        return String(item.senderAddressRangeStart) === String($scope.entry.senderAddressRangeStart) &&
                            String(item.senderAddressRangeEnd) === String($scope.entry.senderAddressRangeEnd) &&
                            String(item.senderAddressType) === String(newVal);
                    });

                    $scope.form.senderAddressRangeStart.$setValidity('availabilityCheck', true);
                    $scope.form.senderAddressRangeEnd.$setValidity('availabilityCheck', true);
                    $scope.form.senderAddressType.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createApplicationMTFilteringListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateApplicationMTFilteringListEntry(entryItem);
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
                entryItem.senderAddressRangeStart = $scope.originalEntry.senderAddressRangeStart;
                entryItem.senderAddressRangeEnd = $scope.originalEntry.senderAddressRangeEnd;
                entryItem.senderAddressType = $scope.originalEntry.senderAddressType;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add application mt entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.message || response.value
                    });
                } else {
                    $log.debug('Added application mt entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add application mt entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
