(function () {

    'use strict';

    angular.module('ccportal.products.smsf.activity-history', []);

    var SMSFActivityHistoryModule = angular.module('ccportal.products.smsf.activity-history');

    SMSFActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsf.activity-history', {
            url: "/activity-history",
            templateUrl: "products/smsf/activity-history/smsf-activity-history.html",
            controller: 'SMSFActivityHistoryCtrl'
        });

    });

    SMSFActivityHistoryModule.controller('SMSFActivityHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, DateTimeConstants, Restangular, UtilService) {
        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

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
                origAddress: dateFilter.origAddress,
                destAddress: dateFilter.destAddress,
                supi: dateFilter.supi,
                result: dateFilter.result
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
        $controller('SMSFActivityHistoryTableCtrl', {$scope: $scope});
    });

    SMSFActivityHistoryModule.controller('SMSFActivityHistoryTableCtrl', function ($scope, $log, $filter, UtilService, NgTableParams, notification, $translate,
                                                                                   GeneralESService, DateTimeConstants, $uibModal) {
        $scope.exportFileName = 'SMSFTroubleshootingRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Timestamp',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'sequenceNum',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.SequenceNum'
                },
                {
                    fieldName: 'cdrType',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.CDRType',
                    filter: {name: 'SmsfEDRTypeFilter'}
                },
                {
                    fieldName: 'origAddress',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.OrigAddress'
                },
                {
                    fieldName: 'origAddressNpi',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.OrigAddressNpi'
                },
                {
                    fieldName: 'origAddressTon',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.OrigAddressTon'
                },
                {
                    fieldName: 'destAddress',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.DestAddress'
                },
                {
                    fieldName: 'destAddressNpi',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.DestAddressNpi'
                },
                {
                    fieldName: 'destAddressTon',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.DestAddressTon'
                },
                {
                    fieldName: 'supi',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Supi'
                },
                {
                    fieldName: 'pei',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Pei'
                },
                {
                    fieldName: 'accessType',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.AccessType'
                },
                {
                    fieldName: 'gpsi',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Gpsi'
                },
                {
                    fieldName: 'amfId',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.AmfID'
                },
                {
                    fieldName: 'result',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Result',
                    filter: {name: 'GeneralEDRResultFilter'}
                },
                {
                    fieldName: 'reasonContext',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.ReasonContext',
                    filter: {name: 'SmsfEDRReasonContextFilter'}
                },
                {
                    fieldName: 'reason',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Reason',
                    filter: {name: 'SmsfEDRReasonFilter'}
                },
                {
                    fieldName: 'smsRecordId',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.SmsRecordId'
                },
                {
                    fieldName: 'ueLocation',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.UeLocation'
                },
                {
                    fieldName: 'ueTimezone',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.UeTimezone'
                },
                {
                    fieldName: 'guamis',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Guamis'
                },
                {
                    fieldName: 'udmGroupId',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.UdmGroupId'
                },
                {
                    fieldName: 'ticket',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Ticket',
                },
                {
                    fieldName: 'dcs',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Dcs'
                },
                {
                    fieldName: 'userMsgRef',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.UserMsgRef',
                },
                {
                    fieldName: 'protocolIdentifier',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.ProtocolIdentifier',
                    filter: {name: 'uppercase'}
                },
                {
                    fieldName: 'msgLength',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.MsgLength'
                },
                {
                    fieldName: 'msgContent',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.MsgContent'
                },
                {
                    fieldName: 'notificationRequested',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.NotificationRequested'
                },
                {
                    fieldName: 'imsi',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.Imsi'
                },
                {
                    fieldName: 'gsmNetworkNodeNumber',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.GsmNetworkNodeNumber'
                },
                {
                    fieldName: 'routingIndicator',
                    headerKey: 'Products.SMSF.Troubleshooting.TableColumns.RoutingIndicator'
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


                GeneralESService.findSMSFCenterHistoryInitSessions(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    $scope.activityHistory.list = response.hits.hits;

                    // Show reasonContext + Reason
                    _.each($scope.activityHistory.list, function (record) {
                        record._source.cdrTypeText = $filter('UssiEDRTypeFilter')(record._source.cdrType) + ' [' + record._source.cdrType + ']';
                        record._source.reasonText = (record._source.result > 0 ? $filter('UssiEDRResultReasonFilter')(record._source.reasonContext, record._source.reason, record._source.subReason) : '');
                    });
                    $log.debug("$scope.activityHistory.list: ", $scope.activityHistory.list);

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

        // History modal window
        $scope.showHistory = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/smsf/activity-history/smsf-activity-history-edr-history.html',
                size: 'xlg',
                resolve: {
                    exportOptions: function () {
                        return $scope.exportOptions;
                    },
                    edrHistory: function () {
                        return GeneralESService.findSMSFCenterHistoryAll(edrRecord.ticket);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    troubleshootEdrHistoryList: function () {
                        return troubleshootEdrHistoryList;
                    }
                },
                controller: function ($scope, $uibModalInstance, edrHistory, edrRecord, troubleshootEdrHistoryList, exportOptions) {
                    $scope.historyExportOptions = exportOptions;

                    $scope.edrRecord = edrRecord;
                    $scope.troubleshootEdrHistoryList = troubleshootEdrHistoryList;

                    $scope.troubleshootEdrHistoryList.list = edrHistory.hits.hits;

                    $scope.troubleshootEdrHistoryList.tableParams.page(1);
                    $scope.troubleshootEdrHistoryList.tableParams.reload();


                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };

                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/smsf/activity-history/smsf-activity-history-edr-detail.html',
                controller: function ($scope, $uibModalInstance, edrRecord, smppApplicationList, recordType) {
                    edrRecord.rowSelected = true;

                    $scope.recordType = recordType;

                    $scope.edrRecord = edrRecord;

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord;
                    },
                    smppApplicationList: function () {
                        return $scope.smppApplicationList;
                    },
                    recordType: function () {
                        return $scope.recordType;
                    }
                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item;
                if (_.has(item, '_source')) {
                    record = item._source;
                }
                record.cdrTypeText = $filter('UssiEDRTypeFilter')(record.cdrType) + ' [' + record.cdrType + ']';
                record.reasonText = (record.result > 0 ? $filter('UssiEDRResultReasonFilter')(record.reasonContext, record.reason, record.subReason) : '');

            });

            return list;
        };

    });

})();
