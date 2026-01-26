(function () {

    'use strict';

    angular.module('ccportal.diagnostics.auditlogs', []);

    var DiagnosticsModule = angular.module('ccportal.diagnostics.auditlogs');

    DiagnosticsModule.config(function ($stateProvider) {

        $stateProvider.state('diagnostics.auditlogs', {
            url: "/auditlogs",
            templateUrl: 'diagnostics/diagnostics.auditlogs.html',
            controller: 'DiagnosticsAuditLogsMainCtrl',
            data: {},
            resolve: {
                userGroups: function (CMPFService) {
                    return CMPFService.getUserAccountGroupsByName(CMPFService.DSP_CUSTOMER_CARE_USER_GROUP_PREFIX);
                },
                userAccounts: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, organizationId);
                }
            }
        });

    });

    DiagnosticsModule.controller('DiagnosticsAuditLogsMainCtrl', function ($scope, $log, $timeout, $controller, $filter, $uibModal, UtilService, CMPFService, DateTimeConstants,
                                                                           userGroups, userAccounts, HTTP_METHODS) {
        $log.debug('DiagnosticsAuditLogsMainCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        var allUserGroupIds = _.map(userGroups ? userGroups.userGroups : [], _.iteratee('id'));

        // Filter out only the users which are included a customer care group.
        $scope.userAccountList = _.filter(userAccounts.userAccounts, function (userAccount) {
            userAccount.groupIds = _.map(userAccount.userGroups, _.iteratee('id'));

            var groupIntersection = _.intersection(userAccount.groupIds, allUserGroupIds);

            return groupIntersection && groupIntersection.length > 0;
        });
        $scope.userAccountList = $filter('orderBy')($scope.userAccountList, 'name');

        $scope.HTTP_METHODS = HTTP_METHODS;

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
                username: dateFilter.username,
                ipaddress: dateFilter.ipaddress,
                method: dateFilter.method,
                resourceName: 'DSP Customer Care Portal'
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

        $scope.showDetails = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'diagnostics/diagnostics.auditlogs.details.html',
                controller: function ($scope, $uibModalInstance, edrRecord) {

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

        // Payload modal window.
        $scope.showPayload = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'diagnostics/diagnostics.auditlogs.details.payload.html',
                controller: function ($scope, $uibModalInstance, edrRecord) {

                    edrRecord.body.data = js_beautify(edrRecord.body.data);
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

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('DiagnosticsAuditLogsTableCtrl', {$scope: $scope});
        $controller('DiagnosticsAuditLogsHistoryCtrl', {$scope: $scope});
    });

    DiagnosticsModule.controller('DiagnosticsAuditLogsTableCtrl', function ($scope, $log, $q, $filter, UtilService, NgTableParams, notification, $translate, GeneralESService, DateTimeConstants) {
        $scope.filterText = '';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'username',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.Username'
                },
                {
                    fieldName: 'subscriberNumber',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.SubscriberNumber'
                },
                {
                    fieldName: 'ipAddressesText',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.IPAddress'
                },
                {
                    fieldName: 'service',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.Service'
                },
                {
                    fieldName: 'method',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.Method'
                },
                {
                    fieldName: 'url',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.URL'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.TransactionId'
                },
                {
                    fieldName: 'resourceName',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.ResourceName'
                },
                {
                    fieldName: 'userAgent',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.UserAgent'
                },
                {
                    fieldName: 'jti',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.JTI'
                },
                {
                    fieldName: 'duration',
                    headerKey: 'Diagnostics.AuditLogs.TableColumns.Duration'
                }
            ]
        };

        // Diagnostic audit logs list
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
                GeneralESService.findAuditLogs(filter, additionalFilterFields).then(function (response) {
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
                        record._source.ipAddressesText = record._source.ipAddresses.join(', ');
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
        // END - Diagnostic audit logs list

    });

    DiagnosticsModule.controller('DiagnosticsAuditLogsHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                              DateTimeConstants) {
        $log.debug('DiagnosticsAuditLogsHistoryCtrl');

        // Audit logs detail history list
        var auditLogsDetailedHistoryList = {
            list: [],
            tableParams: {}
        };
        auditLogsDetailedHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.date": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(auditLogsDetailedHistoryList.list, params.orderBy()) : auditLogsDetailedHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Audit logs detail history list

        // History modal window.
        $scope.showAuditLogsHistory = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'diagnostics/diagnostics.auditlogs.history.html',
                controller: function ($scope, $filter, $uibModalInstance, auditLogsDetailedHistory, edrRecord, auditLogsDetailedHistoryList,
                                      showDetails, showPayload) {
                    $scope.edrRecord = edrRecord;
                    $scope.showDetails = showDetails;
                    $scope.showPayload = showPayload;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'timestamp',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.Date',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'username',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.Username'
                            },
                            {
                                fieldName: 'subscriberNumber',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.SubscriberNumber'
                            },
                            {
                                fieldName: 'ipAddressesText',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.IPAddress'
                            },
                            {
                                fieldName: 'service',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.Service'
                            },
                            {
                                fieldName: 'method',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.Method'
                            },
                            {
                                fieldName: 'url',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.URL'
                            },
                            {
                                fieldName: 'status',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.Status'
                            },
                            {
                                fieldName: 'transactionId',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.TransactionId'
                            },
                            {
                                fieldName: 'resourceName',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.ResourceName'
                            },
                            {
                                fieldName: 'userAgent',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.UserAgent'
                            },
                            {
                                fieldName: 'jti',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.JTI'
                            },
                            {
                                fieldName: 'duration',
                                headerKey: 'Diagnostics.AuditLogs.TableColumns.Duration'
                            }
                        ]
                    };

                    $scope.auditLogsDetailedHistoryList = auditLogsDetailedHistoryList;

                    $scope.auditLogsDetailedHistoryList.list = $filter('orderBy')(auditLogsDetailedHistory.hits.hits, '_source.timestamp');

                    _.each($scope.auditLogsDetailedHistoryList.list, function (record) {
                        record._source.ipAddressesText = record._source.ipAddresses.join(', ');
                    });

                    var currentList = $scope.auditLogsDetailedHistoryList.list;
                    if (currentList.length > 0) {
                        $scope.submitDate = currentList[0]._source.timestamp;
                        $scope.completionDate = currentList[currentList.length - 1]._source.timestamp;
                    }

                    $scope.auditLogsDetailedHistoryList.tableParams.page(1);
                    $scope.auditLogsDetailedHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    auditLogsDetailedHistory: function (GeneralESService) {
                        return GeneralESService.findAuditLogsDetailedHistory(edrRecord.transactionId);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    auditLogsDetailedHistoryList: function () {
                        return auditLogsDetailedHistoryList;
                    },
                    showDetails: function () {
                        return $scope.showDetails;
                    },
                    showPayload: function () {
                        return $scope.showPayload;
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