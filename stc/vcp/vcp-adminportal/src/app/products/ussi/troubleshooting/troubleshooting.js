(function () {

    'use strict';

    angular.module('adminportal.products.ussi.troubleshooting', []);

    var USCTroubleshootingModule = angular.module('adminportal.products.ussi.troubleshooting');

    USCTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.ussi.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "products/ussi/troubleshooting/troubleshooting.html",
            controller: 'USSITroubleshootingCtrl'
        });

    });

    USCTroubleshootingModule.controller('USSITroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, DateTimeConstants, USC_POINT_TYPES) {
        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.USC_POINT_TYPES = USC_POINT_TYPES;

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
                sipMsisdn: dateFilter.sipMsisdn
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
        $controller('USSITroubleshootingTableCtrl', {$scope: $scope});
    });

    USCTroubleshootingModule.controller('USSITroubleshootingTableCtrl', function ($scope, $log, $q, $filter, UtilService, NgTableParams, notification, $translate,
                                                                                  GeneralESService, DateTimeConstants, $uibModal) {
        $scope.exportFileName = 'USSIServiceCenterTroubleshootingRecords';

        $scope.exportOptions = {
            columns: [

                {
                    fieldName: 'sequenceNum',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.SequenceNum'
                },
                {
                    fieldName: 'cdrType',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.CDRType'
                },
                {
                    fieldName: 'timestamp',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.Timestamp',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'sipMsisdn',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.SipMsisdn'
                },
                {
                    fieldName: 'result',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.Result',
                    filter: {name: 'GeneralEDRResultFilter'}
                },
                {
                    fieldName: 'reasonContext',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.ReasonContext',
                    filter: {name: 'UssiEDRReasonContextFilter'}
                },
                {
                    fieldName: 'reason',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.Reason',
                    filter: {name: 'UssiEDRReasonFilter'}
                },
                {
                    fieldName: 'sipCallId',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.SipCallId',
                },
                {
                    fieldName: 'origCscfAddress',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.OrigCscfAddress'
                },
                {
                    fieldName: 'ticket',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.Ticket',
                },
                {
                    fieldName: 'dcs',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.Dcs'
                },
                {
                    fieldName: 'ussdLanguage',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdLanguage',
                    filter: {name: 'uppercase'}
                },
                {
                    fieldName: 'ussdMessageString',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdMessageString'
                },
                {
                    fieldName: 'ussdMessageLength',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdMessageLength'
                },
                {
                    fieldName: 'ussdAlertingPattern',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdAlertingPattern'
                },
                {
                    fieldName: 'ussdSipErrorCode',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdSipErrorCode'
                },
                {
                    fieldName: 'ussdMessageType',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdMessageType'
                },
                {
                    fieldName: 'transactionType',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.TransactionType'
                },
                {
                    fieldName: 'ussType',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssType'
                },
                {
                    fieldName: 'ussdMapOp',
                    headerKey: 'Products.USSI.Troubleshooting.TableColumns.UssdMapOp'
                },
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

                if (params.settings().$scope.askService) {
                    GeneralESService.findUSSIGatewayCenterHistoryInitSessions(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.activityHistory.showTable = true;

                        $scope.activityHistory.list = response.hits.hits;

                        // Show reasonContext + Reason
                        _.each($scope.activityHistory.list, function (record) {
                            record._source.cdrTypeText = $filter('UssiEDRTypeFilter')(record._source.cdrType) + ' [' + record._source.cdrType + ']';
                            record._source.reasonText = (record._source.result > 0 ? $filter('UssiEDRResultReasonFilter')(record._source.reasonContext, record._source.reason, record._source.subReason) : '');
                            // if (record._source.selecteditem === 'Mobile Money' && record._source.input !== '*140#') {
                            //     record._source.input = '';
                            // }
                        });

                        params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                        $defer.resolve($scope.activityHistory.list);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                }

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
                templateUrl: 'products/ussi/troubleshooting/troubleshooting.edr.history.html',
                size: 'xlg',
                resolve: {
                    exportOptions: function () {
                        return $scope.exportOptions;
                    },
                    edrHistory: function () {
                        return GeneralESService.findUSSIGatewayCenterHistoryAll(edrRecord.ticket);
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
                templateUrl: 'products/ussi/troubleshooting/troubleshooting.edr.detail.html',
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
