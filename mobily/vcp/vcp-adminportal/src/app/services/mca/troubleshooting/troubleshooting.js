(function () {

    'use strict';

    angular.module('adminportal.services.mca.troubleshooting', []);

    var MCATroubleshootingModule = angular.module('adminportal.services.mca.troubleshooting');

    MCATroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "services/mca/troubleshooting/troubleshooting.html",
            controller: 'MCATroubleshootingCtrl',
            resolve: {}
        });

    });

    MCATroubleshootingModule.controller('MCATroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter,
                                                                            DateTimeConstants) {
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
            var result = {};

            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            result.filter = {
                startDate: startDateIso,
                endDate: endDateIso
            };

            result.additionalFilterFields = {
                edrCallingNum: dateFilter.edrCallingNum,
                edrOrigCalledNum: dateFilter.edrOrigCalledNum
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
        $controller('MCATroubleshootingTableCtrl', {$scope: $scope});
    });

    MCATroubleshootingModule.controller('MCATroubleshootingTableCtrl', function ($scope, $log, $q, UtilService, NgTableParams, notification, $translate,
                                                                                 GeneralESService, DateTimeConstants) {
        $scope.exportFileName = 'MissedCallNotificationServiceTroubleshootingRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'edrTimestamp',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'edrCallingNum',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrCallingNum'
                },
                {
                    fieldName: 'edrOrigCalledNum',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrOrigCalledNum'
                },
                {
                    fieldName: 'edrRedirectionNum',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrRedirectionNum'
                },
                {
                    fieldName: 'edrServiceNumber',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrServiceNumber'
                },
                {
                    fieldName: 'edrOriginatingAddressPresentation',
                    headerKey: 'Services.MCA.Troubleshooting.TableColumns.EdrOriginatingAddressPresentation'
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
            showTable: false,
            tableParams: {}
        };

        $scope.activityHistory.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 100, // count per page
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
                if (params.settings().$scope.askService) {
                    GeneralESService.findMCAHistory(filter, additionalFilterFields).then(function (response) {
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
