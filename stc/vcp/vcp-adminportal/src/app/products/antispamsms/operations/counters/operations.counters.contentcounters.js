(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.counters.contentcounters', [
        "adminportal.products.antispamsms.operations.counters.contentcounters.contentranges"
    ]);

    var AntiSpamSMSOperationsCountersContentCountersModule = angular.module('adminportal.products.antispamsms.operations.counters.contentcounters');

    AntiSpamSMSOperationsCountersContentCountersModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.counters.contentcounters', {
            url: "/contentcounters",
            template: '<div ui-view></div>',
            resolve: {
                contentcounters: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentCountersList();
                }
            }
        }).state('products.antispamsms.operations.counters.contentcounters.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/counters/operations.counters.contentcounters.html",
            controller: 'AntiSpamSMSOperationsCountersContentCountersCtrl'
        }).state('products.antispamsms.operations.counters.contentcounters.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/counters/operations.counters.contentcounters.detail.html",
            controller: 'AntiSpamSMSOperationsCountersContentCountersNewCtrl'
        }).state('products.antispamsms.operations.counters.contentcounters.update', {
            url: "/update/:parentName/:name",
            templateUrl: "products/antispamsms/operations/counters/operations.counters.contentcounters.detail.html",
            controller: 'AntiSpamSMSOperationsCountersContentCountersUpdateCtrl',
            resolve: {
                contentCountersEntry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentCountersEntry($stateParams.parentName, $stateParams.name);
                }
            }
        });

    });

    AntiSpamSMSOperationsCountersContentCountersModule.controller('AntiSpamSMSOperationsCountersContentCountersCommonCtrl', function ($scope, $log, $state, $controller, $translate, $uibModal, notification, STATES, SMS_ANTISPAM_REJECT_METHODS_3,
                                                                                                                                      SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES, SMS_ANTISPAM_CASE_SENSITIVITY, SMS_ANTISPAM_EVALUATION_TYPES,
                                                                                                                                      SMS_ANTISPAM_RANGE_POLICIES, SMSAntiSpamConfigService) {
        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        // Counters only support CONTAINS and REGEX
        $scope.SMS_ANTISPAM_EVALUATION_TYPES =_.filter(SMS_ANTISPAM_EVALUATION_TYPES, function (entry) { return _.includes([0,1], entry.numericValue); });
        $scope.SMS_ANTISPAM_CASE_SENSITIVITY = SMS_ANTISPAM_CASE_SENSITIVITY;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES = SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES;

        $scope.parentNames =  _.uniq(_.map($scope.countersList ? $scope.countersList : [], _.iteratee('parentName')));

        $scope.setAddressRange = function (entry) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/counters/operations.counters.contentcounters.contentranges.modal.html',
                controller: 'AntiSpamSMSOperationsCountersContentRangesCtrl',
                size: 'lg',
                resolve: {
                    contentFiltersEntry: function () {
                        return entry;
                    },
                    msisdnRanges: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getMsisdnRangeList();
                    },
                    addressRanges: function () {
                        return SMSAntiSpamConfigService.getContentCounterRangeList(entry.name);
                    }
                }
            });
        };
    });


    AntiSpamSMSOperationsCountersContentCountersModule.controller('AntiSpamSMSOperationsCountersContentCountersCtrl', function ($scope, $uibModal, $log, $controller, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                  SMSAntiSpamConfigService, contentcounters) {
        $log.debug("AntiSpamSMSOperationsCountersContentCountersCtrl");

        $controller('AntiSpamSMSOperationsCountersContentCountersCommonCtrl', {$scope: $scope});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.Name'
                },
                {
                    fieldName: 'parentName',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.ParentName'
                },
                {
                    fieldName: 'monitoringDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.MonitoringDuration'
                },
                {
                    fieldName: 'blockingDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.BlockingDuration'
                },
                {
                    fieldName: 'caseSensitivity',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.CaseSensitivity'
                },
                {
                    fieldName: 'state',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'contentFilter',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.ContentFilter'
                },
                {
                    fieldName: 'contentFilterType',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.ContentFilterType'
                },
                {
                    fieldName: 'maxMessage',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.MaxMessages'
                },
                {
                    fieldName: 'rejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.RejectCode'
                },
                {
                    fieldName: 'rejectMethod',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.RejectMethod'
                },
                {
                    fieldName: 'rejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.RejectCode'
                },
                {
                    fieldName: 'similarityRatio',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.SimilarityRatio'
                },
                {
                    fieldName: 'msisdnRangePolicy',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.MsisdnRangePolicy'
                }
            ]
        };

        // Content Counters list
        $scope.contentCountersList = {
            list: contentcounters.counters,
            tableParams: {}
        };

        $scope.contentCountersList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.contentCountersList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentCountersList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentCountersList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentCountersList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentCountersList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentCountersList.tableParams.page(1);
            $scope.contentCountersList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing content counters list entry: ', entry);

                SMSAntiSpamConfigService.deleteContentCountersEntry(entry.parentName, entry.name).then(function (response) {
                    $log.debug('Removed content counters list entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.contentCountersList.list, {name: entry.name});
                    $scope.contentCountersList.list = _.without($scope.contentCountersList.list, deletedListItem);

                    $scope.contentCountersList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete content counters list entry: ', entry, ', response: ', response);
                });
            });
        };
    });

    AntiSpamSMSOperationsCountersContentCountersModule.controller('AntiSpamSMSOperationsCountersContentCountersNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService, contentcounters) {

        $log.debug("AntiSpamSMSOperationsCountersContentCountersNewCtrl");

        $scope.countersList = contentcounters ? contentcounters.counters : [];
        $controller('AntiSpamSMSOperationsCountersContentCountersCommonCtrl', {$scope: $scope});

        $scope.newRecord = true;

        $scope.entry = {
            //parentName: $scope.parentNames[0],
            name: '',
            contentFilter: '',
            contentFilterType: $scope.SMS_ANTISPAM_EVALUATION_TYPES[0].numericValue,
            rejectCode: 12,
            rejectMethod: $scope.SMS_ANTISPAM_REJECT_METHODS_3[2].value,
            state: $scope.STATES[0],
            msisdnRangePolicy: $scope.SMS_ANTISPAM_RANGE_POLICIES[0].numericValue,
            caseSensitivity: $scope.SMS_ANTISPAM_CASE_SENSITIVITY[1].numericValue,
            maxMessage: 0,
            blockingDuration: 0,
            maxMessages: 6,
            monitoringDuration: 500,
            tolerance: 1
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createContentCountersEntry(entry.parentName, entryItem).then(function (response) {
                if (response && response.value === "GENERAL_ERROR") {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.value,
                            errorText: response.message
                        })
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                    $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                    $log.debug('Cannot add mo sms content filters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryTemporaryReservedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added mo sms content filters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.antispamsms.operations.counters.contentcounters.list');
                }
            }, function (response) {
                $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);
            });
        };
    });

    AntiSpamSMSOperationsCountersContentCountersModule.controller('AntiSpamSMSOperationsCountersContentCountersUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMS_ANTISPAM_EVALUATION_TYPES, SMS_ANTISPAM_RANGE_POLICIES, SMSAntiSpamConfigService, contentcounters, contentCountersEntry) {

        $log.debug("AntiSpamSMSOperationsCountersContentCountersUpdateCtrl");

        $scope.entry = contentCountersEntry;
        $scope.countersList = contentcounters ? contentcounters.counters : [];

        $controller('AntiSpamSMSOperationsCountersContentCountersCommonCtrl', {$scope: $scope});

        $scope.newRecord = false;

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.updateContentCountersEntry(entry.parentName, entry).then(function (response) {
                $log.debug('Updated content counters entry: ', entryItem, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go('products.antispamsms.operations.counters.contentcounters.list');
            }, function (response) {
                $log.debug('Cannot update content counters entry: ', entryItem, ', response: ', response);
            });
        };
    });

})();
