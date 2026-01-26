(function () {

    'use strict';

    angular.module('adminportal.products.dcb.troubleshooting', []);

    var DcbTroubleshootingModule = angular.module('adminportal.products.dcb.troubleshooting');

    DcbTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.dcb.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "products/dcb/troubleshooting/troubleshooting.html",
            controller: 'DcbTroubleshootingCtrl',
            data: {
                permissions: [
                    'ALL__TROUBLESHOOTING_READ'
                ]
            },
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                }
            }
        });

    });

    DcbTroubleshootingModule.controller('DcbTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, $uibModal, Restangular, UtilService, DateTimeConstants,
                                                                            GeneralESService, ReportingExportService, services) {
        $log.debug('DcbTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.filterFormLayer = {
            isFilterFormOpen: true
        };

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['organization.name']);

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
                msisdn: dateFilter.msisdn,
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
            $scope.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('DcbTroubleshootingTableCtrl', {$scope: $scope});
        $controller('DcbTroubleshootingRefundHistoryCtrl', {$scope: $scope});
    });

    DcbTroubleshootingModule.controller('DcbTroubleshootingTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                 AuthorizationService, UtilService, GeneralESService, DateTimeConstants,
                                                                                 TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('DcbTroubleshootingTableCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'chargeDate',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'channel',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Channel'
                },
                {
                    fieldName: 'msisdn',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Msisdn'
                },
                {
                    fieldName: 'serviceName',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ServiceName'
                },
                {
                    fieldName: 'requestId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RequestId'
                },
                {
                    fieldName: 'clientTransactionId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ClientTransactionId'
                },
                {
                    fieldName: 'uuid',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.UUID'
                },
                {
                    fieldName: 'amount',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Amount',
                    filter: {name: 'number', params: [2]}
                },
                {
                    fieldName: 'currency',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Currency'
                },
                {
                    fieldName: 'cdrType',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.CdrType'
                },
                {
                    fieldName: 'errorCode',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'errorMessage',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ErrorMessage'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.TransactionId'
                },
                {
                    fieldName: 'clientCorrelator',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ClientCorrelator'
                },
                {
                    fieldName: 'productDescription',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ProductDescription'
                },
                {
                    fieldName: 'taxAmount',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.TaxAmount',
                    filter: {name: 'number', params: [2]}
                },
                {
                    fieldName: 'accountNumber',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.AccountNumber'
                },
                {
                    fieldName: 'refType',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefType'
                },
                {
                    fieldName: 'account',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Account'
                },
                {
                    fieldName: 'merchantId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.MerchantId'
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
                if (params.settings().$scope.askService) {
                    GeneralESService.findDcbRecords(filter, additionalFilterFields).then(function (response) {
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
                    $scope.activityHistory.list = $scope.filterFields(response.hits.hits);

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
                templateUrl: 'products/dcb/troubleshooting/troubleshooting.edr.details.html',
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

    DcbTroubleshootingModule.controller('DcbTroubleshootingRefundHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                         GeneralESService, DateTimeConstants) {
        $log.debug('DcbTroubleshootingRefundHistoryCtrl');

        $scope.refundHistoryExportOptions = {
            columns: [
                {
                    fieldName: 'refundDate',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'channel',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Channel'
                },
                {
                    fieldName: 'requestId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundRequestId'
                },
                {
                    fieldName: 'clientTransactionId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundClientTransactionId'
                },
                {
                    fieldName: 'uuid',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.CarrierRefundTransactionId'
                },
                {
                    fieldName: 'partial',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Partial',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'amount',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundAmount',
                    filter: {name: 'number', params: [2]}
                },
                {
                    fieldName: 'currency',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Currency'
                },
                {
                    fieldName: 'cdrType',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.CdrType'
                },
                {
                    fieldName: 'errorCode',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'errorMessage',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ErrorMessage'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundTransactionId'
                },
                {
                    fieldName: 'clientCorrelator',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundClientCorrelator'
                },
                {
                    fieldName: 'chargeTransactionId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundChargeTransactionId'
                },
                {
                    fieldName: 'productDescription',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.ProductDescription'
                },
                {
                    fieldName: 'reason',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.RefundReason'
                },
                {
                    fieldName: 'merchantId',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.MerchantId'
                },
                {
                    fieldName: 'silent',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Silent',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'reverse',
                    headerKey: 'Products.DirectCarrierBilling.Troubleshooting.TableColumns.Reverse',
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
                templateUrl: 'products/dcb/troubleshooting/troubleshooting.edr.refundhistory.html',
                controller: function ($scope, $filter, $uibModalInstance, bmsEdrs, edrRecord, edrType, refundHistoryDetailedHistoryList,
                                      refundHistoryExportOptions) {
                    edrRecord.rowSelected = true;

                    $scope.pageHeaderKey = 'Products.DirectCarrierBilling.Troubleshooting.RefundHistory.PageHeader';

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
                    refundHistoryExportOptions: function() {
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
