(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.activityhistory.dcbhistory', []);

    var ActivityHistoryDCBHistoryModule = angular.module('ccportal.subscriber-info.activityhistory.dcbhistory');

    ActivityHistoryDCBHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.activityhistory.dcbhistory', {
            url: "/dcb-history",
            templateUrl: "subscriber-info/activity-history/dcbhistory/troubleshooting.html",
            controller: 'ActivityHistoryDCBHistoryCtrl',
            data: {
                permissions: [
                    'CC__CHARGING_READ'
                ]
            },
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                }
            }
        });

    });

    ActivityHistoryDCBHistoryModule.controller('ActivityHistoryDCBHistoryCtrl', function ($scope, $log, $controller, $timeout, $filter, $uibModal, Restangular, UtilService, DateTimeConstants,
                                                                                          GeneralESService, ReportingExportService, services) {
        $log.debug('ActivityHistoryDCBHistoryCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.dateFilter.startDate = $scope.getOneWeekAgo();
        $scope.dateFilter.startTime = $scope.getOneWeekAgo();

        $scope.filterFormLayer = {
            isFilterFormOpen: true
        };

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['organization.name']);

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
                serviceId: dateFilter.serviceId,
                cdrType: dateFilter.cdrType
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
        $controller('ActivityHistoryDCBHistoryTableCtrl', {$scope: $scope});
        $controller('ActivityHistoryDCBHistoryRefundHistoryCtrl', {$scope: $scope});
    });

    ActivityHistoryDCBHistoryModule.controller('ActivityHistoryDCBHistoryTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                               AuthorizationService, UtilService, GeneralESService, DateTimeConstants,
                                                                                               TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('ActivityHistoryDCBHistoryTableCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'chargeDate',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'channel',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Channel'
                },
                {
                    fieldName: 'serviceName',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ServiceName'
                },
                {
                    fieldName: 'requestId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ChargeRequestId'
                },
                {
                    fieldName: 'clientTransactionId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ClientTransactionId'
                },
                {
                    fieldName: 'uuid',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.UUID'
                },
                {
                    fieldName: 'amount',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Amount',
                    filter: {name: 'number', params: [2]}
                },
                {
                    fieldName: 'currency',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Currency'
                },
                {
                    fieldName: 'cdrType',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.CdrType'
                },
                {
                    fieldName: 'errorCode',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'errorMessage',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ErrorMessage'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.TransactionId'
                },
                {
                    fieldName: 'clientCorrelator',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ClientCorrelator'
                },
                {
                    fieldName: 'productDescription',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ProductDescription'
                },
                {
                    fieldName: 'taxAmount',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.TaxAmount',
                    filter: {name: 'number', params: [2]}
                },
                {
                    fieldName: 'accountNumber',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.AccountNumber'
                },
                {
                    fieldName: 'refType',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefType'
                },
                {
                    fieldName: 'account',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Account'
                },
                {
                    fieldName: 'merchantId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.MerchantId'
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
            page: 1,
            count: 10,
            sorting: {
                "chargeDate": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                GeneralESService.findDcbRecords(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.activityHistory.list = $scope.filterFields(response.hits.hits);

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

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item._source;

                var service = _.findWhere($scope.serviceList, {id: Number(record.serviceId)});
                record.serviceName = service ? service.name + ' [' + record.serviceId + ']' : record.serviceId;
            });

            return list;
        };

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subscriber-info/activity-history/dcbhistory/troubleshooting.edr.details.html',
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
    });

    ActivityHistoryDCBHistoryModule.controller('ActivityHistoryDCBHistoryRefundHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                       GeneralESService, DateTimeConstants) {
        $log.debug('ActivityHistoryDCBHistoryRefundHistoryCtrl');

        $scope.refundHistoryExportOptions = {
            columns: [
                {
                    fieldName: 'refundDate',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'channel',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Channel'
                },
                {
                    fieldName: 'requestId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundRequestId'
                },
                {
                    fieldName: 'clientTransactionId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundClientTransactionId'
                },
                {
                    fieldName: 'uuid',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.CarrierRefundTransactionId'
                },
                {
                    fieldName: 'partial',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Partial',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'amount',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundAmount',
                    filter: {name: 'number', params: [2]}
                },
                {
                    fieldName: 'currency',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Currency'
                },
                {
                    fieldName: 'cdrType',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.CdrType'
                },
                {
                    fieldName: 'errorCode',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'errorMessage',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ErrorMessage'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundTransactionId'
                },
                {
                    fieldName: 'clientCorrelator',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundClientCorrelator'
                },
                {
                    fieldName: 'chargeTransactionId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundChargeTransactionId'
                },
                {
                    fieldName: 'productDescription',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.ProductDescription'
                },
                {
                    fieldName: 'reason',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.RefundReason'
                },
                {
                    fieldName: 'merchantId',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.MerchantId'
                },
                {
                    fieldName: 'silent',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Silent',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'reverse',
                    headerKey: 'SubscriberInfo.DCB.Troubleshooting.TableColumns.Reverse',
                    filter: {name: 'YesNoFilter'}
                }
            ]
        };

        // Bulk Messaging detail history list
        var refundHistoryDetailedHistoryList = {
            list: [],
            tableParams: {}
        };
        refundHistoryDetailedHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.refundDate": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(refundHistoryDetailedHistoryList.list, params.orderBy()) : refundHistoryDetailedHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Bulk Messaging detail history list

        // History modal window.
        $scope.showRefundHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subscriber-info/activity-history/dcbhistory/troubleshooting.edr.refundhistory.html',
                controller: function ($scope, $filter, $uibModalInstance, bmsEdrs, edrRecord, edrType, refundHistoryDetailedHistoryList,
                                      refundHistoryExportOptions) {
                    edrRecord.rowSelected = true;

                    $scope.pageHeaderKey = 'SubscriberInfo.DCB.Troubleshooting.RefundHistory.PageHeader';

                    $scope.refundHistoryExportOptions = refundHistoryExportOptions;

                    $scope.edrRecord = edrRecord;

                    $scope.refundHistoryDetailedHistoryList = refundHistoryDetailedHistoryList;

                    $scope.refundHistoryDetailedHistoryList.list = $filter('orderBy')(bmsEdrs.hits.hits, '_source.transactionTimestamp');

                    $scope.refundHistoryDetailedHistoryList.tableParams.page(1);
                    $scope.refundHistoryDetailedHistoryList.tableParams.reload();

                    // Refund details shown in refund history modal window.
                    $scope.showRefundDetails = function (refundEdr) {
                        $scope.refundEdr = refundEdr;
                    };

                    $scope.hideRefundDetails = function () {
                        $scope.refundEdr = undefined;
                    };

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    bmsEdrs: function (GeneralESService) {
                        return GeneralESService.findDcbRefundHistory(edrRecord.uuid);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    edrType: function () {
                        return $scope.edrType;
                    },
                    refundHistoryDetailedHistoryList: function () {
                        return refundHistoryDetailedHistoryList;
                    },
                    refundHistoryExportOptions: function () {
                        return $scope.refundHistoryExportOptions;
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
