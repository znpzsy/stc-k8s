(function () {

    'use strict';

    angular.module('ccportal.services.mca.activity-history', []);

    var MCAActivityHistoryModule = angular.module('ccportal.services.mca.activity-history');

    MCAActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.activity-history', {
            url: "/activity-history",
            templateUrl: "services/mca/activity-history/mca-activity-history.html",
            controller: 'MCAActivityHistoryCtrl',
            resolve: {}
        });

    });

    MCAActivityHistoryModule.controller('MCAActivityHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, UtilService, DateTimeConstants) {
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
        $controller('MCAActivityHistoryTableCtrl', {$scope: $scope});
    });

    MCAActivityHistoryModule.controller('MCAActivityHistoryTableCtrl', function ($scope, $log, $q, UtilService, NgTableParams, notification, $translate,
                                                                                 GeneralESService, DateTimeConstants) {
        $scope.exportFileName = 'MissedCallNotificationServiceActivityHistoryRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'edrTimestamp',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'edrServiceNumber',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrServiceNumber'
                },
                {
                    fieldName: 'edrRedirectionReason',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrRedirectionReason'
                },
                {
                    fieldName: 'edrType',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrType'
                },
                {
                    fieldName: 'edrSMSTicketOrSMSID',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrSMSTicket'
                },
                {
                    fieldName: 'edrSMStatus',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrSMStatus'
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
                "edrTimestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                GeneralESService.findMCAHistory(filter, additionalFilterFields).then(function (response) {
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

                    _.each($scope.activityHistory.list, function (record) {
                        record._source.edrSMSTicketOrSMSID = record._source.edrSMSTicket || record._source.edrSMSID;
                    });

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
