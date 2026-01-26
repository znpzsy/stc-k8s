(function () {

    'use strict';

    angular.module('ccportal.products.antispamsms.troubleshooting', []);

    var AntiSpamSMSTroubleshootingModule = angular.module('ccportal.products.antispamsms.troubleshooting');

    AntiSpamSMSTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.troubleshooting', {
            abstract: true,
            url: "/troubleshooting",
            templateUrl: "products/antispamsms/troubleshooting/troubleshooting.html"
        }).state('products.antispamsms.troubleshooting.edr', {
            abstract: true,
            url: "",
            templateUrl: 'products/antispamsms/troubleshooting/troubleshooting.edr.html',
            controller: 'AntiSpamSMSTroubleshootingCtrl'
        }).state('products.antispamsms.troubleshooting.edr.view', {
            url: "",
            templateUrl: 'products/antispamsms/troubleshooting/troubleshooting.edr.list.html'
        });

    });

    AntiSpamSMSTroubleshootingModule.controller('AntiSpamSMSTroubleshootingCtrl', function ($scope, $log, $q, $filter, $controller, $timeout, notification, $translate, $uibModal, NgTableParams, ReportingExportService,
                                                                                            SMS_ANTISPAM_TRAFFIC_TYPES, SMS_ANTISPAM_OP_REJECT_REASONS, GeneralESService, UtilService, DateTimeConstants,
                                                                                            TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('AntiSpamSMSTroubleshootingCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.SMS_ANTISPAM_TRAFFIC_TYPES = SMS_ANTISPAM_TRAFFIC_TYPES;
        $scope.SMS_ANTISPAM_OP_REJECT_REASONS = SMS_ANTISPAM_OP_REJECT_REASONS;

        $scope.filterFormLayer = {
            isFilterFormOpen: false
        };

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
                origMsisdn: dateFilter.origMsisdn,
                destMsisdn: dateFilter.destMsisdn,
                trafficType: dateFilter.trafficType,
                sccpCalling: dateFilter.sccpCalling,
                opRejectReason: dateFilter.opRejectReason,
                opContentFilter: dateFilter.opContentFilter
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
            $scope.reloadTable($scope.edrList.tableParams);
        }, 500);

        $scope.filterTable = _.debounce(function (text, columns) {
            $scope.edrList.tableParams.settings().$scope.quickSearchText = text;
            $scope.edrList.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.edrList.tableParams);
        }, 750);

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item._source;

                record.cdrTypeText = $filter('AntiSpamSMSEDRTypeFilter')(record.cdrType) + ' [' + record.cdrType + ']';
                record.trafficTypeText = $filter('AntiSpamSMSTrafficTypeFilter')(record.trafficType);
                record.opRejectReasonText = $filter('AntiSpamSMSOpRejectReasonFilter')(record.opRejectReason);
                record.opRejectMethodText = $filter('AntiSpamSMSOpRejectMethodFilter')(record.opRejectMethod);
                record.opErrorCodeText = $filter('AntiSpamSMSOpErrorCodeFilter')(record.opErrorCode);

                record.concatInfo = ((record.opPartCurrent === null) ? ((record.trafficType === 31) ? '' : '1/1') : record.opPartCurrent + '/' + record.opPartTotal + (record.opPartTotal > 1 ? ' [' + record.opPartRef + ']' : ''));
            });

            return list;
        };

        // AntiSpamSMS edr list
        $scope.edrList = {
            list: [],
            showTable: true,
            tableParams: {}
        };

        var exportEdrs = function (mimeType) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.edrList.tableParams);

            var bodyPayload = GeneralESService.prepareMainEdrQueryPayload(preparedFilter.filter, 'date', preparedFilter.additionalFilterFields);
            var bodyPayloadStr = JSON.stringify(bodyPayload).replace(/\+/g, '%2b');

            var srcUrl = '/smsantispam-es-adapter-local-rest/elastic-search-adapter/sms-as/_export';
            srcUrl += '?response-content-type=' + mimeType;
            srcUrl += '&query=' + encodeURIComponent(bodyPayloadStr);

            $log.debug('Downloading SMS AntiSpam Records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

        $scope.exportEdrs = function (mimeType) {
            if ($scope.edrList.tableParams.total() > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
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
                    exportEdrs(mimeType);
                }, function () {
                    // ignored
                });
            } else {
                // Export directly since total count lesser than the limit.
                exportEdrs(mimeType);
            }
        };

        $scope.edrList.tableParams = new NgTableParams({
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
                GeneralESService.findSMSAntiSpamMainEdrs(filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.edrList.showTable = true;

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    if (response) {
                        $scope.edrList.list = $scope.filterFields(response.hits.hits);

                        // Showing a notification about the real data count if taken data count lesser than the actual.
                        if (response.realCount > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.AntiSpamSMS.Troubleshooting.MessageContent.ExceededRecordCountLimit', {
                                    count: response.realCount,
                                    limit: TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION
                                })
                            });
                        }

                        params.total(response.hits.total);
                        $defer.resolve($scope.edrList.list);
                    } else {
                        params.total(0);
                        $defer.resolve([]);
                    }
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - AntiSpamSMS edr list

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/antispamsms/troubleshooting/troubleshooting.edr.details.html',
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

        // Message content modal window.
        $scope.showMessageContent = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/antispamsms/troubleshooting/troubleshooting.edr.messagecontent.html',
                controller: function ($scope, $uibModalInstance, edrRecord, $sce, entireMsgContent) {
                    edrRecord.rowSelected = true;

                    $scope.isEntireMessage = false;
                    $scope.edrRecord = edrRecord;

                    entireMsgContent = $sce.trustAsHtml(entireMsgContent);
                    var msgContent = $sce.trustAsHtml($scope.edrRecord.msgContent);

                    $scope.msgContent = msgContent;
                    $scope.toggleEntireMessage = function () {
                        $scope.isEntireMessage = !$scope.isEntireMessage;
                        $scope.msgContent = ($scope.isEntireMessage ? entireMsgContent : msgContent);
                    };

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord;
                    },
                    entireMsgContent: function ($q, $log, notification, $translate, GeneralESService) {
                        var deferred = $q.defer();

                        if (s.toNumber(edrRecord.opPartTotal) === 1 || edrRecord.opPartTotal === null) {
                            deferred.resolve(edrRecord.msgContent);
                        } else {
                            var promise = GeneralESService.findSMSAntiSpamMessageParts(edrRecord.origMsisdn, edrRecord.destMsisdn, edrRecord.opPartRef);
                            promise.then(function (response) {
                                var messageContent = '';

                                var messageTransactions = response.hits.hits;

                                for (var i = 0; i < s.toNumber(edrRecord.opPartTotal); ++i) {
                                    var opPartCurrent = i + 1;
                                    var messageTransaction = _.find(messageTransactions, function (messageTransaction) {
                                        return s.toNumber(messageTransaction._source.opPartCurrent) === opPartCurrent;
                                    });

                                    if (_.isUndefined(messageTransaction)) {
                                        $log.error('Message part ', opPartCurrent, ' not found!');
                                    } else {
                                        $log.debug('Message parts: PartRef: ', edrRecord.opPartRef, ', PartTotal: ', edrRecord.opPartTotal, ', PartCurrent: ', opPartCurrent, ', MsgContent: ', messageTransaction._source.msgContent);

                                        // highlight if the part is current.
                                        if (s.toNumber(messageTransaction._source.opPartCurrent) === s.toNumber(edrRecord.opPartCurrent)) {
                                            messageContent += '<span class="message-part-mark">' + messageTransaction._source.msgContent + '</span>';
                                        } else {
                                            messageContent += messageTransaction._source.msgContent;
                                        }
                                    }
                                }

                                deferred.resolve(messageContent)
                            });
                        }

                        return deferred.promise;
                    }
                }
            });

            modalInstance.result.then(function () {
                edrRecord.rowSelected = false;
            }, function () {
                edrRecord.rowSelected = false;
            });
        };

        $controller('AntiSpamSMSTroubleshootingHistoryCtrl', {$scope: $scope});
    });

    AntiSpamSMSTroubleshootingModule.controller('AntiSpamSMSTroubleshootingHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams) {
        $log.debug('AntiSpamSMSTroubleshootingHistoryCtrl');

        // SMSC detail history list
        var smsAntiSpamEdrHistoryList = {
            list: [],
            tableParams: {}
        };
        smsAntiSpamEdrHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.date": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(smsAntiSpamEdrHistoryList.list, params.orderBy()) : smsAntiSpamEdrHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMSC detail history list

        // History modal window.
        $scope.showHistory = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/antispamsms/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $uibModalInstance, smsAntiSpamEdrs, edrRecord, smsAntiSpamEdrHistoryList, exportOptions,
                                      filterFields, showDetails, showMessageContent) {
                    $scope.historyExportOptions = exportOptions;

                    $scope.edrRecord = edrRecord;
                    $scope.showDetails = showDetails;
                    $scope.showMessageContent = showMessageContent;

                    $scope.smsAntiSpamEdrHistoryList = smsAntiSpamEdrHistoryList;
                    $scope.smsAntiSpamEdrHistoryList.list = filterFields(smsAntiSpamEdrs.hits.hits);

                    $scope.smsAntiSpamEdrHistoryList.tableParams.page(1);
                    $scope.smsAntiSpamEdrHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    smsAntiSpamEdrs: function (GeneralESService) {
                        return GeneralESService.findSMSAntiSpamHistoricalEdrs(edrRecord.cdrKey);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    smsAntiSpamEdrHistoryList: function () {
                        return smsAntiSpamEdrHistoryList;
                    },
                    exportOptions: function () {
                        return $scope.exportOptions;
                    },
                    filterFields: function () {
                        return $scope.filterFields;
                    },
                    showDetails: function () {
                        return $scope.showDetails;
                    },
                    showMessageContent: function () {
                        return $scope.showMessageContent;
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
