(function () {

    'use strict';

    angular.module('ccportal.products.smsc.activity-history', [
        'ngTableExport'
    ]);

    var SmscActivityHistoryModule = angular.module('ccportal.products.smsc.activity-history');

    SmscActivityHistoryModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.activity-history', {
            abstract: true,
            url: "/activity-history",
            templateUrl: "products/smsc/activity-history/smsc-activity-history.html"
        }).state('products.smsc.activity-history.edr', {
            abstract: true,
            url: "",
            templateUrl: 'products/smsc/activity-history/smsc-activity-history.edr.html',
            controller: 'SmscActivityHistoryCtrl',
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.activity-history.edr.view', {
            url: "",
            views: {
                'permanentTable': {
                    templateUrl: 'products/smsc/activity-history/smsc-activity-history.edr.permanent.html'
                },
                'transientTable': {
                    templateUrl: 'products/smsc/activity-history/smsc-activity-history.edr.transient.html'
                }
            }
        });

    });

    SmscActivityHistoryModule.controller('SmscActivityHistoryCtrl', function ($scope, $log, $uibModal, $q, $filter, $timeout, $controller, $translate, notification, GeneralESService, SfeReportingService,
                                                                              DateTimeConstants, UtilService, SMSC_AGENT_TYPE, Restangular, smppApplications, organizations,
                                                                              TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('SmscActivityHistoryCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.SMSC_AGENT_TYPE = angular.copy(SMSC_AGENT_TYPE);

        $scope.dateFilter.origAgent = null;
        $scope.dateFilter.destAgent = null;

        // Initialize application list by taking organization and application names.
        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown error code as "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);

        $scope.permanentLatestPageNumbers = [];
        $scope.transientLatestPageNumbers = [];

        // Open the permanent tab as default.
        $scope.recordType = 'permanent';

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
                origAgentType: dateFilter.origAgentType ? dateFilter.origAgentType.type_key : undefined,
                destAgentType: dateFilter.destAgentType ? dateFilter.destAgentType.type_key : undefined,
                origAgentId: dateFilter.origAgent ? dateFilter.origAgent.id : undefined,
                destAgentId: dateFilter.destAgent ? dateFilter.destAgent.id : undefined,
                partRef: dateFilter.partRef,
                result: dateFilter.result
            };

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? '"asc"' : '"desc"';
                result.filter.orderBy = tableParams.orderBy()[0];
                result.filter.limit = tableParams.count();
                result.filter.offset = (tableParams.page() - 1) * tableParams.count();

                result.filter.quickSearchText = tableParams.settings().$scope.quickSearchText;
                result.filter.quickSearchColumns = tableParams.settings().$scope.quickSearchColumns;
            }

            return result;
        };

        var getSummarizeCounts = function () {
            var deferred = $q.defer();

            var preparedFilter = $scope.prepareFilter($scope.dateFilter);

            var result = {};

            GeneralESService.getSmscPermanentCount(preparedFilter.filter, preparedFilter.additionalFilterFields).then(function (response) {
                $log.debug("Found permanent record count: ", response);

                result.permanent = response.count;

                // Do not query transient event count if DELIVERED selected as delivery status on the filter form.
                if (preparedFilter.filter.result === '0') {
                    result.transient = 0;
                    result.delivered = response.count;

                    deferred.resolve(result);
                } else {
                    SfeReportingService.getTransientCount(preparedFilter.filter, preparedFilter.additionalFilterFields).then(function (response) {
                        $log.debug("Found transient record count: ", response);

                        result.transient = response.totalHitCount;

                        // Do not query delivered event count if UNDELIVERED selected as delivery status on the filter form.
                        if (preparedFilter.filter.result === '1') {
                            result.delivered = 0;

                            deferred.resolve(result);
                        } else {
                            GeneralESService.getSmscPermanentDeliveredCount(preparedFilter.filter, preparedFilter.additionalFilterFields).then(function (permanentResponse) {
                                $log.debug("Found delivered record count: ", permanentResponse);

                                result.delivered = permanentResponse.count;

                                deferred.resolve(result);
                            });
                        }
                    });
                }
            });

            return deferred.promise;
        };

        var updateSumarizeCounts = function () {
            // Queries counts of the delivered messages if clicked to the search button.
            getSummarizeCounts().then(function (response) {
                $scope.summarize.permanent = response.permanent;
                $scope.summarize.transient = response.transient;
                $scope.summarize.delivered = response.delivered;

                if ($scope.summarize.permanent > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.SMSC.Troubleshooting.MessageContent.ExceededRecordCountLimit', {
                            count: $scope.summarize.permanent,
                            limit: TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION
                        })
                    });
                }
            });
        };

        $scope.throttledReloadTable = _.throttle(function () {
            // Avoiding part ref based search
            $scope.dateFilter.partRef = undefined;

            if (!$scope.dateFilter.origAgentType || _.isEmpty($scope.dateFilter.origAgentType)) {
                $scope.dateFilter.origAgent = {};
            }
            if (!$scope.dateFilter.destAgentType || _.isEmpty($scope.dateFilter.destAgentType)) {
                $scope.dateFilter.destAgent = {};
            }

            $scope.previousDateFilter = angular.copy($scope.dateFilter);

            $scope.reloadTable($scope.smscPermanentEdrList.tableParams);

            // Query transient events if delivery status selected different from DELIVERED on the filter form.
            if ($scope.dateFilter.result !== '0') {
                $scope.reloadTable($scope.smscTransientEdrList.tableParams);
            }

            updateSumarizeCounts();
        }, 500);

        updateSumarizeCounts();

        $scope.filterPermanentTable = _.debounce(function (text, columns) {
            $scope.smscPermanentEdrList.tableParams.settings().$scope.quickSearchText = text;
            $scope.smscPermanentEdrList.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.smscPermanentEdrList.tableParams);
        }, 750);

        $scope.filterTemporaryTable = _.debounce(function (text) {
            $scope.smscTransientEdrList.tableParams.settings().$scope.quickSearchText = text;

            $scope.reloadTable($scope.smscTransientEdrList.tableParams);
        }, 750);

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/smsc/activity-history/smsc-activity-history.edr.details.html',
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

                if (_.has(record, 'sourceMnp')) {
                    record.sourceMnp = (record.sourceMnp === null ? '' : record.sourceMnp);
                }
                if (_.has(record, 'destMnp')) {
                    record.destMnp = (record.destMnp === null ? '' : record.destMnp);
                }

                record.concatInfo = record.partCurrent + '/' + record.partTotal + (record.partTotal > 1 ? ' [' + record.partRef + ']' : '');

                record.cdrTypeText = $filter('SmscEDRTypeFilter')(record.cdrType) + ' [' + record.cdrType + ']';

                record.reasonText = (record.result > 0 ? $filter('SmscEDRResultReasonFilter')(record.reasonContext, record.reason, record.subReason) : '');

                record.origAddressNpiTon = record.origAddressNpi + '/' + record.origAddressTon;
                record.o_origAddressNpiTon = record.o_origAddressNpi + '/' + record.o_origAddressTon;
                record.destAddressNpiTon = record.destAddressNpi + '/' + record.destAddressTon;
                record.o_destAddressNpiTon = record.o_destAddressNpi + '/' + record.o_destAddressTon;

                // If agent is SMPP then show the appropriate smpp application
                if (record.origAgentType === 1) {
                    var foundOrigAgent = _.findWhere($scope.smppApplicationList, {id: record.origAgentId});
                    if (!_.isUndefined(foundOrigAgent)) {
                        record.origAgent = foundOrigAgent.label;
                    } else {
                        record.origAgent = record.origAgentName + ' [' + record.origAgentId + ']';
                    }
                } else {
                    record.origAgent = record.origAgentName;
                }

                // If agent is SMPP then show the appropriate smpp application
                if (record.destAgentType === 1) {
                    var foundDestAgent = _.findWhere(smppApplicationList, {id: record.destAgentId});
                    if (!_.isUndefined(foundDestAgent)) {
                        record.destAgent = foundDestAgent.label;
                    } else {
                        record.destAgent = record.destAgentName + ' [' + record.destAgentId + ']';
                    }
                } else {
                    record.destAgent = record.destAgentName;
                }
            });

            return list;
        };

        // Message content modal window.
        $scope.showMessageContent = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/smsc/activity-history/smsc-activity-history.edr.messagecontent.html',
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

                            // Search in the permanent records if the record is permanent or in the transient records otherwise.
                            if ($scope.recordType = 'permanent') {
                                promise = GeneralESService.findSmscPermanentMessageParts(edrRecord.origAddress, edrRecord.destAddress, edrRecord.partRef, edrRecord.scTimestamp);
                            } else {
                                promise = SfeReportingService.findSmscTransientMessageParts(edrRecord.origAddress, edrRecord.destAddress, edrRecord.partRef);
                            }

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
                                            messageContent += '<span class="message-part-mark">' + messageTransactionRecord.msgContent + '</span>';
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

        // Find permanent message parts
        $scope.filterMessageParts = function (edrRecord) {
            if (edrRecord.partTotal <= 1) {
                return;
            }

            $scope.dateFilter.origAddress = edrRecord.origAddress;
            $scope.dateFilter.destAddress = edrRecord.destAddress;
            $scope.dateFilter.partRef = edrRecord.partRef;

            $scope.reloadTable($scope.smscPermanentEdrList.tableParams);
            $scope.reloadTable($scope.smscTransientEdrList.tableParams);
        };

        $scope.backFromFilterMessageParts = function () {
            $scope.dateFilter = angular.copy($scope.previousDateFilter);
            $scope.dateHolder = $scope.dateFilter;

            $scope.dateFilter.origAgentType = _.findWhere($scope.SMSC_AGENT_TYPE, {type_key: $scope.previousDateFilter.origAgentType ? $scope.previousDateFilter.origAgentType.type_key : null});
            $scope.dateFilter.origAgentType = $scope.dateFilter.origAgentType ? $scope.dateFilter.origAgentType : {};

            $scope.dateFilter.destAgentType = _.findWhere($scope.SMSC_AGENT_TYPE, {type_key: $scope.previousDateFilter.destAgentType ? $scope.previousDateFilter.destAgentType.type_key : null});
            $scope.dateFilter.destAgentType = $scope.dateFilter.destAgentType ? $scope.dateFilter.destAgentType : {};

            $scope.dateFilter.origAgent = _.findWhere($scope.smppApplicationList, {id: $scope.previousDateFilter.origAgent ? $scope.previousDateFilter.origAgent.id : null});
            $scope.dateFilter.origAgent = $scope.dateFilter.origAgent ? $scope.dateFilter.origAgent : {};

            $scope.dateFilter.destAgent = _.findWhere($scope.smppApplicationList, {id: $scope.previousDateFilter.destAgent ? $scope.previousDateFilter.destAgent.id : null});
            $scope.dateFilter.destAgent = $scope.dateFilter.destAgent ? $scope.dateFilter.destAgent : {};

            $scope.reloadTable($scope.smscPermanentEdrList.tableParams, $scope.permanentLatestPageNumbers[1]);
            $scope.reloadTable($scope.smscTransientEdrList.tableParams, $scope.transientLatestPageNumbers[1]);
        };

        $controller('SmscActivityHistoryPermanentCtrl', {$scope: $scope});
        $controller('SmscActivityHistoryTransientCtrl', {$scope: $scope});

        $controller('SmscActivityHistoryHistoryCtrl', {$scope: $scope});
        $controller('SmscActivityHistorySummarizeCtrl', {$scope: $scope});
    });

    SmscActivityHistoryModule.controller('SmscActivityHistoryPermanentCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams, $controller, UtilService, DateTimeConstants,
                                                                                       GeneralESService, SmscOperationService, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION,
                                                                                       ReportingExportService) {
        $log.debug('SmscActivityHistoryPermanentCtrl');

        // SMSC permanent edr list
        $scope.smscPermanentEdrList = {
            list: [],
            showTable: true,
            tableParams: {}
        };

        var exportPermanentEdrs = function (mimeType) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.smscPermanentEdrList.tableParams);

            var bodyPayload = GeneralESService.prepareMainEdrQueryPayload(preparedFilter.filter, ['origAddress', 'destAddress'], 'date', preparedFilter.additionalFilterFields);
            var bodyPayloadStr = JSON.stringify(bodyPayload).replace(/\+/g, '%2b');

            var srcUrl = '/smsc-es-adapter-local-rest/elastic-search-adapter/main_edr/_export';
            srcUrl += '?response-content-type=' + mimeType;
            srcUrl += '&query=' + encodeURIComponent(bodyPayloadStr);

            $log.debug('Downloading SMSC Permanent Records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

        $scope.exportPermanentEdrs = function (mimeType) {
            if ($scope.smscPermanentEdrList.tableParams.total() > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
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
                    exportPermanentEdrs(mimeType);
                }, function () {
                    // ignored
                });
            } else {
                // Export directly since total count lesser than the limit.
                exportPermanentEdrs(mimeType);
            }
        };

        $scope.smscPermanentEdrList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "date": 'desc' // initial sorting
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                $scope.permanentLatestPageNumbers[1] = $scope.permanentLatestPageNumbers[0];
                $scope.permanentLatestPageNumbers[0] = params.page();

                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var deferredPermanentRecordsQuery = $q.defer();
                GeneralESService.findSmscPermanentEdrs(preparedFilter.filter, preparedFilter.additionalFilterFields).then(function (response) {
                    $log.debug("Found permanent records: ", response);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.smscPermanentEdrList.showTable = true;

                    deferredPermanentRecordsQuery.resolve(response);
                }, function (error) {
                    deferredPermanentRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredPermanentRecordsQuery.promise.then(function (response) {
                    if (response) {
                        if (!response.errorCode) {
                            $scope.smscPermanentEdrList.list = $scope.filterFields(response.hits.hits);

                            params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                            $defer.resolve($scope.smscPermanentEdrList.list);
                        } else {
                            params.total(0);
                            $defer.resolve([]);
                        }
                    }
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - SMSC permanent edr list

        // Resending permanent message.
        $scope.resendMessage = function (edrRecord) {
            var deferred = $q.defer();

            var resendingMessage = {
                "sourceAddress": edrRecord.origAddress,
                "sourceAddressTon": edrRecord.origAddressTon,
                "sourceAddressNpi": edrRecord.origAddressNpi,
                "destinationAddress": edrRecord.destAddress,
                "destinationAddressTon": edrRecord.destAddressTon,
                "destinationAddressNpi": edrRecord.destAddressNpi,
                "messageContent": "",
                "dcs": edrRecord.dcs
            };

            if (edrRecord.partTotal === 1) {
                resendingMessage.messageContent = edrRecord.msgContent;

                deferred.resolve(resendingMessage);
            } else {
                GeneralESService.findSmscPermanentMessageParts(edrRecord.origAddress, edrRecord.destAddress, edrRecord.partRef, edrRecord.scTimestamp).then(function (response) {
                    var messageTransactions = response.hits.hits;

                    for (var i = 0; i < edrRecord.partTotal; ++i) {
                        var partCurrent = i + 1;
                        var messageTransaction = _.find(messageTransactions, function (messageTransaction) {
                            return messageTransaction._source.partCurrent === partCurrent;
                        });

                        if (_.isUndefined(messageTransaction)) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.SMSC.Troubleshooting.MessageContent.PartNotFound', {partNumber: partCurrent})
                            });
                        } else {
                            $log.debug('Message parts: PartRef: ', edrRecord.partRef, ', PartTotal: ', messageTransaction.partTotal, ', PartCurrent: ', partCurrent, ', MsgContent: ', messageTransaction._source.msgContent);

                            resendingMessage.messageContent += messageTransaction._source.msgContent;
                        }
                    }

                    deferred.resolve(resendingMessage)
                });
            }

            deferred.promise.then(function (resendingMessage) {
                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'partials/modal/modal.confirmation.operation.html',
                    controller: function ($scope, $sce, $uibModalInstance, resendingMessage) {
                        edrRecord.rowSelected = true;

                        $scope.resendingMessage = resendingMessage;

                        var messageText = $translate.instant('Products.SMSC.Troubleshooting.MessageContent.ResendConfirmationMessage', {
                            origAddress: $scope.resendingMessage.sourceAddress,
                            destAddress: $scope.resendingMessage.destinationAddress
                        });
                        $scope.confirmationMessage = $sce.trustAsHtml(messageText);

                        $scope.ok = function () {
                            $uibModalInstance.close(resendingMessage);
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    size: 'sm',
                    resolve: {
                        resendingMessage: function () {
                            return resendingMessage;
                        }
                    }
                });

                modalInstance.result.then(function (resendingMessage) {
                    edrRecord.rowSelected = false;

                    $log.debug('Message is resending: ', resendingMessage);

                    SmscOperationService.resendMessage(resendingMessage).then(function () {
                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }, function (response) {
                        $log.debug('Cannot resent the message: ', response);
                    });
                }, function () {
                    edrRecord.rowSelected = false;
                });

            });

        };

    });

    SmscActivityHistoryModule.controller('SmscActivityHistoryTransientCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, $sce, NgTableParams, $controller, UtilService, DateTimeConstants,
                                                                                       SfeReportingService, SmscOperationService, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION, ReportingExportService) {
        $log.debug('SmscActivityHistoryTransientCtrl');

        // SMSC transient edr list
        $scope.smscTransientEdrList = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        var exportTransientEdrs = function (mimeType) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.smscTransientEdrList.tableParams);

            var queryString = SfeReportingService.prepareUrl(preparedFilter.filter, preparedFilter.additionalFilterFields);

            var srcUrl = '/smsc-sfe-reporting-local-rest/v1/export';
            srcUrl += queryString + '&response-content-type=' + mimeType;

            $log.debug('Downloading SMSC Transient Records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

        $scope.exportTransientEdrs = function (mimeType) {
            if ($scope.smscTransientEdrList.tableParams.total() > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
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
                    exportTransientEdrs(mimeType);
                }, function () {
                    // ignored
                });
            } else {
                // Export directly since total count lesser than the limit.
                exportTransientEdrs(mimeType);
            }
        };

        $scope.smscTransientEdrList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "date": 'desc' // initial sorting
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                $scope.transientLatestPageNumbers[1] = $scope.transientLatestPageNumbers[0];
                $scope.transientLatestPageNumbers[0] = params.page();

                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var deferredTransientRecordsQuery = $q.defer();
                SfeReportingService.getEDRs(preparedFilter.filter, preparedFilter.additionalFilterFields).then(function (response) {
                    $log.debug("Found transient records: ", response);

                    // Hide the filter form.
                    $scope.filterFormLayer.isFilterFormOpen = false;

                    $scope.smscTransientEdrList.showTable = true;

                    deferredTransientRecordsQuery.resolve(response);
                }, function (error) {
                    deferredTransientRecordsQuery.reject(error);
                });

                // Listen the response of the above query.
                deferredTransientRecordsQuery.promise.then(function (response) {
                    $scope.smscTransientEdrList.list = $scope.filterFields(response.recordList);

                    params.total(response.totalHitCount);
                    $defer.resolve($scope.smscTransientEdrList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - SMSC transient edr list

        // Cancel sending temporary message.
        $scope.cancelSending = function (sfeRecord) {
            cancelOrSendImmediately(sfeRecord, true)
        };

        // Send message now.
        $scope.sendItNow = function (sfeRecord) {
            cancelOrSendImmediately(sfeRecord, false)
        };

        // Bulk message cancellation confirmation modal window.
        $scope.cancelAllFilteredMessages = function () {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/modal.confirmation.operation.html',
                controller: function ($scope, $sce, $uibModalInstance, allRecordCount, dateFilter, quickSearchText) {
                    var messageText = $translate.instant('Products.SMSC.Troubleshooting.MessageContent.BulkCancelSending', {
                        all_count: allRecordCount
                    });
                    $scope.confirmationMessage = $sce.trustAsHtml(messageText);

                    $scope.ok = function () {
                        $uibModalInstance.close({
                            dateFilter: dateFilter,
                            quickSearchText: quickSearchText
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'sm',
                resolve: {
                    allRecordCount: function () {
                        return $scope.smscTransientEdrList.tableParams.total();
                    },
                    dateFilter: function () {
                        return $scope.previousDateFilter;
                    },
                    quickSearchText: function () {
                        return $scope.smscTransientEdrList.tableParams.settings().$scope.quickSearchText;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                var dateFilter = result.dateFilter;
                var quickSearchText = result.quickSearchText;

                $log.debug('Cancelling all pending messages: ', dateFilter, ', Quick search: ', quickSearchText);

                var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
                var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

                var filter = {
                    startDate: startDateIso,
                    endDate: endDateIso,
                    msisdn: UtilService.getSubscriberMsisdn(),
                    quickSearchText: quickSearchText
                };

                var additionalFilterFields = {
                    origAddress: dateFilter.origAddress,
                    destAddress: dateFilter.destAddress,
                    origAgentType: dateFilter.origAgentType ? dateFilter.origAgentType.type_key : undefined,
                    destAgentType: dateFilter.destAgentType ? dateFilter.destAgentType.type_key : undefined,
                    origAgentId: dateFilter.origAgent ? dateFilter.origAgent.id : undefined,
                    destAgentId: dateFilter.destAgent ? dateFilter.destAgent.id : undefined
                };

                SfeReportingService.deleteAllPendingMessages(filter, additionalFilterFields).then(function (response) {
                    $log.debug('All pending messages cancelled: ', response);

                    // Set all records' inProgress flag as true.
                    var smscTransientEdrList = $scope.smscTransientEdrList.tableParams.list;
                    _.each(smscTransientEdrList, function (sfeRecord) {
                        sfeRecord.inProgress = true;
                    });

                    $scope.reloadTable($scope.smscTransientEdrList.tableParams);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot cancel all pending messages: ', response);
                });
            }, function () {
                // ignore
            });
        };

        var cancelOrSendImmediately = function (sfeRecord, isCancel) {
            var deferred = $q.defer();

            var messageIds = [];

            if (sfeRecord.partTotal === 1) {
                messageIds.push(sfeRecord.messageId);

                deferred.resolve(messageIds);
            } else {
                SfeReportingService.findSmscTransientMessageParts(sfeRecord.origAddress, sfeRecord.destAddress, sfeRecord.partRef).then(function (response) {
                    var messageTransactions = response.recordList;

                    _.each(messageTransactions, function (messageTransaction) {
                        $log.debug('Message parts: PartRef: ', sfeRecord.partRef, ', PartTotal: ', messageTransaction.partTotal, ', PartCurrent: ', messageTransaction.partCurrent, ', MessageId: ', messageTransaction.messageId);

                        messageIds.push(messageTransaction.messageId);
                    });

                    deferred.resolve(messageIds);
                });
            }

            deferred.promise.then(function (messageIds) {
                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'partials/modal/modal.confirmation.operation.html',
                    controller: function ($scope, $sce, $uibModalInstance, sfeRecord, messageIds) {
                        sfeRecord.rowSelected = true;

                        var messageText = $translate.instant((isCancel ? 'Products.SMSC.Troubleshooting.MessageContent.CancelSending' : 'Products.SMSC.Troubleshooting.MessageContent.SendItNow'), {
                            origAddress: sfeRecord.origAddress,
                            destAddress: sfeRecord.destAddress
                        });
                        $scope.confirmationMessage = $sce.trustAsHtml(messageText);

                        $scope.ok = function () {
                            $uibModalInstance.close(messageIds);
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    size: 'sm',
                    resolve: {
                        messageIds: function () {
                            return messageIds;
                        },
                        sfeRecord: function () {
                            return sfeRecord;
                        }
                    }
                });

                modalInstance.result.then(function (messageIds) {
                    sfeRecord.rowSelected = false;

                    $log.debug((isCancel ? 'Cancelling message ids: ' : 'Send message now ids: '), messageIds);

                    var promises = [];
                    _.each(messageIds, function (messageId) {
                        if (isCancel) {
                            promises.push(SmscOperationService.deleteBySMSTicket(messageId));
                        } else {
                            promises.push(SmscOperationService.sendNowBySMSTicket(messageId));
                        }
                    });

                    $q.all(promises).then(function () {
                        // Set true the inProgress flag so progress continues.
                        sfeRecord.inProgress = true;

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }, function (response) {
                        $log.debug((isCancel ? 'Cannot cancel sending the message: ' : 'Cannot sending the message now: '), response);
                    });
                }, function () {
                    sfeRecord.rowSelected = false;
                });
            });
        };
    });

    SmscActivityHistoryModule.controller('SmscActivityHistoryHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams, DateTimeConstants) {
        $log.debug('SmscActivityHistoryHistoryCtrl');

        // SMSC detail history list
        var smscEdrHistoryList = {
            list: [],
            tableParams: {}
        };

        smscEdrHistoryList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "_source.dateMicroSec": 'desc' // initial sorting
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(smscEdrHistoryList.list, params.orderBy()) : smscEdrHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMSC detail history list

        // History modal window.
        $scope.showSmscHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/smsc/activity-history/smsc-coc-activity-history.edr.history.html',
                controller: function ($scope, $uibModalInstance, smscHistoryEdrs, edrRecord, smscEdrHistoryList, recordType, DateTimeConstants) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'scTimestamp',
                                headerKey: 'Products.SMSC.Troubleshooting.TableColumns.SubmitDate',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'eventDate',
                                headerKey: (recordType === 'permanent' ? 'Products.SMSC.Troubleshooting.TableColumns.CompletionDate' : 'Products.SMSC.Troubleshooting.TableColumns.EventDate'),
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'date',
                                headerKey: 'Products.SMSC.Troubleshooting.TableColumns.HistoryEventDate',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'destMsc',
                                headerKey: 'Products.SMSC.Troubleshooting.TableColumns.DestMSC'
                            },
                            {
                                fieldName: 'cdrTypeText',
                                headerKey: 'Products.SMSC.Troubleshooting.TableColumns.HistoryCDRType'
                            },
                            {
                                fieldName: 'result',
                                headerKey: 'Products.SMSC.Troubleshooting.TableColumns.Result',
                                filter: {name: 'GeneralEDRResultFilter'}
                            },
                            {
                                fieldName: 'reasonText',
                                headerKey: 'Products.SMSC.Troubleshooting.TableColumns.ReasonInfo'
                            }
                        ]
                    };

                    $scope.recordType = recordType;

                    $scope.edrRecord = edrRecord;
                    $scope.smscEdrHistoryList = smscEdrHistoryList;

                    $scope.smscEdrHistoryList.list = smscHistoryEdrs.hits.hits;
                    _.each($scope.smscEdrHistoryList.list, function (record) {
                        record._source.scTimestamp = $scope.edrRecord.scTimestamp;
                        record._source.eventDate = $scope.edrRecord.date;
                        record._source.cdrTypeText = $filter('SmscEDRTypeFilter')(record._source.cdrType, record._source.smsType) + ' [' + record._source.cdrType + ']';

                        if (record._source.result > 0) {
                            record._source.reasonText = (record._source.result > 0 ? $filter('SmscEDRResultReasonFilter')(record._source.reasonContext, record._source.reason, record._source.subReason) : '');
                        } else {
                            record._source.reasonText = $translate.instant('CommonLabels.N/A');
                        }
                    });

                    $scope.smscEdrHistoryList.tableParams.page(1);
                    $scope.smscEdrHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    smscHistoryEdrs: function (GeneralESService) {
                        return GeneralESService.findSmscHistoryEdrs(edrRecord.cdrKey);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    smscEdrHistoryList: function () {
                        return smscEdrHistoryList;
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

    });

    SmscActivityHistoryModule.controller('SmscActivityHistorySummarizeCtrl', function ($scope, $log) {
        $log.debug('SmscActivityHistorySummarizeCtrl');

        $scope.summarize = {
            permanent: 0,
            transient: 0,
            delivered: 0
        };
    });

})();
