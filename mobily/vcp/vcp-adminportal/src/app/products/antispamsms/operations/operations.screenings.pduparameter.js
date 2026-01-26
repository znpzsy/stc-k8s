(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.screenings.pduparameter', []);

    var AntiSpamSMSOperationsScreeningsPDUParameterModule = angular.module('adminportal.products.antispamsms.operations.screenings.pduparameter');

    AntiSpamSMSOperationsScreeningsPDUParameterModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.screenings.pduparameter', {
            url: "/pduparameter",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.screenings.pduparameter.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.screenings.pduparameter.html",
            controller: "AntiSpamSMSOperationsScreeningsPDUParameterCtrl",
            resolve: {
                pduParameterList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getParameterFilteringList();
                }
            }
        });

    });

    AntiSpamSMSOperationsScreeningsPDUParameterModule.controller('AntiSpamSMSOperationsScreeningsPDUParameterCtrl', function ($scope, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                              SMSAntiSpamConfigService, SCREENING_MANAGER_RULES, pduParameterList) {
        $log.debug('AntiSpamSMSOperationsScreeningsPDUParameterCtrl');

        var exclusionList = pduParameterList.allScreenings ? pduParameterList.allScreenings : [];
        exclusionList = $filter('orderBy')(exclusionList, 'priority');

        $scope.SCREENING_MANAGER_RULES = SCREENING_MANAGER_RULES;

        $scope.screeningRule = $scope.SCREENING_MANAGER_RULES[3].value;

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'priority',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.Priority'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.ParameterName'
                },
                {
                    fieldName: 'screeningParameters',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.ParameterValue'
                },
                {
                    fieldName: 'action',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.Action'
                },
                {
                    fieldName: 'rejectMethod',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.PolicyInEffect'
                },
                {
                    fieldName: 'moRejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.MORejectionErrorCode'
                },
                {
                    fieldName: 'mtRejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Screenings.TableColumns.MTRejectionErrorCode'
                }
            ]
        };

        // Pdu parameter black list
        $scope.blackList = {
            list: exclusionList,
            tableParams: {}
        };

        $scope.blackList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "priority": 'asc'
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
        // END - Pdu parameter black list

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
                $log.debug('Removing pdu parameter entry: ', entry);

                SMSAntiSpamConfigService.deleteParameterFilteringListEntry(entry.name).then(function (response) {
                    $log.debug('Removed pdu parameter entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.blackList.list, {
                        name: entry.name
                    });
                    $scope.blackList.list = _.without($scope.blackList.list, deletedListItem);

                    $scope.blackList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete pdu parameter entry: ', entry, ', response: ', response);
                });
            });
        };

        var openDetailModal = function (entry) {
            return $uibModal.open({
                templateUrl: 'products/antispamsms/operations/operations.screenings.pduparameter.detail.modal.html',
                controller: 'AntiSpamSMSOperationsScreeningsPDUParameterDetailCtrl',
                resolve: {
                    pduParameterList: function () {
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
                    name: entry.name
                });
                updatedListItem.action = entry.action;
                updatedListItem.priority = entry.priority;
                updatedListItem.screeningParameters = entry.screeningParameters;
                updatedListItem.rejectMethod = entry.rejectMethod;
                updatedListItem.moRejectCode = entry.moRejectCode;
                updatedListItem.mtRejectCode = entry.mtRejectCode;

                $scope.blackList.tableParams.reload();
            }, function () {
                // Ignored
            });
        };
    });

    AntiSpamSMSOperationsScreeningsPDUParameterModule.controller('AntiSpamSMSOperationsScreeningsPDUParameterDetailCtrl', function ($scope, $log, $uibModalInstance, $translate, notification, SMSAntiSpamConfigService,
                                                                                                                                    SMS_ANTISPAM_REJECT_METHODS_2, SMS_ANTISPAM_REJECTION_ERROR_CODES, SMS_ANTISPAM_ACTIONS, pduParameterList, entry) {
        $log.debug('AntiSpamSMSOperationsScreeningsPDUParameterDetailCtrl');

        $scope.pduParameterList = pduParameterList;

        $scope.SMS_ANTISPAM_REJECT_METHODS_2 = SMS_ANTISPAM_REJECT_METHODS_2;
        $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES = SMS_ANTISPAM_REJECTION_ERROR_CODES;
        $scope.SMS_ANTISPAM_ACTIONS = SMS_ANTISPAM_ACTIONS;

        if (entry) {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.PDUParameter.UpdateEntryModalTitle';

            $scope.entry = {
                id: _.uniqueId(),
                name: entry.name,
                action: entry.action,
                nextTableName: entry.nextTableName,
                priority: entry.priority,
                screeningParameters: entry.screeningParameters,
                rejectMethod: entry.rejectMethod,
                moRejectCode: entry.moRejectCode,
                mtRejectCode: entry.mtRejectCode
            };
        } else {
            $scope.pageHeaderKey = 'Products.AntiSpamSMS.Operations.Screenings.PDUParameter.AddNewEntryModalTitle';

            $scope.entry = {
                action: $scope.SMS_ANTISPAM_ACTIONS[0].value,
                nextTableName: '',
                rejectMethod: $scope.SMS_ANTISPAM_REJECT_METHODS_2[0],
                moRejectCode: $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES[0],
                mtRejectCode: $scope.SMS_ANTISPAM_REJECTION_ERROR_CODES[0]
            };

            // The watchers to check availability on the list.
            $scope.$watch('entry.name', function (newVal) {
                if (newVal) {
                    var foundItem = _.find($scope.pduParameterList, function (item) {
                        return (String(item.name) === String(newVal));
                    });

                    $scope.form.name.$setValidity('availabilityCheck', _.isUndefined(foundItem));
                }
            });
        }

        var promise = function (entryItem, isCreate) {
            if (isCreate)
                return SMSAntiSpamConfigService.createParameterFilteringListEntry(entryItem);
            else
                return SMSAntiSpamConfigService.updateParameterFilteringListEntry(entryItem.name, entryItem);
        };

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        // Save entry
        $scope.save = function (entry) {
            var isCreate = _.isUndefined(entry.id);
            var entryItem = angular.copy(entry);
            entryItem.nextTableName = $scope.originalEntry.nextTableName;

            if (!isCreate) {
                delete entryItem.id;
                entryItem.name = $scope.originalEntry.name;
            }

            promise(entryItem, isCreate).then(function (response) {
                if (response && response.value) {
                    $log.debug('Cannot add pdu parameter entry: ', entryItem, ', response: ', response);

                    if (response.message && response.message.indexOf('Invalid Parameter Syntax')) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.Screenings.PDUParameter.Messages.InvalidParameterSyntaxError', {
                                screeningParameters: entryItem.screeningParameters
                            })
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: response.value
                        });
                    }
                } else {
                    $log.debug('Added pdu parameter entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $uibModalInstance.close(entryItem);
                }
            }, function (response) {
                $log.debug('Cannot add pdu parameter entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    });

})();
    