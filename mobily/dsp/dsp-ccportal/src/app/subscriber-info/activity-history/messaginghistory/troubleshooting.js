(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.activityhistory.messaginghistory', []);

    var ActivityHistoryMessagingHistoryModule = angular.module('ccportal.subscriber-info.activityhistory.messaginghistory');

    ActivityHistoryMessagingHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.activityhistory.messaginghistory', {
            abstract: true,
            url: "/messaging-history",
            templateUrl: "subscriber-info/activity-history/messaginghistory/troubleshooting.html",
            data: {
                permissions: [
                    'CC__MESSAGING_READ'
                ]
            }
        }).state('subscriber-info.activityhistory.messaginghistory.sms', {
            url: "/sms",
            views: {
                'filter-form': {
                    templateUrl: 'subscriber-info/activity-history/messaginghistory/troubleshooting.sms.filter.html',
                },
                'table': {
                    templateUrl: 'subscriber-info/activity-history/messaginghistory/troubleshooting.sms.html',
                    controller: 'ActivityHistoryMessagingHistorySMSCtrl',
                    resolve: {
                        services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                            return CMPFService.getAllServices(true);
                        }
                    }
                }
            }
        }).state('subscriber-info.activityhistory.messaginghistory.mms', {
            url: "/mms",
            views: {
                'filter-form': {
                    templateUrl: 'subscriber-info/activity-history/messaginghistory/troubleshooting.mms.filter.html',
                },
                'table': {
                    templateUrl: 'subscriber-info/activity-history/messaginghistory/troubleshooting.mms.html',
                    controller: 'ActivityHistoryMessagingHistoryMMSCtrl',
                    resolve: {
                        services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                            return CMPFService.getAllServices(true);
                        }
                    }
                }
            }
        });

    });

    ActivityHistoryMessagingHistoryModule.controller('ActivityHistoryMessagingHistoryCommonCtrl', function ($scope, $log, $q, $timeout, $filter, $controller, notification, $translate, $uibModal, NgTableParams,
                                                                                                            UtilService, DateTimeConstants, GeneralESService, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION,
                                                                                                            ReportingExportService, edrRecordsMethod) {
        $log.debug('ActivityHistoryMessagingHistoryCommonCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope.$parent});

        $scope.dateFilter.startDate = $scope.getOneWeekAgo();
        $scope.dateFilter.startTime = $scope.getOneWeekAgo();

        $scope.$parent.reloadTable = function (tableParams, _pageNumber) {
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

            GeneralESService[edrRecordsMethod](filter, additionalFilterFields).then(function (response) {
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
                msisdn: msisdn,
                startDate: startDateIso,
                endDate: endDateIso
            };

            result.additionalFilterFields = {
                // Calling Party
                origAgentType: dateFilter.origAgentType,
                origAgentId: (dateFilter.origAgentType === 1 && dateFilter.origAgent ? dateFilter.origAgent : undefined), // Is application and origAgent selected
                // Called Party
                destAgentType: dateFilter.destAgentType,
                destAgentId: (dateFilter.destAgentType === 1 && dateFilter.destAgent ? dateFilter.destAgent : undefined), // Is application and destAgent selected
                // Common
                result: (dateFilter.result ? dateFilter.result : undefined)
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

        $scope.$parent.throttledReloadTable = _.throttle(function () {
            $scope.$parent.reloadTable($scope.activityHistory.tableParams);
        }, 500);

        $scope.$parent.filterTable = _.debounce(function (text, columns) {
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.$parent.reloadTable($scope.activityHistory.tableParams);
        }, 500);

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
                var preparedFilter = $scope.prepareFilter($scope.$parent.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                GeneralESService[edrRecordsMethod](filter, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    deferredRecordsQuery.resolve(response);
                }, function (error) {
                    deferredRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    // Hide the filter form.
                    $scope.$parent.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    if (response && response.errorCode) {
                        $log.debug('Error: ', response);

                        params.total(0);
                        $defer.resolve([]);
                    } else {
                        $scope.activityHistory.list = $scope.filterFields(response.hits.hits);

                        // Showing a notification about the real data count if taken data count lesser than the actual and
                        // it is on the first page only.
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
                    }
                }, function (error) {
                    $log.debug('Error: ', error);

                    // Hide the filter form.
                    $scope.$parent.filterFormLayer.isFilterFormOpen = false;

                    $scope.activityHistory.showTable = true;

                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

        // Details modal window.
        $scope.showDetailsCommon = function (edrRecord, templateUrl) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: templateUrl,
                controller: function ($scope, $uibModalInstance, edrRecord) {
                    edrRecord.rowSelected = true;

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

        // Message delivery report modal window.
        $scope.showMessageDeliveryReportCommon = function (edrRecord, templateUrl, getDeliveryReportsMethod) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: templateUrl,
                controller: function ($scope, $uibModalInstance, edrRecord, deliveryReports) {
                    edrRecord.rowSelected = true;

                    $scope.edrRecord = edrRecord;

                    if (deliveryReports.hits.hits.length > 0) {
                        $scope.deliveryReport = deliveryReports.hits.hits[0]._source;
                    }

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord;
                    },
                    deliveryReports: function ($q, notification, $translate) {
                        var deferred = $q.defer();

                        getDeliveryReportsMethod(edrRecord.cdrKey).then(function (response) {
                            if (response && response.hits.total === 0) {
                                notification({
                                    type: 'warning',
                                    text: $translate.instant('Products.MessagingGw.Troubleshooting.MessageDeliveryReport.NotFound')
                                });
                                deferred.reject(response);
                            } else {
                                deferred.resolve(response);
                            }
                        }, function (response) {
                            deferred.reject(response);
                        });

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
    });

    ActivityHistoryMessagingHistoryModule.controller('ActivityHistoryMessagingHistorySMSCtrl', function ($scope, $log, $q, $filter, $controller, notification, $translate, $uibModal, Restangular, NgTableParams,
                                                                                                         GeneralESService, DateTimeConstants, MSGGW_SMSC_AGENT_TYPES, services) {
        $log.debug('ActivityHistoryMessagingHistorySMSCtrl');

        $scope.exportFileName = 'MessagingSMSRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'date',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'origAddress',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.OrigAddress'
                },
                {
                    fieldName: 'destAddress',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DestAddress'
                },
                {
                    fieldName: 'origAgentTypeText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.OrigAgentType'
                },
                {
                    fieldName: 'destAgentTypeText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DestAgentType'
                },
                {
                    fieldName: 'origAgentNameText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.OrigAgent'
                },
                {
                    fieldName: 'destAgentNameText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DestAgent'
                },
                {
                    fieldName: 'cdrTypeText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.CdrType'
                },
                {
                    fieldName: 'result',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.Result',
                    filter: {name: 'GeneralEDRResultFilter'}
                },
                {
                    fieldName: 'reasonText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.ReasonContext'
                },
                {
                    fieldName: 'cspTrxId',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.CspTrxId'
                },
                {
                    fieldName: 'msgLength',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.MsgLength'
                },
                {
                    fieldName: 'concatInfo',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.ConcatInfo'
                },
                {
                    fieldName: 'dcs',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.Dcs'
                },
                {
                    fieldName: 'drRequested',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DrRequested',
                    filter: {name: 'requestedFilter'}
                },
                {
                    fieldName: 'cdrKey',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.CdrKey'
                }
            ]
        };

        $scope.$parent.MSGGW_SMSC_AGENT_TYPES = MSGGW_SMSC_AGENT_TYPES;

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.$parent.allSMSCApplications = $filter('orderBy')(serviceList, ['organization.name']);

        $controller('ActivityHistoryMessagingHistoryCommonCtrl', {
            $scope: $scope,
            edrRecordsMethod: 'findMessagingGwSMSRecords'
        });

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item._source;

                record.concatInfo = record.partCurrent + '/' + record.partTotal + (record.partTotal > 1 ? ' [' + record.partRef + ']' : '');
                record.concatInfo = record.concatInfo === '0/0' ? '1/1' : record.concatInfo;

                record.cdrTypeText = $filter('MessagingGwEDRTypeFilter')(record.cdrType);

                record.reasonText = (record.result > 0 ? $filter('MessagingGwEDRResultReasonFilter')(record.reasonContext, record.reason) : '');

                record.origAgentNameText = record.origAgentName + ' [' + record.origAgentId + ']';
                record.destAgentNameText = record.destAgentName + ' [' + record.destAgentId + ']';

                record.origAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.origAgentType);
                record.destAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.destAgentType);

                record.drRequested = (String(record.drRequested) === 'true');
            });

            return list;
        };

        // Show details.
        $scope.showDetails = function (edrRecord) {
            $scope.showDetailsCommon(edrRecord, 'subscriber-info/activity-history/messaginghistory/troubleshooting.sms.edr.details.html');
        };

        // Message content modal window.
        $scope.showMessageContent = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subscriber-info/activity-history/messaginghistory/troubleshooting.sms.edr.messagecontent.html',
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

                        if (edrRecord.partTotal === 1) {
                            deferred.resolve(edrRecord.msgContent);
                        } else {
                            var promise;

                            // Search message parts in the records.
                            promise = GeneralESService.findMessagingGwSMSMessageParts(edrRecord.origAddress, edrRecord.destAddress, edrRecord.partRef, edrRecord.date);

                            promise.then(function (response) {
                                var messageContent = '';

                                var messageTransactions = (response.recordList || response.hits.hits);

                                for (var i = 0; i < edrRecord.partTotal; ++i) {
                                    var partCurrent = i + 1;
                                    var messageTransaction = _.find(messageTransactions, function (messageTransaction) {
                                        var messageTransactionRecord = (messageTransaction._source || messageTransaction);

                                        return messageTransactionRecord.partCurrent === partCurrent;
                                    });

                                    if (_.isUndefined(messageTransaction)) {
                                        $log.error('Message part ', partCurrent, ' not found!');
                                    } else {
                                        var messageTransactionRecord = (messageTransaction._source || messageTransaction);

                                        $log.debug('Message parts: PartRef: ', edrRecord.partRef, ', PartTotal: ', messageTransaction.partTotal, ', PartCurrent: ', partCurrent, ', MsgContent: ', messageTransactionRecord.msgContent);

                                        // highlight if the part is current.
                                        if (messageTransactionRecord.partCurrent === edrRecord.partCurrent) {
                                            messageContent += '<span class="mark">' + messageTransactionRecord.msgContent + '</span>';
                                        } else {
                                            messageContent += messageTransactionRecord.msgContent;
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

        // Show message delivery report.
        $scope.showMessageDeliveryReport = function (edrRecord) {
            $scope.showMessageDeliveryReportCommon(edrRecord, 'subscriber-info/activity-history/messaginghistory/troubleshooting.sms.edr.messagedeliveryreport.html', GeneralESService.findMessagingGwSMSDeliveryReports);
        };
    });

    ActivityHistoryMessagingHistoryModule.controller('ActivityHistoryMessagingHistoryMMSCtrl', function ($scope, $log, $q, $filter, $controller, notification, $translate, $uibModal, Restangular, NgTableParams,
                                                                                                         GeneralESService, DateTimeConstants, MSGGW_MMSC_AGENT_TYPES, services) {
        $log.debug('ActivityHistoryMessagingHistoryMMSCtrl');

        $scope.exportFileName = 'MessagingMMSRecords';

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'date',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'origAddress',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.OrigAddress'
                },
                {
                    fieldName: 'destAddress',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DestAddress'
                },
                {
                    fieldName: 'origAgentTypeText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.OrigAgentType'
                },
                {
                    fieldName: 'destAgentTypeText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DestAgentType'
                },
                {
                    fieldName: 'origAgentNameText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.OrigAgent'
                },
                {
                    fieldName: 'destAgentNameText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DestAgent'
                },
                {
                    fieldName: 'cdrTypeText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.CdrType'
                },
                {
                    fieldName: 'result',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.Result',
                    filter: {name: 'GeneralEDRResultFilter'}
                },
                {
                    fieldName: 'reasonText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.ReasonContext'
                },
                {
                    fieldName: 'cspTrxId',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.CspTrxId'
                },
                {
                    fieldName: 'messageSize',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.MessageSize'
                },
                {
                    fieldName: 'messageClass',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.MessageClass'
                },
                {
                    fieldName: 'subject',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.Subject'
                },
                {
                    fieldName: 'statusCode',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.StatusCode'
                },
                {
                    fieldName: 'statusText',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.StatusText'
                },
                {
                    fieldName: 'drRequested',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.DrRequested',
                    filter: {name: 'requestedFilter'}
                },
                {
                    fieldName: 'cdrKey',
                    headerKey: 'Products.MessagingGw.Troubleshooting.TableColumns.CdrKey'
                }
            ]
        };

        $scope.$parent.MSGGW_MMSC_AGENT_TYPES = MSGGW_MMSC_AGENT_TYPES;

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.$parent.allMMSCApplications = $filter('orderBy')(serviceList, ['organization.name']);

        $controller('ActivityHistoryMessagingHistoryCommonCtrl', {
            $scope: $scope,
            edrRecordsMethod: 'findMessagingGwMMSRecords'
        });

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item._source;

                record.cdrTypeText = $filter('MessagingGwEDRTypeFilter')(record.cdrType);

                record.reasonText = (record.result > 0 ? $filter('MessagingGwEDRResultReasonFilter')(record.reasonContext, record.reason) : '');

                record.origAgentNameText = record.origAgentName + ' [' + record.origAgentId + ']';
                record.destAgentNameText = record.destAgentName + ' [' + record.destAgentId + ']';

                record.origAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.origAgentType);
                record.destAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.destAgentType);

                record.drRequested = (String(record.drRequested) === 'true');
            });

            return list;
        };

        // Show details.
        $scope.showDetails = function (edrRecord) {
            $scope.showDetailsCommon(edrRecord, 'subscriber-info/activity-history/messaginghistory/troubleshooting.mms.edr.details.html');
        };

        // Show message delivery report.
        $scope.showMessageDeliveryReport = function (edrRecord) {
            $scope.showMessageDeliveryReportCommon(edrRecord, 'subscriber-info/activity-history/messaginghistory/troubleshooting.mms.edr.messagedeliveryreport.html', GeneralESService.findMessagingGwMMSDeliveryReports);
        };
    });

})();
