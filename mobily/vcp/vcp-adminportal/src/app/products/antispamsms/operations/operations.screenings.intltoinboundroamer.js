(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.intltoinboundroamer', []);

    var AntiSpamSMSOperationsScreeningsIntlToInboundRoamerModule = angular.module('adminportal.products.antispamsms.operations.screenings.intltoinboundroamer');

    AntiSpamSMSOperationsScreeningsIntlToInboundRoamerModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.intltoinboundroamer', {
            url: "/intltoinboundroamer",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.intltoinboundroamer.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.screenings.intltoinboundroamer.html",
            controller: "AntiSpamSMSOperationsScreeningsIntlToInboundRoamerCtrl",
            resolve: {
                intlToInboundRoamerList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getIntToInboundList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsIntlToInboundRoamerModule.controller('AntiSpamSMSOperationsScreeningsIntlToInboundRoamerCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                            SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, intlToInboundRoamerList) {
        $log.debug('AntiSpamSMSOperationsScreeningsIntlToInboundRoamerCtrl');

        $scope.exclusionList = intlToInboundRoamerList.allIntToInboundRoamerExclusions ? intlToInboundRoamerList.allIntToInboundRoamerExclusions : [];
        $scope.exclusionList = $filter('orderBy')($scope.exclusionList, 'number');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'number',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.Number'
                },
                {
                    fieldName: 'type',
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

        $scope.screeningRule = $scope.SCREENING_MANAGER_RULES[3].value;
        $scope.dataType = 'ALL';

        // Application MT Black List
        $scope.blackList = {
            list: $scope.exclusionList,
            tableParams: {}
        };

        $scope.blackList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "number": 'asc'
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
        // END - Application MT Black List

        $scope.filterBlackList = _.debounce(function (filterText, filterColumns) {
            $scope.blackList.tableParams.settings().$scope.filterText = filterText;
            $scope.blackList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.blackList.tableParams.page(1);
            $scope.blackList.tableParams.reload();
        }, 750);

        var updateList = function (dataType) {
            if (dataType === 'ALL') {
                $scope.blackList.list = $scope.exclusionList;
            } else {
                $scope.blackList.list = _.where($scope.exclusionList, {"type": dataType});
            }

            $scope.blackList.tableParams.page(1);
            $scope.blackList.tableParams.reload();
        }

        // this watcher listens the buttons for filtering records by type according to selection. 
        $scope.$watch('dataType', updateList);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing intl to inbound roamer filtering entry: ', entry);

                SMSAntiSpamConfigService.deleteIntToInboundListEntry(entry.number, entry.type).then(function (response) {
                    $log.debug('Removed intl to inbound roamer filtering entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.blackList.list, {
                        number: entry.number,
                        type: entry.type
                    });
                    $scope.blackList.list = _.without($scope.blackList.list, deletedListItem);
                    $scope.exclusionList = _.without($scope.exclusionList, deletedListItem);

                    $scope.blackList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete intl to inbound roamer filtering entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.screenings.intltoinboundroamer.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsIntlToInboundRoamerDetailCtrl',
                resolve: {
                    intlToInboundRoamerList: function () {
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

                if ($scope.dataType !== 'ALL' && $scope.dataType !== entry.type) {
                    $scope.dataType = entry.type;
                } else {
                    var dataType = ($scope.dataType === 'ALL' ? 'ALL' : entry.type);
                    updateList(dataType);
                }
            }, function () {
                // Ignored
            });
        };

        $scope.updateEntry = function (entry) {
            var modalInstance = openDetailModal(entry);

            modalInstance.result.then(function (entry) {
                var updatedListItem = _.findWhere($scope.blackList.list, {
                    number: entry.number,
                    type: entry.type
                });
                updatedListItem.status = entry.status;

                $scope.blackList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };
    });

    AntiSpamSMSOperationsScreeningsIntlToInboundRoamerModule.controller('AntiSpamSMSOperationsScreeningsIntlToInboundRoamerDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, STATES,
                                                                                                                                                  SMS_ANTISPAM_INT_TO_INBOUND_TYPES, intlToInboundRoamerList, dataType, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsIntlToInboundRoamerDetailCtrl');

        $scope.intlToInboundRoamerList = intlToInboundRoamerList;

        $scope.STATES = STATES;
        $scope.TYPES = SMS_ANTISPAM_INT_TO_INBOUND_TYPES;

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.IntlToInboundRoamer.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                number: entry.number,
                type: entry.type,
                status: entry.status ? $scope.STATES[0] : $scope.STATES[1]
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.IntlToInboundRoamer.AddNewEntryModalTitle';

            $scope.entry = {
                type: (dataType === 'ALL' ? $scope.TYPES[0] : dataType),
                status: $scope.STATES[0]
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.number', function (newVal) {
                if (!_.isUndefined(newVal) && $scope.entry) {
                    var foundItem = _.find($scope.intlToInboundRoamerList, function (item) {
                        return (String(item.number) === String(newVal) && String(item.type) === String($scope.entry.type));
                    });

                    $scope.form.number.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                    $scope.form.type.$setValidity('availabilityCheck', true);
                }
            });
            $scope.$watch('entry.type', function (newVal) {
                if (!_.isUndefined(newVal) && $scope.entry) {
                    var foundItem = _.find($scope.intlToInboundRoamerList, function (item) {
                        return (String(item.number) === String($scope.entry.number) && String(item.type) === String(newVal));
                    });

                    $scope.form.number.$setValidity('availabilityCheck', true);
                    $scope.form.type.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createIntToInboundListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateIntToInboundListEntry(entryItem);
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
                entryItem.number = $scope.originalEntry.number;
                entryItem.type = $scope.originalEntry.type;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add intl to inbound roamer filtering entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added intl to inbound roamer filtering entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add intl to inbound roamer filtering entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
