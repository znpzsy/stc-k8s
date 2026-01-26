(function () {

    'use strict';

    angular.module('adminportal.products.charginggw.troubleshooting', []);

    var ChargingGwTroubleshootingModule = angular.module('adminportal.products.charginggw.troubleshooting');

    ChargingGwTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.charginggw.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "products/charginggw/troubleshooting/troubleshooting.html",
            controller: 'ChargingGwTroubleshootingCtrl',
            data: {
                permissions: [
                    'ALL__TROUBLESHOOTING_READ'
                ]
            },
            resolve: {
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(false, true, [CMPFService.OPERATOR_PROFILE]);
                },
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                },
                offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOffers();
                }
            }
        });

    });

    ChargingGwTroubleshootingModule.controller('ChargingGwTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, $uibModal, $translate, Restangular, UtilService, DateTimeConstants,
                                                                                          TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION, GeneralESService, ReportingExportService, organizations,
                                                                                          services, offers) {
        $log.debug('ChargingGwTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.filterFormLayer = {
            isFilterFormOpen: true
        };

        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.organizationList = $filter('orderBy')(organizationList, ['name']);

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['organization.name']);

        var offerList = Restangular.stripRestangular(offers).offers;
        $scope.offerList = $filter('orderBy')(offerList, ['name']);

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

        var exportAllData = function (fileNamePrefix, exporter) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.activityHistory.tableParams);

            var filter = preparedFilter.filter;
            // Set the offset and limit to reasonable numbers.
            filter.offset = 0;
            filter.limit = TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION;

            var additionalFilterFields = preparedFilter.additionalFilterFields;

            GeneralESService.findChargingGwRecords(filter, additionalFilterFields).then(function (response) {
                var exportingDataList = $scope.filterFields(response.hits.hits);
                exportingDataList = $filter('orderBy')(exportingDataList, '_source.date', true);

                exporter.download(fileNamePrefix, exportingDataList);
            });
        };

        $scope.exportAllData = function (fileNamePrefix, exporter) {
            var total = $scope.activityHistory.tableParams.total();
            if (total > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
                // Ask for download since record count exceeds the limit.
                var modalInstance = $uibModal.open({
                    templateUrl: 'partials/modal/modal.confirmation.html',
                    controller: function ($scope, $sce, $uibModalInstance, $translate) {
                        var messageText = $translate.instant('CommonMessages.MaxRecordCountExceededForExport', {'max': TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION});
                        $scope.confirmationMessage = $sce.trustAsHtml(messageText);

                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    size: 'md'
                });

                modalInstance.result.then(function () {
                    // Export according to response taken from the confirmation modal.
                    exportAllData(fileNamePrefix, exporter);
                }, function () {
                    // ignored
                });
            } else {
                // Export directly since total count lesser than the limit.
                exportAllData(fileNamePrefix, exporter);
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
                serviceId: dateFilter.serviceId
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
        $controller('ChargingGwTroubleshootingTableCtrl', {$scope: $scope});
    });

    ChargingGwTroubleshootingModule.controller('ChargingGwTroubleshootingTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                               AuthorizationService, UtilService, GeneralESService, DateTimeConstants,
                                                                                               TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('ChargingGwTroubleshootingTableCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'date',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'msisdn',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Msisdn'
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.OrganizationName'
                },
                {
                    fieldName: 'serviceName',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.ServiceName'
                },
                {
                    fieldName: 'offerName',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.OfferName'
                },
                {
                    fieldName: 'amount',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Amount',
                    filter: {name: 'number', params: [0]}
                },
                {
                    fieldName: 'currencyText',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Currency'
                },
                {
                    fieldName: 'unit',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Unit',
                    filter: {name: 'ChargingGwPriceUnitFilter'}
                },
                {
                    fieldName: 'errorCodeText',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.ErrorCode'
                },
                {
                    fieldName: 'eventText',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Event'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.TransactionId'
                },
                {
                    fieldName: 'clientCorrelator',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.ClientCorrelator'
                },
                {
                    fieldName: 'channel',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Channel'
                },
                {
                    fieldName: 'description',
                    headerKey: 'Products.ChargingGw.Troubleshooting.TableColumns.Description'
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
                "date": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findChargingGwRecords(filter, additionalFilterFields).then(function (response) {
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

                    // Showing a notification about the real data count if taken data count lesser than the actual.
                    if (response.realCount > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION & filter.offset === 0) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ExceededRecordCountLimit', {
                                count: response.realCount,
                                limit: TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION
                            })
                        });
                    }

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

                var organization = _.findWhere($scope.organizationList, {id: Number(record.providerId)});
                record.organizationName = organization ? organization.name + ' [' + record.providerId + ']' : record.providerId;

                var offer = _.findWhere($scope.offerList, {id: Number(record.offerId)});
                record.offerName = offer ? offer.name + ' [' + record.offerId + ']' : record.offerId;

                record.errorCodeText = $filter('ChargingGwErrorCodeFilter')(record.errorCode) + ' [' + record.errorCode + ']';
                record.eventText = $filter('ChargingGwEventFilter')(record.event) + ' [' + record.event + ']';

                record.currencyText = (record.unit === 1 ? $scope.CURRENCY.coin : '');
            });

            return list;
        };

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/charginggw/troubleshooting/troubleshooting.edr.details.html',
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

        // Refund method
        $scope.refund = function (selectedEdrRecord) {
            $log.debug('Charging record item: ', selectedEdrRecord);

            var modalInstance = $uibModal.open({
                templateUrl: 'products/charginggw/troubleshooting/troubleshooting.edr.refundconfirmation.modal.html',
                size: 'lg',
                controller: 'ChargingGwTroubleshootingRefundModalCtrl',
                resolve: {
                    selectedEdrRecord: function () {
                        return selectedEdrRecord;
                    },
                    chargingRefunds: function ($q, $translate, notification, ChargingGwService) {
                        var deferred = $q.defer();

                        ChargingGwService.getRefundRecords(selectedEdrRecord.transactionId).then(function (response) {
                            if (response.errorCode) {
                                $log.debug('Refund could not found with this debit transaction id ', selectedEdrRecord.transactionId, '. Response: ', response);

                                var message = (response.errorMsg ? response.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                                notification({
                                    type: 'warning',
                                    text: message
                                });

                                deferred.reject(response);
                            } else {
                                deferred.resolve(response)
                            }
                        }, function (response) {
                            $log.debug('Refund could not found with this debit transaction id ', selectedEdrRecord.transactionId, '. Response: ', response);

                            if (response.data.errorCode) {
                                var message = (response.data.errorMsg ? response.data.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                                notification({
                                    type: 'warning',
                                    text: message
                                });
                            } else {
                                deferred.resolve(response)
                            }

                            deferred.reject(response);
                        });

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function (resultEdrRecord) {
                selectedEdrRecord.rowSelected = false;
            }, function () {
                selectedEdrRecord.rowSelected = false;
            });
        };
    });

    ChargingGwTroubleshootingModule.controller('ChargingGwTroubleshootingRefundModalCtrl', function ($scope, $log, notification, $translate, $filter, $uibModal, $uibModalInstance, NgTableParams, NgTableService, Restangular,
                                                                                                     AuthorizationService, DateTimeConstants, UtilService, ChargingGwService, selectedEdrRecord, chargingRefunds) {
        $log.debug('ChargingGwTroubleshootingRefundModalCtrl');

        var username = UtilService.getFromSessionStore(UtilService.USERNAME_KEY);

        $scope.selectedEdrRecord = selectedEdrRecord;
        $scope.selectedEdrRecord.rowSelected = true;

        $scope.sumAmount = new Decimal(0);
        $scope.totalAmount = new Decimal($scope.selectedEdrRecord.amount);

        $scope.chargingRefund = {};

        var prepareChargingRefundList = function (chargingRefundList) {
            $scope.sumAmount = new Decimal(0);

            _.each(chargingRefundList, function (chargingRefund) {
                chargingRefund.amount = chargingRefund.amount ? new Decimal(chargingRefund.amount) : new Decimal(0);
                // Unit 1 is meaning MONEY unit type.
                chargingRefund.amountText = chargingRefund.amount + (chargingRefund.unit === 1 ? ' ' + $scope.CURRENCY.coin : '');

                // Calculate the total amount value
                $scope.sumAmount = $scope.sumAmount.plus(chargingRefund.amount);
            });
            // Calculated the remained amount.
            $scope.remainedAmount = $scope.totalAmount.minus($scope.sumAmount);

            return chargingRefundList;
        };

        var chargingRefundList = prepareChargingRefundList(Restangular.stripRestangular(chargingRefunds));

        var reloadRefundRecords = function (transactionId, isResetForm) {
            ChargingGwService.getRefundRecords(transactionId).then(function (response) {
                var chargingRefundList = prepareChargingRefundList(Restangular.stripRestangular(response));

                // Assign the new list and refresh the table.
                $scope.chargingRefundList.list = chargingRefundList;

                $scope.chargingRefundList.tableParams.page(1);
                $scope.chargingRefundList.tableParams.reload();

                if (isResetForm) {
                    $scope.resetRefundForm();
                }
            }, function (response) {
                $log.debug('Cannot find refund records: ', response);
            });
        };

        $scope.resetRefundForm = function () {
            if ($scope.form) {
                $scope.form.$setPristine();
            }

            var description = $translate.instant('Products.ChargingGw.Troubleshooting.Refund.Description', {
                timestamp: $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss.sss", DateTimeConstants.OFFSET),
                username: username
            });
            $scope.chargingRefund.description = description;

            delete $scope.chargingRefund.amount;
        };

        $scope.resetRefundForm();

        // Charging refund list of current scope definitions
        $scope.chargingRefundList = {
            list: chargingRefundList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.chargingRefundList.tableParams.settings().$scope.filterText = filterText;
            $scope.chargingRefundList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.chargingRefundList.tableParams.page(1);
            $scope.chargingRefundList.tableParams.reload();
        }, 500);

        $scope.chargingRefundList.tableParams = new NgTableParams({
            page: 1,
            count: 5,
            sorting: {
                "date": 'desc'
            }
        }, {
            total: $scope.chargingRefundList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.chargingRefundList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.chargingRefundList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Charging refund list of current scope definitions

        // Calculates the showing remaining amount.
        $scope.calculateRemainedAmount = function (remainedAmount, amount) {
            return remainedAmount.minus(amount).valueOf();
        };

        $scope.refund = function (selectedEdrRecord, chargingRefund) {
            var chargingRefundItem = {
                "amount": chargingRefund.amount,
                "description": chargingRefund.description,
                "debitTransactionId": selectedEdrRecord.transactionId,
                "unit": Number(selectedEdrRecord.unit),
                "clientCorrelator": 'csp_adminportal_' + UtilService.getCurrentNanoTime()
            };

            if (AuthorizationService.canAllChargingRefund() && selectedEdrRecord.amount && Number(selectedEdrRecord.amount) > 0 && chargingRefund.amount > 0) {
                var refundRequestDate = new Date();

                var confirmationModalInstance = $uibModal.open({
                    templateUrl: 'partials/modal/modal.confirmation.html',
                    controller: function ($scope, $uibModalInstance, $controller, $sce, $translate) {
                        var message = $translate.instant('Products.ChargingGw.Troubleshooting.Refund.RefundConfirmationMessage', {
                            amount: chargingRefund.amount,
                            currency: (selectedEdrRecord.unit === 1 ? $scope.CURRENCY.coin : ''),
                            transactionId: selectedEdrRecord.transactionId
                        });
                        $scope.confirmationMessage = $sce.trustAsHtml(message);

                        $controller('ConfirmationModalInstanceCtrl', {
                            $scope: $scope,
                            $uibModalInstance: $uibModalInstance
                        });
                    }
                });

                confirmationModalInstance.result.then(function () {
                    ChargingGwService.refund(selectedEdrRecord.serviceId, chargingRefundItem).then(function (response) {
                        // Assign response to the record which is refunded so to be able to show updated refund information on the details table after refund operation.
                        var refundedRecord = Restangular.stripRestangular(response);

                        if (refundedRecord.errorCode) {
                            $log.debug('Error ocurred while refund operation with this debit transaction id ', selectedEdrRecord.transactionId, '. Response: ', response);

                            reloadRefundRecords(selectedEdrRecord.transactionId, false);

                            var message = (refundedRecord.errorMsg ? refundedRecord.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                            notification({
                                type: 'warning',
                                text: message
                            });
                        } else {
                            $log.debug('Charging with this debit transaction id ', selectedEdrRecord.transactionId, ' has been refunded. Response: ', response);

                            reloadRefundRecords(selectedEdrRecord.transactionId, true);

                            notification({
                                type: 'success',
                                text: $translate.instant('Products.ChargingGw.Troubleshooting.Refund.RefundedSuccessfully', {
                                    amount: refundedRecord.amount,
                                    currency: (selectedEdrRecord.unit === 1 ? $scope.CURRENCY.coin : ''),
                                    transactionId: refundedRecord.transactionId,
                                    timestamp: $filter('date')(refundRequestDate, 'yyyy-MM-dd\'T\'HH:mm:ss', DateTimeConstants.OFFSET)
                                })
                            });
                        }
                    }, function (response) {
                        $log.debug('Error when refunding a charging record: ', chargingRefundItem, ', Response: ', response);

                        if (response.data.errorCode) {
                            var message = (response.data.errorMsg ? response.data.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                            notification({
                                type: 'warning',
                                text: message
                            });
                        }

                        reloadRefundRecords(selectedEdrRecord.transactionId, false);
                    });
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            }
            else {
                $log.debug('Item is not refundable ', selectedEdrRecord.transactionId, '.');

                notification({
                    type: 'warning',
                    text: $translate.instant('Products.ChargingGw.Troubleshooting.Refund.ItemIsNotRefundable', {transactionId: selectedEdrRecord.transactionId})
                });
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

})();
