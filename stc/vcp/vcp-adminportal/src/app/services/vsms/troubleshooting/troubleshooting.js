(function () {

    'use strict';

    angular.module('adminportal.services.vsms.troubleshooting', []);

    var VSMSTroubleshootingModule = angular.module('adminportal.services.vsms.troubleshooting');

    VSMSTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "services/vsms/troubleshooting/troubleshooting.html",
            controller: 'VSMSTroubleshootingCtrl'
        });

    });

    VSMSTroubleshootingModule.controller('VSMSTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, DateTimeConstants) {
        $log.debug('VSMSTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.reloadTable = function (tableParams, isAskService, _pageNumber) {
            tableParams.settings().$scope.askService = isAskService;
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
            var result = {}

            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            result.filter = {
                startDate: startDateIso,
                endDate: endDateIso
            };

            result.additionalFilterFields = {
                // Calling Party
                origparty: dateFilter.origparty,
                // Called Party
                destparty: dateFilter.destparty
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
            $scope.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('VSMSTroubleshootingTableCtrl', {$scope: $scope});
        $controller('VSMSTroubleshootingHistoryCtrl', {$scope: $scope});
    });

    VSMSTroubleshootingModule.controller('VSMSTroubleshootingTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                   UtilService, GeneralESService, DateTimeConstants) {
        $log.debug('VSMSTroubleshootingTableCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Services.VSMS.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'origparty',
                    headerKey: 'Services.VSMS.Troubleshooting.TableColumns.OrigParty'
                },
                {
                    fieldName: 'destparty',
                    headerKey: 'Services.VSMS.Troubleshooting.TableColumns.DestParty'
                },
                {
                    fieldName: 'calltype',
                    headerKey: 'Services.VSMS.Troubleshooting.TableColumns.CallType'
                },
                {
                    fieldName: 'eventcode',
                    headerKey: 'Services.VSMS.Troubleshooting.TableColumns.EventCode'
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
            count: 100,
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
                if (params.settings().$scope.askService) {
                    GeneralESService.findVSMSHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.activityHistory.showTable = true;

                        deferredRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.activityHistory.list = response.hits.hits;

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.activityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

    });

    VSMSTroubleshootingModule.controller('VSMSTroubleshootingHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                     GeneralESService, DateTimeConstants) {
        $log.debug('VSMSTroubleshootingHistoryCtrl');

        // Voice SMS detail history list
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
        // END - Voice SMS detail history list

        // History modal window.
        $scope.showVSMSHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'services/vsms/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $filter, $uibModalInstance, vsmsEdrs, edrRecord, activityHistoryDetailedHistoryList) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'timestamp',
                                headerKey: 'Services.VSMS.Troubleshooting.TableColumns.HistoryEventDate',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'origparty',
                                headerKey: 'Services.VSMS.Troubleshooting.TableColumns.OrigParty'
                            },
                            {
                                fieldName: 'destparty',
                                headerKey: 'Services.VSMS.Troubleshooting.TableColumns.DestParty'
                            },
                            {
                                fieldName: 'calltype',
                                headerKey: 'Services.VSMS.Troubleshooting.TableColumns.CallType'
                            },
                            {
                                fieldName: 'eventcode',
                                headerKey: 'Services.VSMS.Troubleshooting.TableColumns.EventCode'
                            }
                        ]
                    };

                    $scope.origparty = edrRecord.origparty;
                    $scope.destparty = edrRecord.destparty;

                    $scope.activityHistoryDetailedHistoryList = activityHistoryDetailedHistoryList;

                    $scope.activityHistoryDetailedHistoryList.list = $filter('orderBy')(vsmsEdrs.hits.hits, '_source.timestamp');

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
                    vsmsEdrs: function (GeneralESService) {
                        return GeneralESService.findVSMSDetailedHistory(edrRecord.sessionid);
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
