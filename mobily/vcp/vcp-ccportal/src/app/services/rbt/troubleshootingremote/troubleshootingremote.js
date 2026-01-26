(function () {

    'use strict';

    angular.module('ccportal.services.rbt.troubleshootingremote', []);

    var RBTTroubleshootingRemoteModule = angular.module('ccportal.services.rbt.troubleshootingremote');

    RBTTroubleshootingRemoteModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.troubleshootingremote', {
            url: "/activity-history-remote",
            templateUrl: "services/rbt/troubleshooting/troubleshooting.html",
            controller: 'RBTTroubleshootingRemoteCtrl'
        });

    });

    RBTTroubleshootingRemoteModule.controller('RBTTroubleshootingRemoteCtrl', function ($scope, $log, $controller, $timeout, $filter, UtilService, DateTimeConstants) {
        $log.debug('RBTTroubleshootingRemoteCtrl');

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
                // Calling Party
                originatingParty: dateFilter.originatingParty,
                // Called Party
                destinationParty: dateFilter.destinationParty,
                // Others
                matchCriteria: dateFilter.matchCriteria
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
        $controller('RBTTroubleshootingRemoteTableCtrl', {$scope: $scope});
        $controller('RBTTroubleshootingRemoteHistoryCtrl', {$scope: $scope});
    });

    RBTTroubleshootingRemoteModule.controller('RBTTroubleshootingRemoteTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                             UtilService, GeneralESService, DateTimeConstants) {
        $log.debug('RBTTroubleshootingRemoteTableCtrl');

        $scope.exportFileName = 'RingBackToneServiceActivityHistoryRecordsRemote';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Services.RBT.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'originatingParty',
                    headerKey: 'Services.RBT.Troubleshooting.TableColumns.OriginatingParty'
                },
                {
                    fieldName: 'destinationParty',
                    headerKey: 'Services.RBT.Troubleshooting.TableColumns.DestinationParty'
                },
                {
                    fieldName: 'contentId',
                    headerKey: 'Services.RBT.Troubleshooting.TableColumns.ContentId'
                },
                {
                    fieldName: 'sessionid',
                    headerKey: 'Services.RBT.Troubleshooting.TableColumns.SessionId'
                },
                {
                    fieldName: 'eventCodeText',
                    headerKey: 'Services.RBT.Troubleshooting.TableColumns.EventCode'
                }
            ]
        };

        // Activity history list of current scope definitions
        $scope.activityHistory = {
            list: [],
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
                GeneralESService.findRBTHistoryRemote(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    $scope.activityHistory.list = response.hits.hits;

                    _.each($scope.activityHistory.list, function (record) {
                        record._source.eventCodeText = $filter('RBTEventTypeFilter')(record._source.eventcode);
                        if (record._source.eventCodeText !== record._source.eventcode) {
                            record._source.eventCodeText += ' [' + record._source.eventcode + ']';
                        }
                    });

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
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

    RBTTroubleshootingRemoteModule.controller('RBTTroubleshootingRemoteHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                               GeneralESService, DateTimeConstants) {
        $log.debug('RBTTroubleshootingRemoteHistoryCtrl');

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
        $scope.showHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'services/rbt/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $filter, $uibModalInstance, rbtEdrs, edrRecord, activityHistoryDetailedHistoryList) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'timestamp',
                                headerKey: 'Services.RBT.Troubleshooting.TableColumns.Date',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'originatingParty',
                                headerKey: 'Services.RBT.Troubleshooting.TableColumns.OriginatingParty'
                            },
                            {
                                fieldName: 'destinationParty',
                                headerKey: 'Services.RBT.Troubleshooting.TableColumns.DestinationParty'
                            },
                            {
                                fieldName: 'contentId',
                                headerKey: 'Services.RBT.Troubleshooting.TableColumns.ContentId'
                            },
                            {
                                fieldName: 'sessionid',
                                headerKey: 'Services.RBT.Troubleshooting.TableColumns.SessionId'
                            },
                            {
                                fieldName: 'eventCodeText',
                                headerKey: 'Services.RBT.Troubleshooting.TableColumns.EventCode'
                            }
                        ]
                    };

                    $scope.originatingParty = edrRecord.originatingParty;
                    $scope.destinationParty = edrRecord.destinationParty;

                    $scope.activityHistoryDetailedHistoryList = activityHistoryDetailedHistoryList;

                    $scope.activityHistoryDetailedHistoryList.list = $filter('orderBy')(rbtEdrs.hits.hits, '_source.timestamp');

                    var currentList = $scope.activityHistoryDetailedHistoryList.list;
                    if (currentList.length > 0) {
                        $scope.submitDate = currentList[0]._source.timestamp;
                        $scope.completionDate = currentList[currentList.length - 1]._source.timestamp;
                    }

                    _.each($scope.activityHistoryDetailedHistoryList.list, function (record) {
                        record._source.eventCodeText = $filter('RBTEventTypeFilter')(record._source.eventcode);
                        if (record._source.eventCodeText !== record._source.eventcode) {
                            record._source.eventCodeText += ' [' + record._source.eventcode + ']';
                        }
                    });

                    $scope.activityHistoryDetailedHistoryList.tableParams.page(1);
                    $scope.activityHistoryDetailedHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    rbtEdrs: function (GeneralESService) {
                        return GeneralESService.findRBTDetailedHistoryRemote(edrRecord.sessionid);
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
