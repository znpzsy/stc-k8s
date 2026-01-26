(function () {

    'use strict';

    angular.module('adminportal.products.oivr.troubleshooting', []);

    var OIVRTroubleshootingModule = angular.module('adminportal.products.oivr.troubleshooting');

    OIVRTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.oivr.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "products/oivr/troubleshooting/troubleshooting.html",
            controller: 'OIVRTroubleshootingCtrl'
        });

    });

    OIVRTroubleshootingModule.controller('OIVRTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, DateTimeConstants) {
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
                originatingParty: dateFilter.originatingParty,
                destinationParty: dateFilter.destinationParty
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
        $controller('OIVRTroubleshootingTableCtrl', {$scope: $scope});
    });

    OIVRTroubleshootingModule.controller('OIVRTroubleshootingTableCtrl', function ($scope, $log, $q, $filter, UtilService, NgTableParams, notification, $translate,
                                                                                  GeneralESService, DateTimeConstants, $uibModal) {
        $scope.exportFileName = 'OIVRTroubleshootingRecords'

        /*
        * The following is a snippet from the Elasticsearch query for oivr index mappings - properties.
        *
        * - callDuration
        * - callFlowName
        * - callFlowVersion
        * - clientId
        * - customerResponse
        * - destinationParty
        * - duration
        * - edrTimestamp
        * - event
        * - eventCode
        * - log
        * - originatingParty
        * - promptSetId
        * - sessionId
        * - tags
        *
        * - clientId
        * - sessionId
        * - event
        * - destinationParty
        * - originatingParty
        *
        *
        */

        /* Date and Time  | Destination Party | Client | Prompt Set | Event Code | Call Duration | Originating Party | Customer Response Code | Actions*/
        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'edrTimestamp',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.Timestamp',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'destinationParty',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.DestAddress',
                    filter: {name: 'SipNumberFilter'}
                },
                {
                    fieldName: 'clientId',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.Client'
                },
                {
                    fieldName: 'originatingParty',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.OrigAddress',
                    filter: {name: 'SipNumberFilter'}

                },
                {
                    fieldName: 'promptSetId',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.PromptSet'
                },
                {
                    fieldName: 'eventCode',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.Event'
                },
                {
                    fieldName: 'duration',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.CallDuration',
                    filter: {name: 'Divide', params: [1000,0]}

                },
                {
                    fieldName: 'customerResponse',
                    headerKey: 'Products.OIVR.Troubleshooting.TableColumns.CustomerResponse'
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

                if (params.settings().$scope.askService) {
                    GeneralESService.findOIVRHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.activityHistory.showTable = true;

                        $scope.activityHistory.list = response.hits.hits;

                        // Show reasonContext + Reason
                        _.each($scope.activityHistory.list, function (record) {
                            record._source.cdrTypeText = $filter('SmsfEDRTypeFilter')(record._source.cdrType) + ' [' + record._source.cdrType + ']';
                            record._source.reasonText = (record._source.result > 0 ? $filter('SmsfEDRResultReasonFilter')(record._source.reasonContext, record._source.reason, record._source.subReason) : '');
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
                "_source.edrTimestamp": 'asc'
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
                templateUrl: 'products/oivr/troubleshooting/troubleshooting.edr.history.html',
                size: 'xlg',
                resolve: {
                    exportOptions: function () {
                        return $scope.exportOptions;
                    },
                    edrHistory: function () {
                        return GeneralESService.findOIVRDetailedHistory(edrRecord.sessionId); // TODO: Clarify actions
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
                templateUrl: 'products/oivr/troubleshooting/troubleshooting.edr.detail.html',
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
                record.cdrTypeText = $filter('SmsfEDRTypeFilter')(record.cdrType) + ' [' + record.cdrType + ']';
                record.reasonText = (record.result > 0 ? $filter('SmsfEDRResultReasonFilter')(record.reasonContext, record.reason, record.subReason) : '');

            });

            return list;
        };

    });

})();
