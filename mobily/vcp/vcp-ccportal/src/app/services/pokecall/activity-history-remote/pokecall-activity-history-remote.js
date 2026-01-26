(function () {

    'use strict';

    angular.module('ccportal.services.pokecall.activity-history-remote', []);

    var PokeCallTroubleshootingRemoteModule = angular.module('ccportal.services.pokecall.activity-history-remote');

    PokeCallTroubleshootingRemoteModule.config(function ($stateProvider) {

        $stateProvider.state('services.pokecall.activity-history-remote', {
            url: "/activity-history-remote",
            templateUrl: "services/pokecall/activity-history/pokecall-activity-history.html",
            controller: 'PokeCallTroubleshootingRemoteCtrl',
            resolve: {}
        });

    });

    PokeCallTroubleshootingRemoteModule.controller('PokeCallTroubleshootingRemoteCtrl', function ($scope, $log, $controller, $timeout, $filter, DateTimeConstants,
                                                                                                  UtilService) {
        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        var msisdn = UtilService.getSubscriberMsisdn();

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
                aPartyMsisdn: dateFilter.aPartyMsisdn,
                bPartyMsisdn: dateFilter.bPartyMsisdn
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
        }, 750);

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('PokeCallTroubleshootingRemoteTableCtrl', {$scope: $scope});
    });

    PokeCallTroubleshootingRemoteModule.controller('PokeCallTroubleshootingRemoteTableCtrl', function ($scope, $log, $q, $filter, UtilService, NgTableParams, notification, $translate,
                                                                                                       GeneralESService, DateTimeConstants) {
        $scope.exportFileName = 'PokeCallServiceActivityHistoryRecordsRemote';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'aPartyMsisdn',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.APartyMsisdn'
                },
                {
                    fieldName: 'aPartyPaymentType',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.APartyPaymentType'
                },
                {
                    fieldName: 'bPartyMsisdn',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.BPartyMsisdn'
                },
                {
                    fieldName: 'bPartyPaymentType',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.BPartyPaymentType'
                },
                {
                    fieldName: 'sessionId',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.SessionId'
                },
                {
                    fieldName: 'eventInfo',
                    headerKey: 'Services.PokeCall.Troubleshooting.TableColumns.EventInfo'
                }
            ]
        };

        // Activity history list of current scope definitions
        $scope.activityHistory = {
            list: [],
            showTable: true,
            tableParams: {}
        };

        $scope.activityHistory.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "timestamp": 'desc' // initial sorting
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();

                GeneralESService.findPokeCallHistoryRemote(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    deferredRecordsQuery.resolve(response);

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
