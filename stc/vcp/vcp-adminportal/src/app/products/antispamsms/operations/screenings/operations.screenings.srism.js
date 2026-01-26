(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.srism', []);

    var AntiSpamSMSOperationsScreeningsSRISMModule = angular.module('adminportal.products.antispamsms.operations.screenings.srism');

    AntiSpamSMSOperationsScreeningsSRISMModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.srism', {
            url: "/srism",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.srism.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/screenings/operations.screenings.srism.html",
            controller: "AntiSpamSMSOperationsScreeningsSRISMCtrl",
            data: {
                permissions: [
                    'READ_ANTISPAM_SCREENINGLISTS_OPERATIONS'
                ]
            },
            resolve: {
                sriSMList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSRISMFilteringList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsSRISMModule.controller('AntiSpamSMSOperationsScreeningsSRISMCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, sriSMList) {
        $log.debug('AntiSpamSMSOperationsScreeningsSRISMCtrl');

        var exclusionList = sriSMList.allSriFsmEntries ? sriSMList.allSriFsmEntries : [];
        exclusionList = $filter('orderBy')(exclusionList, 'msisdnPrefix');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'msisdnPrefix',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.E164Prefix'
                },
                {
                    fieldName: 'typeOfNumber',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.TypeOfNumber'
                },
                {
                    fieldName: 'rejectMethod',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.RejectMethod'
                },
                {
                    fieldName: 'rejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.RejectErrorCode'
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

        // SRI SM Black List list
        $scope.blackList = {
            list: exclusionList,
            tableParams: {}
        };

        $scope.blackList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "msisdnPrefix": 'asc'
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
        // END - SRI SM Black List list

        $scope.filterBlackList = _.debounce(function (filterText, filterColumns) {
            $scope.blackList.tableParams.settings().$scope.filterText = filterText;
            $scope.blackList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.blackList.tableParams.page(1);
            $scope.blackList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing sri-sm filtering entry: ', entry);

                SMSAntiSpamConfigService.deleteSRISMFilteringListEntry(entry.msisdnPrefix).then(function (response) {
                    $log.debug('Removed sri-sm filtering entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.blackList.list, {
                        msisdnPrefix: entry.msisdnPrefix
                    });
                    $scope.blackList.list = _.without($scope.blackList.list, deletedListItem);

                    $scope.blackList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete sri-sm filtering entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/screenings/operations.screenings.srism.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsSRISMDetailCtrl',
                resolve: {
                    sriSMList: function () {
                        return exclusionList;
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
                $scope.blackList.list.push(entry);

                $scope.blackList.tableParams.page(1);
                $scope.blackList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };

        $scope.updateEntry = function (entry) {
            var modalInstance = openDetailModal(entry);

            modalInstance.result.then(function (entry) {
                var updatedListItem = _.findWhere($scope.blackList.list, {
                    msisdnPrefix: entry.msisdnPrefix
                });
                updatedListItem.rejectCode = entry.rejectCode;
                updatedListItem.rejectMethod = entry.rejectMethod;
                updatedListItem.typeOfNumber = entry.typeOfNumber;
                updatedListItem.status = entry.status;

                $scope.blackList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };
    });

    AntiSpamSMSOperationsScreeningsSRISMModule.controller('AntiSpamSMSOperationsScreeningsSRISMDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService, STATES,
                                                                                                                      SMS_ANTISPAM_REJECTION_ERROR_CODES, SMS_ANTISPAM_REJECT_METHODS_1, SMS_ANTISPAM_TYPE_OF_NUMBERS,
                                                                                                                      sriSMList, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsSRISMDetailCtrl');

        $scope.sriSMList = sriSMList;

        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;
        $scope.SMS_ANTISPAM_REJECT_METHODS_1 = SMS_ANTISPAM_REJECT_METHODS_1;
        $scope.SMS_ANTISPAM_TYPE_OF_NUMBERS = SMS_ANTISPAM_TYPE_OF_NUMBERS;

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.SRISM.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                msisdnPrefix: entry.msisdnPrefix,
                rejectCode: entry.rejectCode,
                rejectMethod: entry.rejectMethod,
                typeOfNumber: entry.typeOfNumber,
                status: entry.status ? $scope.STATES[0] : $scope.STATES[1]
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.SRISM.AddNewEntryModalTitle';

            $scope.entry = {
                rejectCode: $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES[0],
                rejectMethod: $scope.SMS_ANTISPAM_REJECT_METHODS_1[0],
                typeOfNumber: $scope.SMS_ANTISPAM_TYPE_OF_NUMBERS[0],
                status: $scope.STATES[0]
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.msisdnPrefix', function (newVal) {
                if (newVal) {
                    var foundItem = _.find($scope.sriSMList, function (item) {
                        return (String(item.msisdnPrefix) === String(newVal));
                    });

                    $scope.form.msisdnPrefix.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createSRISMFilteringListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateSRISMFilteringListEntry(entryItem);
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
                entryItem.msisdnPrefix = $scope.originalEntry.msisdnPrefix;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add sri-sm filtering entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: response.value
                    });
                } else {
                    $log.debug('Added sri-sm filtering entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add sri-sm filtering entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
