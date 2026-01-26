(function () {

    'use strict';

    angular.module('ccportal.services.vm.activity-history', []);

    var VMActivityHistoryModule = angular.module('ccportal.services.vm.activity-history');

    VMActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.activity-history', {
            url: "/activity-history",
            templateUrl: "services/vm/activity-history/vm-activity-history.html",
            controller: 'VMActivityHistoryCtrl'
        });

    });

    VMActivityHistoryModule.controller('VMActivityHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, UtilService, DateTimeConstants) {
        $log.debug('VMActivityHistoryCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        // Filter initializations
        $scope.dateFilter.startDate = $scope.getOneWeekAgo();
        $scope.dateFilter.startTime = $scope.getOneWeekAgo();

        $scope.reloadTable = function (tableParams, _pageNumber) {
            var pageNumber = _pageNumber ? _pageNumber : 1;
            if (tableParams.page() === pageNumber) {
                tableParams.reload();
            } else {
                $timeout(function () {
                    tableParams.page(pageNumber);
                }, 0);
            }
        };

        $scope.prepareFilter = function (dateFilter, tableParams) {
            var result = {};

            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            result.filter = {
                msisdn: msisdn,
                startDate: startDateIso,
                endDate: endDateIso
            };

            result.additionalFilterFields = {
                // Calling Party
                origparty: dateFilter.origparty,
                // Called Party
                destparty: dateFilter.destparty,
                // Original Callee
                origdestparty: dateFilter.origdestparty
            };

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? '"asc"' : '"desc"';
                result.filter.limit = tableParams.count();
                result.filter.offset = (tableParams.page() - 1) * tableParams.count();

                result.filter.queryString = tableParams.settings().$scope.quickSearchText;
                result.filter.quickSearchColumns = tableParams.settings().$scope.quickSearchColumns;
            }

            return result;
        };

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable($scope.activityHistory.tableParams);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.activityHistory.tableParams);
        }, 500);

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('VMActivityHistoryTableCtrl', {$scope: $scope});
        $controller('VMActivityHistoryHistoryCtrl', {$scope: $scope});
    });

    VMActivityHistoryModule.controller('VMActivityHistoryTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                               UtilService, GeneralESService, DateTimeConstants) {
        $log.debug('VMActivityHistoryTableCtrl');

        $scope.exportFileName = 'VoiceMailServiceActivityHistoryRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'origparty',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.OrigParty'
                },
                {
                    fieldName: 'destparty',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.DestParty'
                },
                {
                    fieldName: 'origdestparty',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.OrigDestParty'
                },
                {
                    fieldName: 'redirparty',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.RedirParty'
                },
                {
                    fieldName: 'redirreason',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.RedirReason'
                },
                {
                    fieldName: 'calltype',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.CallType'
                },
                {
                    fieldName: 'eventcode',
                    headerKey: 'Services.VM.Troubleshooting.TableColumns.EventCode'
                }
            ]
        };

        // Activity history list of current scope definitions
        $scope.activityHistory = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.activityHistory.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "timestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                GeneralESService.findVMHistory(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.activityHistory.list = response.hits.hits;

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    params.total(response.hits.total);
                    $defer.resolve($scope.activityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'services/vm/activity-history/vm-activity-history.edr.details.html',
                controller: function ($scope, $uibModalInstance, edrRecord) {
                    edrRecord.rowSelected = true;

                    $scope.edrRecord = edrRecord;

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord;
                    }
                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };
    });

    VMActivityHistoryModule.controller('VMActivityHistoryHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                 GeneralESService, DateTimeConstants) {
        $log.debug('VMActivityHistoryHistoryCtrl');

        // Voice Mail detail history list
        var activityHistoryDetailedHistoryList = {
            list: [],
            tableParams: {}
        };
        activityHistoryDetailedHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.timestamp": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(activityHistoryDetailedHistoryList.list, params.orderBy()) : activityHistoryDetailedHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Voice Mail detail history list

        // History modal window.
        $scope.showVMHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'services/vm/activity-history/vm-activity-history.edr.history.html',
                controller: function ($scope, $filter, $uibModalInstance, vmEdrs, edrRecord, activityHistoryDetailedHistoryList) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'timestamp',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.HistoryEventDate',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'origparty',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.OrigParty'
                            },
                            {
                                fieldName: 'subsphone',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.SubsPhone'
                            },
                            {
                                fieldName: 'destparty',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.DestParty'
                            },
                            {
                                fieldName: 'origdestparty',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.OrigDestParty'
                            },
                            {
                                fieldName: 'redirparty',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.RedirParty'
                            },
                            {
                                fieldName: 'redirreason',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.RedirReason'
                            },
                            {
                                fieldName: 'calltype',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.CallType'
                            },
                            {
                                fieldName: 'eventcode',
                                headerKey: 'Services.VM.Troubleshooting.TableColumns.EventCode'
                            }
                        ]
                    };

                    $scope.origparty = edrRecord.origparty;
                    $scope.destparty = edrRecord.destparty;

                    $scope.activityHistoryDetailedHistoryList = activityHistoryDetailedHistoryList;

                    $scope.activityHistoryDetailedHistoryList.list = $filter('orderBy')(vmEdrs.hits.hits, '_source.timestamp');

                    var currentList = $scope.activityHistoryDetailedHistoryList.list;
                    if (currentList.length > 0) {
                        $scope.submitDate = currentList[0]._source.timestamp;
                        $scope.completionDate = currentList[currentList.length - 1]._source.timestamp;
                    }

                    _.each($scope.activityHistoryDetailedHistoryList.list, function (record) {
                        record._source.calltype_eventcode = record._source.calltype + ' [' + record._source.eventcode + ']';
                    });

                    $scope.activityHistoryDetailedHistoryList.tableParams.page(1);
                    $scope.activityHistoryDetailedHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    vmEdrs: function (GeneralESService) {
                        return GeneralESService.findVMDetailedHistory(edrRecord.sessionid);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    activityHistoryDetailedHistoryList: function () {
                        return activityHistoryDetailedHistoryList;
                    }
                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };

    });

})();
