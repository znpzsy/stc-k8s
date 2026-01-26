(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.activityhistory.screeninghistory', []);

    var ActivityHistoryScreeningHistoryModule = angular.module('ccportal.subscriber-info.activityhistory.screeninghistory');

    ActivityHistoryScreeningHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.activityhistory.screeninghistory', {
            url: "/screening-history",
            templateUrl: "subscriber-info/activity-history/screeninghistory/screening-manager-activity-history.html",
            controller: 'ActivityHistoryScreeningHistoryCtrl',
            resolve: {}
        });

    });

    ActivityHistoryScreeningHistoryModule.controller('ActivityHistoryScreeningHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, UtilService, DateTimeConstants) {
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
        $controller('ActivityHistoryScreeningHistoryTableCtrl', {$scope: $scope});
    });

    ActivityHistoryScreeningHistoryModule.controller('ActivityHistoryScreeningHistoryTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, UtilService, NgTableParams,
                                                                                                           GeneralESService, DateTimeConstants) {
        $log.debug('ActivityHistoryScreeningHistoryTableCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss' + DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'subscriberIdText',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.SubscriberId'
                },
                {
                    fieldName: 'restResourceOperation',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.RestResourceOperation'
                },
                {
                    fieldName: 'requestStatus',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.RequestStatus'
                },
                {
                    fieldName: 'errorCode',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'channel',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.Channel'
                },
                {
                    fieldName: 'allowed',
                    headerKey: 'SubscriberInfo.ScreeningManagerActivityHistory.TableColumns.Allowed'
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

                var deferredRecordsQuery = $q.defer();
                GeneralESService.findScreeningManagerHistory(filter).then(function (response) {
                    $log.debug("Found records: ", response);

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.activityHistory.list = response.hits.hits;

                    _.each($scope.activityHistory.list, function (record) {
                        var subscriberId = record._source.subscriberId;
                        if (subscriberId) {
                            if (subscriberId === 'subscription_msisdn') {
                                record._source.subscriberIdText = 'SDP Blacklist';
                            }
                        }
                    });

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

    });

})();


