(function () {

    'use strict';

    angular.module('ccportal.products.usc.activity-history', []);

    var USCActivityHistoryModule = angular.module('ccportal.products.usc.activity-history');

    USCActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.activity-history', {
            url: "/activity-history",
            templateUrl: "products/usc/activity-history/ussdservicecenter-activity-history.html",
            controller: 'USCActivityHistoryCtrl'
        });

    });

    USCActivityHistoryModule.controller('USCActivityHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, DateTimeConstants, Restangular,
                                                                            POINT_TYPES, UtilService, CMPFService) {
        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        // Filter initializations
        $scope.dateFilter.startDate = $scope.getOneWeekAgo();
        $scope.dateFilter.startTime = $scope.getOneWeekAgo();

        $scope.POINT_TYPES = POINT_TYPES;

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
                startDate: startDateIso,
                endDate: endDateIso,
                msisdn: msisdn
            };

            result.additionalFilterFields = {
                input: dateFilter.input,
                selecteditem: dateFilter.selecteditem
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
        $controller('USCActivityHistoryTableCtrl', {$scope: $scope});
    });

    USCActivityHistoryModule.controller('USCActivityHistoryTableCtrl', function ($scope, $log, $filter, UtilService, NgTableParams, notification, $translate,
                                                                                 GeneralESService, DateTimeConstants, $uibModal) {
        $scope.exportFileName = 'USSDServiceCenterTroubleshootingRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'mobileno',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.MobileNo'
                },
                {
                    fieldName: 'input',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.Input'
                },
                {
                    fieldName: 'selecteditem',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.SelectedItem'
                },
                {
                    fieldName: 'language',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.Language',
                    filter: {name: 'uppercase'}
                },
                {
                    fieldName: 'subscriptiontype',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.SubscriptionType'
                },
                {
                    fieldName: 'serviceinitiated',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.ServiceInitiated',
                    filter: {name: 'UscServiceInitiatedFilter'}
                },
                {
                    fieldName: 'sessionId',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.SessionId'
                },
                {
                    fieldName: 'eventtype',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.EventType'
                },
                {
                    fieldName: 'pointtype',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.PointType'
                },
                {
                    fieldName: 'result',
                    headerKey: 'Products.USC.Troubleshooting.TableColumns.Result'
                }
            ]
        };

        // Activity history list of current scope definitions
        $scope.activityHistory = {
            list: [],
            tableParams: {}
        };

        $scope.activityHistory.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "timestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                GeneralESService.findUSSDServiceCenterHistoryInitSessions(filter, additionalFilterFields).then(function (response) {
                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    $scope.activityHistory.list = response.hits.hits;

                    // This is a temporary solution to remove sensitive data from usc records only shown on user interface.
                    _.each($scope.activityHistory.list, function (record) {
                        if (record._source.selecteditem === 'Mobile Money' && record._source.input !== '*140#') {
                            record._source.input = '';
                        }
                    });

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

        // Content modal window.
        $scope.viewContent = function (edrRecord) {
            $uibModal.open({
                animation: false,
                templateUrl: 'products/usc/activity-history/ussdservicecenter-activity-history-edr-content.html',
                controller: function ($scope, $uibModalInstance, edrRecord, edrRecordContent) {
                    $scope.edrRecord = edrRecord;
                    $scope.edrRecord.sessionType = $scope.edrRecord.serviceinitiated ? 'MT' : 'MO';
                    $scope.edrRecord.detail = edrRecordContent.hits.hits[0];
                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord;
                    },
                    edrRecordContent: function () {
                        return GeneralESService.findUSSDServiceCenterHistoryDetail(edrRecord.sessionId, edrRecord.application, edrRecord.eventtype, edrRecord.timestamp);
                    }
                }
            });
        };

        var troubleshootEdrHistoryList = {
            list: [],
            tableParams: {}
        };
        troubleshootEdrHistoryList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "_source.timestamp": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(troubleshootEdrHistoryList.list, params.orderBy()) : troubleshootEdrHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.showHistory = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/usc/activity-history/ussdservicecenter-activity-history-edr-history.html',
                size: 'xlg',
                resolve: {
                    exportOptions: function () {
                        return $scope.exportOptions;
                    },
                    edrHistory: function () {
                        return GeneralESService.findUSSDServiceCenterHistoryAll(edrRecord.sessionId);
                    },
                    edrHistoryContents: function () {
                        return GeneralESService.findUSSDServiceCenterHistoryDetailAll(edrRecord.sessionId);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    troubleshootEdrHistoryList: function () {
                        return troubleshootEdrHistoryList;
                    }
                },
                controller: function ($scope, $uibModalInstance, edrHistory, edrRecord, troubleshootEdrHistoryList, exportOptions, edrHistoryContents) {
                    $scope.historyExportOptions = exportOptions;

                    $scope.edrRecord = edrRecord;
                    $scope.edrRecord.sessionType = $scope.edrRecord.serviceinitiated ? 'MT' : 'MO';
                    $scope.troubleshootEdrHistoryList = troubleshootEdrHistoryList;

                    $scope.troubleshootEdrHistoryList.list = edrHistory.hits.hits;
                    $scope.edrHistoryContents = edrHistoryContents.hits.hits;

                    $scope.troubleshootEdrHistoryList.tableParams.page(1);
                    $scope.troubleshootEdrHistoryList.tableParams.reload();

                    _.each($scope.troubleshootEdrHistoryList.list, function (historyRecord) {
                        historyRecord._source.detail = _.find($scope.edrHistoryContents, function (historyContent) {
                            return historyContent._source.event == historyRecord._source.eventtype
                                && historyContent._source.application == historyRecord._source.application
                                && historyContent._source.timestamp == historyRecord._source.timestamp;
                        });
                    });

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                    // Content modal window.
                    $scope.viewContent = function (edrRecord) {
                        $uibModal.open({
                            animation: false,
                            templateUrl: 'products/usc/activity-history/ussdservicecenter-activity-history-edr-content.html',
                            controller: function ($scope, $uibModalInstance, edrRecord) {
                                $scope.edrRecord = edrRecord;
                                $scope.edrRecord.sessionType = $scope.edrRecord.serviceinitiated ? 'MT' : 'MO';
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
                    };
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
