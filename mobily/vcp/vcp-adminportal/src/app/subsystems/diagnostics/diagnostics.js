(function () {

    'use strict';

    angular.module('adminportal.subsystems.diagnostics', [
        'adminportal.subsystems.diagnostics.auditlogs'
    ]);

    var DiagnosticsModule = angular.module('adminportal.subsystems.diagnostics');

    DiagnosticsModule.config(function ($stateProvider) {
        $stateProvider.state('subsystems.diagnostics', {
            url: "/diagnostics",
            abstracte: true,
            templateUrl: 'subsystems/diagnostics/diagnostics.html',
            data: {
                headerKey: 'Subsystems.Diagnostics.PageHeader',
                permissions: [
                    'SUBSYSTEMS_DIAGNOSTICS'
                ]
            }
        }).state('subsystems.diagnostics.dashboards', {
            url: "/dashboard",
            templateUrl: 'subsystems/diagnostics/diagnostics.dashboard.html',
            controller: 'DiagnosticsDashMainCtrl'
        }).state('subsystems.diagnostics.alarmlogs', {
            url: "/alarmlogs",
            templateUrl: 'subsystems/diagnostics/diagnostics.alarmlogs.html',
            controller: 'DiagnosticsAlarmLogsMainCtrl'
        });
    });

    DiagnosticsModule.controller('DiagnosticsDashMainCtrl', function ($scope, $state, $log, $interval, DiagnosticsService, Restangular, PlotService, AdmPortalDashboardPromiseTracker) {
        $log.debug("DiagnosticsDashMainCtrl");
        $scope.criticalAlarmCount = 0;
        $scope.majorAlarmCount = 0;
        $scope.minorAlarmCount = 0;
        $scope.infoAlarmCount = 0;
        $scope.pendingSetAlarmCount = [];
        $scope.pendingSetAlarmCount['CRITICAL'] = 0;
        $scope.pendingSetAlarmCount['MAJOR'] = 0;
        $scope.pendingSetAlarmCount['MINOR'] = 0;
        $scope.pendingSetAlarmCount['INFO'] = 0;
        $scope.licenseViolationsCount = 0;

        var dateRangeFilter = {
            "range": {
                "timestamp": {
                    "from": "now-1y",
                    "to": "now"
                }
            }
        };

        var setCountRangeFilter = {
            "range": {
                "count": {
                    "gte": 0
                }
            }
        };

        var unsetCountRangeFilter = {
            "range": {
                "count": {
                    "lt": 0
                }
            }
        };

        var licenseAlarmsQuery = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "basename": "flexiblelicensing.alarm.FLEXLIC2101"
                            }
                        }
                    ]
                }
            }
        };
        licenseAlarmsQuery.query.bool.must.push(dateRangeFilter);
        licenseAlarmsQuery.query.bool.must.push(setCountRangeFilter);

        var getLicenseAlarmCount = function (promiseTracker) {
            DiagnosticsService.getAlarmCountByQuery(licenseAlarmsQuery, promiseTracker).then(function (response) {
                $log.debug('License Alarms : ', response);
                var apiResponse = Restangular.stripRestangular(response);
                $scope.licenseViolationsCount = apiResponse.count;
            }, function (response) {
                $log.debug('Cannot read license alarms. Error: ', response);
            });
        };

        var prepareAggregationQuery = function (keyName) {
            var query = {
                "aggs": {
                    "filtered": {
                        "filter": {
                            "bool": {
                                "must": []
                            }
                        },
                        "aggs": {
                            "alarms": {
                                "terms": {
                                    "field": keyName,
                                    "min_doc_count": 1
                                },
                                "aggs": {
                                    "counts": {
                                        "stats": {
                                            "field": "count"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "size": 0
            };
            query.aggs.filtered.filter.bool.must.push(dateRangeFilter);

            return query;
        };

        var getAlarmSeverity = function (promiseTracker) {
            var alarmsBySeverityQuery = prepareAggregationQuery("severity");
            alarmsBySeverityQuery.aggs.filtered.filter.bool.must.push(setCountRangeFilter);

            DiagnosticsService.getAlarmsByQuery(alarmsBySeverityQuery, promiseTracker).then(function (response) {
                $log.debug('Alarms by severity : ', response);
                var apiResponse = Restangular.stripRestangular(response);

                var criticalAlarms = _.findWhere(apiResponse.aggregations.filtered.alarms.buckets, {key: "CRITICAL"});
                if (criticalAlarms) {
                    $scope.criticalAlarmCount = criticalAlarms.counts.count;
                }

                var majorAlarms = _.findWhere(apiResponse.aggregations.filtered.alarms.buckets, {key: "MAJOR"});
                if (majorAlarms) {
                    $scope.majorAlarmCount = majorAlarms.counts.count;
                }

                var minorAlarms = _.findWhere(apiResponse.aggregations.filtered.alarms.buckets, {key: "MINOR"});
                if (minorAlarms) {
                    $scope.minorAlarmCount = minorAlarms.counts.count;
                }

                var infoAlarms = _.findWhere(apiResponse.aggregations.filtered.alarms.buckets, {key: "INFO"});
                if (infoAlarms) {
                    $scope.infoAlarmCount = infoAlarms.counts.count;
                }
            }, function (response) {
                $log.debug('Cannot read alarms. Error: ', response);
            });
        };

        var preparePendingAlarmsQuery = function (type, severity) {
            var alarmsByModuleQuery = prepareAggregationQuery("rawname");

            if (type === 'SET') {
                alarmsByModuleQuery.aggs.filtered.filter.bool.must.push(setCountRangeFilter);
            } else {
                alarmsByModuleQuery.aggs.filtered.filter.bool.must.push(unsetCountRangeFilter);
            }

            alarmsByModuleQuery.aggs.filtered.filter.bool.must.push({
                "term": {
                    "type": 'SET'
                }
            });

            alarmsByModuleQuery.aggs.filtered.filter.bool.must.push({
                "terms": {
                    "severity": [
                        severity
                    ]
                }
            });

            return alarmsByModuleQuery;
        };

        var getAlarms = function (promiseTracker, severity) {
            var pendingSetAlarmByModuleQuery = preparePendingAlarmsQuery('SET', severity);
            var pendingUnsetAlarmByModuleQuery = preparePendingAlarmsQuery('UNSET', severity);

            DiagnosticsService.getAlarmsByQuery(pendingSetAlarmByModuleQuery, promiseTracker).then(function (setResponse) {
                $log.debug('Pending SET alarms : ', setResponse);
                DiagnosticsService.getAlarmsByQuery(pendingUnsetAlarmByModuleQuery, promiseTracker).then(function (unsetResponse) {
                    $log.debug('Pending UNSET alarms : ', unsetResponse);

                    var setResults = Restangular.stripRestangular(setResponse).aggregations.filtered.alarms.buckets;
                    var pendingSetAlarmCount = 0;
                    if (setResults.length) {
                        pendingSetAlarmCount = _.reduce(setResults, function (total, alarm) {
                            return total + alarm.counts.count
                        }, 0);
                    }

                    var unsetResults = Restangular.stripRestangular(unsetResponse).aggregations.filtered.alarms.buckets;
                    var pendingUnsetAlarmCount = 0;
                    if (unsetResults.length) {
                        pendingUnsetAlarmCount = _.reduce(unsetResults, function (total, alarm) {
                            return total + alarm.counts.count
                        }, 0);
                    }

                    $scope.pendingSetAlarmCount[severity] = pendingSetAlarmCount - pendingUnsetAlarmCount;
                    $scope.pendingSetAlarmCount[severity] = (($scope.pendingSetAlarmCount[severity] < 0) ? 0 : $scope.pendingSetAlarmCount[severity]);
                }, function (response) {
                    $log.error('Cannot read unset alarms. Error: ', response);
                });
            }, function (response) {
                $log.error('Cannot read set alarms. Error: ', response);
            });
        };

        // ------------------------------------------------------------------- //
        // Get Pie Chart data
        var getClusterAlarms = function (promiseTracker) {
            var alarmsByClusterQuery = prepareAggregationQuery("cluster");
            alarmsByClusterQuery.aggs.filtered.filter.bool.must.push(setCountRangeFilter);

            DiagnosticsService.getAlarmsByQuery(alarmsByClusterQuery, promiseTracker).then(function (response) {
                $log.debug('Alarms by cluster : ', response);

                var apiResponse = Restangular.stripRestangular(response);

                $scope.byclusters = [];
                angular.forEach(apiResponse.aggregations.filtered.alarms.buckets, function (value, key) {
                    this.push({label: value.key, data: value.counts.count});
                }, $scope.byclusters);
                $scope.byclusters = PlotService.getLargeDataGroupByValue($scope.byclusters, 10);
                PlotService.drawPie('#pie-chart-cluster', $scope.byclusters, true);
            }, function (response) {
                $scope.byclusters = [];

                $log.debug('Cannot read alarms. Error: ', response);
            });
        };

        var getHostAlarms = function (promiseTracker) {
            var alarmsByHostQuery = prepareAggregationQuery("host");
            alarmsByHostQuery.aggs.filtered.filter.bool.must.push(setCountRangeFilter);

            DiagnosticsService.getAlarmsByQuery(alarmsByHostQuery, promiseTracker).then(function (response) {
                $log.debug('Alarms by host : ', response);

                var apiResponse = Restangular.stripRestangular(response);

                $scope.byhosts = [];
                angular.forEach(apiResponse.aggregations.filtered.alarms.buckets, function (value, key) {
                    this.push({label: value.key, data: value.counts.count});
                }, $scope.byhosts);
                $scope.byhosts = PlotService.getLargeDataGroupByValue($scope.byhosts, 10);
                PlotService.drawPie('#pie-chart-host', $scope.byhosts, true);
            }, function (response) {
                $scope.byhosts = [];

                $log.debug('Cannot read alarms. Error: ', response);
            });
        };

        var getModuleAlarms = function (promiseTracker) {
            var alarmsByModuleQuery = prepareAggregationQuery("rawname");
            alarmsByModuleQuery.aggs.filtered.filter.bool.must.push(setCountRangeFilter);

            DiagnosticsService.getAlarmsByQuery(alarmsByModuleQuery, promiseTracker).then(function (response) {
                $log.debug('Alarms by module : ', response);

                var apiResponse = Restangular.stripRestangular(response);

                $scope.bymodules = [];
                angular.forEach(apiResponse.aggregations.filtered.alarms.buckets, function (value, key) {
                    this.push({label: value.key, data: value.counts.count});
                }, $scope.bymodules);
                $scope.bymodules = PlotService.getLargeDataGroupByValue($scope.bymodules, 10);
                PlotService.drawPie('#pie-chart-module', $scope.bymodules, true);
            }, function (response) {
                $scope.bymodules = [];

                $log.debug('Cannot read alarms. Error: ', response);
            });
        };
        // ------------------------------------------------------------------- //

        var dashboarding = function (promiseTracker) {
            $log.debug('loading');

            // Tiles
            getAlarmSeverity(promiseTracker);

            getAlarms(promiseTracker, 'CRITICAL');
            getAlarms(promiseTracker, 'MAJOR');
            getAlarms(promiseTracker, 'MINOR');
            getAlarms(promiseTracker, 'INFO');

            getLicenseAlarmCount(promiseTracker);

            // Pie Charts
            getClusterAlarms(promiseTracker);
            getHostAlarms(promiseTracker);
            getModuleAlarms(promiseTracker);
        };

        dashboarding();

        var rebuild = $interval(function () {
            $log.debug('reloading');
            dashboarding(AdmPortalDashboardPromiseTracker);
        }, 90000);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(rebuild)) {
                $log.debug('Cancelled timer');
                $interval.cancel(rebuild);
                rebuild = undefined;
            }
        });

    });

    DiagnosticsModule.controller('DiagnosticsAlarmLogsMainCtrl', function ($scope, $log, $timeout, $controller) {
        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        // Button filter initialization
        $scope.filter = {
            type: 'ALL',
            severity: 'ALL'
        };

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('DiagnosticsAlarmLogsTableCtrl', {$scope: $scope});

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

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable($scope.alarmLogs.tableParams, true);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            $scope.alarmLogs.tableParams.settings().$scope.quickSearchText = text;
            $scope.alarmLogs.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.alarmLogs.tableParams, true);
        }, 500);
    });

    DiagnosticsModule.controller('DiagnosticsAlarmLogsTableCtrl', function ($scope, $filter, $log, UtilService, NgTableParams, notification, $translate, GeneralESService, DateTimeConstants) {
        $scope.filterText = '';

        // Diagnostic alarm logs list
        $scope.alarmLogs = {
            list: [],
            tableParams: {}
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Subsystems.Diagnostics.AlarmLogs.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'severity',
                    headerKey: 'Subsystems.Diagnostics.AlarmLogs.TableColumns.Severity'
                },
                {
                    fieldName: 'type',
                    headerKey: 'Subsystems.Diagnostics.AlarmLogs.TableColumns.Type',
                    filter: {name: 'AlarmTypeFilter', params: ['count']}
                },
                {
                    fieldName: 'cluster',
                    headerKey: 'Subsystems.Diagnostics.AlarmLogs.TableColumns.Cluster'
                },
                {
                    fieldName: 'host',
                    headerKey: 'Subsystems.Diagnostics.AlarmLogs.TableColumns.Host'
                },
                {
                    fieldName: 'message',
                    headerKey: 'Subsystems.Diagnostics.AlarmLogs.TableColumns.Message'
                }
            ]
        };

        $scope.alarmLogs.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "timestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var dateFilter = $scope.dateFilter;
                var filter = $scope.filter;
                filter.startDate = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
                filter.endDate = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

                filter.sortFieldName = s.words(params.orderBy()[0], /\-|\+/)[0];
                filter.sortOrder = s.include(params.orderBy()[0], '+') ? '"asc"' : '"desc"';

                filter.limit = params.count();
                filter.offset = (params.page() - 1) * params.count();

                filter.queryString = $scope.quickSearchText;
                filter.quickSearchColumns = $scope.quickSearchColumns;

                var promise = GeneralESService.findAlarmLogs(filter);
                promise.then(function (response) {
                        $scope.alarmLogs.list = response.hits.hits;
                        params.total(response.hits.total);
                        $defer.resolve($scope.alarmLogs.list);

                        // Slide Up and hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    }
                );
            }
        });
        // END - Diagnostic alarm logs list

    });

    DiagnosticsModule.filter('AlarmTypeFilter', function () {
        return function (alarmType, alarmCount) {
            if (alarmType === 'SET' && alarmCount < 0) {
                return 'UNSET';
            }
            else {
                return alarmType;
            }
        };
    });

})();