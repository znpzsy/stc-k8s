(function () {

    'use strict';

    angular.module('ccportal.services.coc.activity-history', []);

    var COCActivityHistoryModule = angular.module('ccportal.services.coc.activity-history');

    COCActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('services.coc.activity-history', {
            url: "/activity-history",
            templateUrl: "services/coc/activity-history/coc-activity-history.html",
            controller: 'COCActivityHistoryCtrl',
            resolve: {}
        });

    });

    COCActivityHistoryModule.controller('COCActivityHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, UtilService, DateTimeConstants) {
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
                startDate: startDateIso,
                endDate: endDateIso,
                msisdn: msisdn
            };

            result.additionalFilterFields = {
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
        $controller('COCActivityHistoryTableCtrl', {$scope: $scope});
    });

    COCActivityHistoryModule.controller('COCActivityHistoryTableCtrl', function ($scope, $log, $q, UtilService, NgTableParams, notification, $translate,
                                                                                 GeneralESService, DateTimeConstants) {
        $scope.exportFileName = 'CollectCallServiceActivityHistoryRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'aPartyPaymentType',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.APartyPaymentType'
                },
                {
                    fieldName: 'bPartyPaymentType',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.BPartyPaymentType'
                },
                {
                    fieldName: 'chargedCallDuration',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.ChargedCallDuration'
                },
                {
                    fieldName: 'requestChannel',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.RequestChannel'
                },
                {
                    fieldName: 'sessionId',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.SessionId'
                },
                {
                    fieldName: 'eventInfo',
                    headerKey: 'Services.CC.Troubleshooting.TableColumns.EventInfo'
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
            count: 100, // count per page
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
                GeneralESService.findCCHistory(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.activityHistory.list = response.hits.hits;

                    params.total(response.hits.total);
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

})();
