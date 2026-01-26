(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.troubleshooting', []);

    var MmscTroubleshootingModule = angular.module('adminportal.products.mmsc.troubleshooting');

    MmscTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.troubleshooting', {
            abstract: true,
            url: "/troubleshooting",
            templateUrl: "products/mmsc/troubleshooting/troubleshooting.html"
        }).state('products.mmsc.troubleshooting.edr', {
            abstract: true,
            url: "",
            templateUrl: 'products/mmsc/troubleshooting/troubleshooting.edr.html',
            controller: 'MmscTroubleshootingCtrl'
        }).state('products.mmsc.troubleshooting.edr.view', {
            url: "",
            views: {
                'permanentTable': {
                    templateUrl: 'products/mmsc/troubleshooting/troubleshooting.edr.permanent.html'
                },
                'transientTable': {
                    templateUrl: 'products/mmsc/troubleshooting/troubleshooting.edr.transient.html'
                }
            }
        });

    });

    MmscTroubleshootingModule.controller('MmscTroubleshootingCtrl', function ($scope, $log, $q, $uibModal, $filter, $timeout, $controller, DateTimeConstants, GeneralESService) {
        $log.debug('MmscTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        // Open the permanent tab as default.
        $scope.isPermanent = true;

        // Filter initializations
        $scope.dateFilter.origAgent = '';
        $scope.dateFilter.destAgent = '';

        $scope.reloadTable = function (tableParams, isAskService) {
            tableParams.settings().$scope.askService = isAskService;
            if (tableParams.page() === 1) {
                tableParams.reload();
            } else {
                $timeout(function () {
                    tableParams.page(1);
                }, 0);
            }
        };

        $scope.prepareFilter = function (dateFilter, tableParams) {
            var result = {};

            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            result.filter = {
                startDate: startDateIso, //new Date(startDateIso).toISOString(),
                endDate: endDateIso //new Date(endDateIso).toISOString()
            };

            result.additionalFilterFields = {
                "sender.address": dateFilter.origAddress,
                "recipient.address": dateFilter.destAddress
            };

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? '"asc"' : '"desc"';
                result.filter.limit = tableParams.count();
                result.filter.offset = (tableParams.page() - 1) * tableParams.count();

                result.filter.queryString = tableParams.settings().$scope.queryString;
                result.filter.quickSearchColumns = tableParams.settings().$scope.quickSearchColumns;
            }

            return result;
        };

        var getSummarizeCounts = function () {
            var deferred = $q.defer();

            var preparedFilter = $scope.prepareFilter($scope.dateFilter);
            var filter = preparedFilter.filter;
            filter.queryString = $scope.queryString;
            filter.quickSearchColumns = $scope.quickSearchColumns;
            var result = {};

            GeneralESService.getMmscPermanentCount(filter).then(function (response) {
                $log.debug("Found permanent record count: ", response);

                result.permanent = response.count;

                GeneralESService.getMmscTransientCount(filter).then(function (response) {
                    $log.debug("Found transient record count: ", response);

                    result.transient = response.count;

                    GeneralESService.getMmscDeliveredCount(filter).then(function (response) {
                        $log.debug("Found delivered record count: ", response);

                        result.delivered = response.count;

                        GeneralESService.getMmscUndeliveredCount(filter).then(function (response) {
                            $log.debug("Found undelivered record count: ", response);

                            result.undelivered = response.count;

                            deferred.resolve(result);
                        });
                    });
                });
            });

            return deferred.promise;
        };

        var updateSumarizeCounts = function () {
            // Queries counts of the delivered messages if clicked to the search button.
            getSummarizeCounts().then(function (response) {
                $scope.summarize.permanent = response.permanent;
                $scope.summarize.transient = response.transient;
                $scope.summarize.delivered = response.delivered;
                $scope.summarize.undelivered = response.undelivered;
            });
        }

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable($scope.mmscPermanentEdrList.tableParams, true);
            $scope.reloadTable($scope.mmscTransientEdrList.tableParams, true);

            updateSumarizeCounts();
        }, 500);

        $scope.filterPermanentTable = _.debounce(function (text, columns) {
            $scope.mmscPermanentEdrList.tableParams.settings().$scope.queryString = text;
            $scope.mmscPermanentEdrList.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.mmscPermanentEdrList.tableParams, true);
        }, 500);

        $scope.filterTemporaryTable = _.debounce(function (text, columns) {
            $scope.mmscTransientEdrList.tableParams.settings().$scope.queryString = text;
            $scope.mmscTransientEdrList.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.mmscTransientEdrList.tableParams, true);
        }, 500);

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/mmsc/troubleshooting/troubleshooting.edr.details.html',
                controller: function ($scope, $uibModalInstance, edrRecord, isPermanent) {
                    edrRecord.rowSelected = true;

                    $scope.isPermanent = isPermanent;

                    $scope.edrRecord = edrRecord;

                    //$scope.edrRecord.contentTypes = _.pluck($scope.edrRecord.mmsProperties.media.contents, 'type');
                    var matches = $scope.edrRecord.mmsProperties && $scope.edrRecord.mmsProperties.contents ? $scope.edrRecord.mmsProperties.contents.match(/type=([^,}]+)/g) : [];
                    var contentTypes = _.map(matches, function(item) {
                        return item.split('=')[1];
                    });
                    $scope.edrRecord.contentTypes = contentTypes.join(', ');

                    if ($scope.edrRecord.sender.o_address && $scope.edrRecord.sender.o_address.indexOf('Charset=') > -1) {
                        $scope.edrRecord.sender.o_address_short = '[ ' + $scope.edrRecord.sender.o_address.split(' ]')[0].split('Charset=')[1].split(' StringRepresentation=').join('; ').split('/')[0] + ' ]';
                    } else {
                        $scope.edrRecord.sender.o_address_short = $scope.edrRecord.sender.o_address;
                    }

                    if ($scope.edrRecord.recipient.o_address && $scope.edrRecord.recipient.o_address.indexOf('Charset=') > -1) {
                        $scope.edrRecord.recipient.o_address_short = '[ ' + $scope.edrRecord.recipient.o_address.split(' ]')[0].split('Charset=')[1].split(' StringRepresentation=').join('; ').split('/')[0] + ' ]';
                    } else {
                        $scope.edrRecord.recipient.o_address_short = $scope.edrRecord.recipient.o_address;
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
                    isPermanent: function () {
                        return $scope.isPermanent;
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

                record.recordTypeText = $filter('MmscEDRTypeFilter')(record.recordType) + ' [' + record.recordType + ']';

                if (record.status) {
                    record.reasonText = (record.finalStatus > 0 ? $filter('uppercase')(record.status.text) + ' [' + record.status.context + '-' + record.status.code + ']' : '');
                } else {
                    record.reasonText = '';
                }

            });

            return list;
        };

        $controller('MmscTroubleshootingPermanentCtrl', {$scope: $scope});
        $controller('MmscTroubleshootingTransientCtrl', {$scope: $scope});
        $controller('MmscTroubleshootingHistoryCtrl', {$scope: $scope});
        $controller('MmscTroubleshootingSummarizeCtrl', {$scope: $scope});
    });

    MmscTroubleshootingModule.controller('MmscTroubleshootingPermanentCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams, DateTimeConstants,
                                                                                       ReportingExportService, UtilService, GeneralESService, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('MmscTroubleshootingPermanentCtrl');

        $scope.permanentResultTemplateUrl = 'products/mmsc/troubleshooting/troubleshooting.edr.result.tpl.html';

        // MMSC permanent edr list
        $scope.mmscPermanentEdrList = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.exportPermanentEdrs = function (mimeType) {
            if ($scope.mmscPermanentEdrList.tableParams.total() > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
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

        var exportPermanentEdrs = function (mimeType) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.mmscPermanentEdrList.tableParams);

            var filter = preparedFilter.filter;
            var additionalFilterFields = preparedFilter.additionalFilterFields;

            var termFilterJSON = {
                "must_not": [
                    {
                        "terms": {
                            "finalStatus": [0, 7]
                        }
                    }
                ]
            };

            var bodyPayload = GeneralESService.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);
            var bodyPayloadStr = JSON.stringify(bodyPayload).replace(/\+/g, '%2b');

            var srcUrl = '/mmsc-troubleshooting-local-rest/v2/elastic-search/export';
            srcUrl += '?response-content-type=' + mimeType;
            srcUrl += '&query=' + encodeURIComponent(bodyPayloadStr);

            $log.debug('Downloading MMSC Permanent Records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

        $scope.mmscPermanentEdrList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 100, // count per page
            sorting: {
                "eventTime": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredPermanentRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findMmscPermanentEdrs(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found permanent records: ", response);

                        // Slide Up and hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.mmscPermanentEdrList.showTable = true;

                        deferredPermanentRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredPermanentRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredPermanentRecordsQuery.promise.then(function (response) {
                    $scope.mmscPermanentEdrList.list = $scope.filterFields(response.hits.hits);

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.mmscPermanentEdrList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - MMSC permanent edr list

    });

    MmscTroubleshootingModule.controller('MmscTroubleshootingTransientCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams, UtilService, DateTimeConstants,
                                                                                       ReportingExportService, GeneralESService, MmscTroubleshootingService, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('MmscTroubleshootingTransientCtrl');

        $scope.transientResultTemplateUrl = 'products/mmsc/troubleshooting/troubleshooting.edr.result.tpl.html';

        // MMSC transient edr list
        $scope.mmscTransientEdrList = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.exportTransientEdrs = function (mimeType) {
            if ($scope.mmscTransientEdrList.tableParams.total() > TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
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

        var exportTransientEdrs = function (mimeType) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.mmscTransientEdrList.tableParams);

            var filter = preparedFilter.filter;
            var additionalFilterFields = preparedFilter.additionalFilterFields;

            var termFilterJSON = {
                "must": [
                    {
                        "terms": {
                            "finalStatus": [0, 7]
                        }
                    }
                ]
            };

            var bodyPayload = GeneralESService.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);
            var bodyPayloadStr = JSON.stringify(bodyPayload).replace(/\+/g, '%2b');

            var srcUrl = '/mmsc-troubleshooting-local-rest/v2/elastic-search/export';
            srcUrl += '?response-content-type=' + mimeType;
            srcUrl += '&query=' + encodeURIComponent(bodyPayloadStr);

            $log.debug('Downloading MMSC Transient Records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

        $scope.mmscTransientEdrList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 100, // count per page
            sorting: {
                "eventTime": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredTransientRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findMmscTransientEdrs(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found transient records: ", response);

                        // Slide Up and hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.mmscTransientEdrList.showTable = true;

                        deferredTransientRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredTransientRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredTransientRecordsQuery.promise.then(function (response) {
                    $scope.mmscTransientEdrList.list = $scope.filterFields(response.hits.hits);

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.mmscTransientEdrList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - MMSC transient edr list

        // Message content modal window.
        $scope.showMessageContent = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/mmsc/troubleshooting/troubleshooting.edr.messagecontent.html',
                size: 'lg',
                resolve: {
                    contentIdList: function () {
                        var deferred = $q.defer();

                        MmscTroubleshootingService.getContentIdList(edrRecord.messageID).then(function (response) {
                            deferred.resolve(response);
                        }, function (response) {
                            notification({
                                type: 'warning',
                                text: response.data.message
                            });
                            $log.debug('Error: ', response);
                        });

                        return deferred.promise;
                    }
                },
                controller: function ($scope, $uibModalInstance, FileDownloadService, contentIdList) {
                    $scope.restServicePath = '/mmsc-troubleshooting-local-rest/v2';
                    $scope.edrRecord = edrRecord;
                    $scope.messageID = edrRecord.messageID;
                    $scope.tableParams = new NgTableParams({
                        page: 1, // show first page
                        count: 10, // count per page
                        sorting: {
                            "value": 'desc'
                        }
                    }, {
                        $scope: $scope,
                        getData: function ($defer, params) {
                            if (contentIdList.map) {
                                params.total(contentIdList.map.entry.length);
                                $defer.resolve(contentIdList.map.entry);
                            } else {
                                params.total(0);
                                $defer.resolve([]);
                            }
                        }
                    });

                    $scope.downloadFile = function (messageID, key) {
                        var srcUrl = $scope.restServicePath + '/' + messageID + '/' + key;
                        FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                            var contentFile = blob;
                            if (blob) {
                                contentFile.name = fileName;

                                var fileUrl = URL.createObjectURL(blob);
                                // Open a new tab and set the location to the Object URL
                                var fileWindow = window.open(fileUrl, '_blank');
                                // if (!fileWindow) {
                                //     alert('Popup blocked! Please allow popups for this website.');
                                // }
                                // setTimeout(() => URL.revokeObjectURL(fileUrl), 20000); // 20 seconds delay
                            }
                        });

                    };

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

        // Cancel sending temporary message.
        $scope.cancelSending = function (edr) {
            cancelOrSendImmediately(edr, true)
        };

        // Send message now.
        $scope.sendItNow = function (edr) {
            cancelOrSendImmediately(edr, false)
        };

        var handleResponse = function (response) {
            // Handle the response of the service.
            $log.debug('Response: ', response);

            if(response && (response.code || response.errorCode)) {
                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.ApiError', {
                        errorCode: response.code || response.errorCode,
                        errorText: response.message || response.errorMsg
                    })
                });

            } else {
                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
            }
        };

        var cancelOrSendImmediately = function (edr, isCancel) {
            var message = {
                messageId: edr.messageID,
                recipient: edr.recipient.address
            };
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partials/modal/modal.confirmation.operation.html',
                size: 'sm',
                resolve: {
                    message: function () {
                        return message;
                    },
                    edr: function () {
                        return edr;
                    }
                },
                controller: function ($scope, $sce, $uibModalInstance, edr, message) {
                    edr.rowSelected = true;
                    var messageText = $translate.instant((isCancel ? 'Products.MMSC.Troubleshooting.MessageContent.CancelSending' : 'Products.MMSC.Troubleshooting.MessageContent.SendItNow'), {
                        "sender.address": edr.sender.address,
                        "recipient.address": edr.recipient.address
                    });
                    $scope.confirmationMessage = $sce.trustAsHtml(messageText);
                    $scope.ok = function () {
                        $uibModalInstance.close(message);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (message) {
                edr.rowSelected = false;
                $log.debug('Cancelling edr: ', edr);

                if (isCancel) {
                    $log.debug('Cancelling message id: ', message.messageId);
                    MmscTroubleshootingService.cancelMessage(message.messageId, message.recipient).then(function (response) {
                        handleResponse(response);
                        $scope.mmscTransientEdrList.list = _.without($scope.mmscTransientEdrList.list.edr);
                        $scope.mmscTransientEdrList.tableParams.reload();
                    }, function (response) {
                        $log.debug('Cannot cancel sending the message: ', response);
                    });
                } else {
                    $log.debug('Send message now id: ', message.messageId);
                    MmscTroubleshootingService.retryMessage(message.messageId, message.recipient).then(function (response) {
                        $log.debug('Send message-now response: ', response);
                        handleResponse(response);
                    }, function (response) {
                        $log.debug('Cannot send the message: ', response);
                        notification({
                            type: 'warning',
                            text: response.data.message
                        });
                    });
                }
            }, function () {
                edr.rowSelected = false;
            });
        };

    });

    MmscTroubleshootingModule.controller('MmscTroubleshootingHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams, DateTimeConstants) {
        $log.debug('MmscTroubleshootingHistoryCtrl');

        // MMSC detail history list
        var mmscEdrHistoryList = {
            list: [],
            tableParams: {}
        };
        mmscEdrHistoryList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "_source.eventTime": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(mmscEdrHistoryList.list, params.orderBy()) : mmscEdrHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MMSC detail history list

        // History modal window.
        $scope.showMmscHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/mmsc/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $uibModalInstance, mmscHistoryEdrs, edrRecord, mmscEdrHistoryList, isPermanent, DateTimeConstants) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'submitTime',
                                headerKey: 'Products.MMSC.Troubleshooting.TableColumns.SubmitDate',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'eventTime',
                                headerKey: (isPermanent ? 'Products.MMSC.Troubleshooting.TableColumns.CompletionDate' : 'Products.MMSC.Troubleshooting.TableColumns.EventDate'),
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'recordTypeText',
                                headerKey: 'Products.MMSC.Troubleshooting.TableColumns.CDRType'
                            },
                            {
                                fieldName: 'finalStatus',
                                headerKey: 'Products.MMSC.Troubleshooting.TableColumns.Result',
                                filter: {name: 'MmscEDRStatusFilter'}
                            },
                            {
                                fieldName: 'reasonText',
                                headerKey: 'Products.MMSC.Troubleshooting.TableColumns.ReasonInfo'
                            }
                        ]
                    };

                    $scope.isPermanent = isPermanent;

                    $scope.edrRecord = edrRecord;
                    $scope.mmscEdrHistoryList = mmscEdrHistoryList;

                    $scope.mmscEdrHistoryList.list = mmscHistoryEdrs.hits.hits;
                    _.each($scope.mmscEdrHistoryList.list, function (record) {
                        record._source.submitTime = $scope.edrRecord.submitTime;

                        record._source.recordTypeText = $filter('MmscEDRTypeFilter')(record._source.recordType) + ' [' + record._source.recordType + ']';

                        if (record._source.status) {
                            record._source.reasonText = $filter('uppercase')(record._source.status.text) + ' [' + record._source.status.context + '-' + record._source.status.code + ']';
                        } else {
                            record._source.reasonText = '';
                        }
                    });

                    $scope.mmscEdrHistoryList.tableParams.page(1);
                    $scope.mmscEdrHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    mmscHistoryEdrs: function (GeneralESService) {
                        var recipientAddress = edrRecord.recipient ? edrRecord.recipient.address : undefined;

                        return GeneralESService.findMmscHistoryEdrs(edrRecord.messageID, recipientAddress);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    mmscEdrHistoryList: function () {
                        return mmscEdrHistoryList;
                    },
                    isPermanent: function () {
                        return $scope.isPermanent;
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

    MmscTroubleshootingModule.controller('MmscTroubleshootingSummarizeCtrl', function ($scope, $log) {
        $log.debug('MmscTroubleshootingSummarizeCtrl');

        $scope.summarize = {
            permanent: 0,
            transient: 0,
            delivered: 0,
            undelivered: 0
        };
    });

})();
