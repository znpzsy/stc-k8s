(function () {

    'use strict';

    angular.module('partnerportal.partner-info.messaginggw.troubleshooting', []);

    var MessagingGwTroubleshootingModule = angular.module('partnerportal.partner-info.messaginggw.troubleshooting');

    MessagingGwTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.messaginggw', {
            abstract: true,
            url: "/messaging",
            template: "<div ui-view></div>"
        }).state('partner-info.messaginggw.troubleshooting', {
            abstract: true,
            url: "/history",
            templateUrl: "partner-info/messaginghistory/troubleshooting.html"
        }).state('partner-info.messaginggw.troubleshooting.sms', {
            url: "/sms",
            views: {
                'filter-form': {
                    templateUrl: 'partner-info/messaginghistory/troubleshooting.sms.filter.html',
                },
                'table': {
                    templateUrl: 'partner-info/messaginghistory/troubleshooting.sms.html',
                    controller: 'MessagingGwTroubleshootingSMSCtrl',
                    resolve: {
                        services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                            var organizationId = $rootScope.getOrganizationId();

                            return CMPFService.getServicesByOrganizationId(organizationId, true);
                        }
                    }
                }
            }
        }).state('partner-info.messaginggw.troubleshooting.mms', {
            url: "/mms",
            views: {
                'filter-form': {
                    templateUrl: 'partner-info/messaginghistory/troubleshooting.mms.filter.html',
                },
                'table': {
                    templateUrl: 'partner-info/messaginghistory/troubleshooting.mms.html',
                    controller: 'MessagingGwTroubleshootingMMSCtrl',
                    resolve: {
                        services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                            var organizationId = $rootScope.getOrganizationId();

                            return CMPFService.getServicesByOrganizationId(organizationId, true);
                        }
                    }
                }
            }
        });

    });

    MessagingGwTroubleshootingModule.controller('MessagingGwTroubleshootingCommonCtrl', function ($scope, $log, $q, $timeout, $filter, $controller, notification, $translate, $uibModal, NgTableParams,
                                                                                                  DateTimeConstants, GeneralESService, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION,
                                                                                                  edrRecordsMethod) {
        $log.debug('MessagingGwTroubleshootingCommonCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope.$parent});

        var organizationId = $scope.getOrganizationId();

        // Filter initializations
        $scope.$parent.dateFilter.startDate = $scope.getOneWeekAgo();
        $scope.$parent.dateFilter.startTime = $scope.getOneWeekAgo();

        $scope.$parent.filterFormLayer = {
            isFilterFormOpen: true
        };

        $scope.$parent.reloadTable = function (tableParams, isAskService, _pageNumber) {
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
                endDate: endDateIso,
                // Default add current organizationId value to filter object.
                organizationId: organizationId,
            };

            result.additionalFilterFields = {
                // Calling Party
                origAddress: dateFilter.origAddress,
                origAgentType: dateFilter.origAgentType,
                origAgentId: (dateFilter.origAgentType === 1 && dateFilter.origAgent ? dateFilter.origAgent : undefined), // Is application and origAgent selected
                // Called Party
                destAddress: dateFilter.destAddress,
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
            $scope.$parent.reloadTable($scope.activityHistory.tableParams, true);
        }, 500);

        $scope.$parent.filterTable = _.debounce(function (text, columns) {
            $scope.activityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.activityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.$parent.reloadTable($scope.activityHistory.tableParams, true);
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
                if (params.settings().$scope.askService) {
                    GeneralESService[edrRecordsMethod](filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.$parent.filterFormLayer.isFilterFormOpen = false;

                        $scope.activityHistory.showTable = true;

                        deferredRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
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
                                    text: $translate.instant('PartnerInfo.MessagingHistory.Troubleshooting.MessageDeliveryReport.NotFound')
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

    MessagingGwTroubleshootingModule.controller('MessagingGwTroubleshootingSMSCtrl', function ($scope, $log, $q, $filter, $controller, notification, $translate, $uibModal, Restangular, NgTableParams,
                                                                                               GeneralESService, DateTimeConstants, MSGGW_SMSC_AGENT_TYPES, services) {
        $log.debug('MessagingGwTroubleshootingSMSCtrl');

        // TODO - Temporarily hidden
        return;

        $scope.$parent.MSGGW_SMSC_AGENT_TYPES = MSGGW_SMSC_AGENT_TYPES;

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.$parent.allSMSCApplications = $filter('orderBy')(serviceList, ['organization.name']);

        $controller('MessagingGwTroubleshootingCommonCtrl', {
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

                record.origAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.origAgentType);
                record.destAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.destAgentType);

                record.drRequested = (String(record.drRequested) === 'true');
            });

            return list;
        };

        // Show details.
        $scope.showDetails = function (edrRecord) {
            $scope.showDetailsCommon(edrRecord, 'partner-info/messaginghistory/troubleshooting.sms.edr.details.html');
        };

        // Message content modal window.
        $scope.showMessageContent = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partner-info/messaginghistory/troubleshooting.sms.edr.messagecontent.html',
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
            $scope.showMessageDeliveryReportCommon(edrRecord, 'partner-info/messaginghistory/troubleshooting.sms.edr.messagedeliveryreport.html', GeneralESService.findMessagingGwSMSDeliveryReports);
        };
    });

    MessagingGwTroubleshootingModule.controller('MessagingGwTroubleshootingMMSCtrl', function ($scope, $log, $q, $filter, $controller, notification, $translate, $uibModal, Restangular, NgTableParams,
                                                                                               GeneralESService, DateTimeConstants, MSGGW_MMSC_AGENT_TYPES, services) {
        $log.debug('MessagingGwTroubleshootingMMSCtrl');

        // TODO - Temporarily hidden
        return;

        $scope.$parent.MSGGW_MMSC_AGENT_TYPES = MSGGW_MMSC_AGENT_TYPES;

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.$parent.allMMSCApplications = $filter('orderBy')(serviceList, ['organization.name']);

        $controller('MessagingGwTroubleshootingCommonCtrl', {
            $scope: $scope,
            edrRecordsMethod: 'findMessagingGwMMSRecords'
        });

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item._source;

                record.cdrTypeText = $filter('MessagingGwEDRTypeFilter')(record.cdrType);

                record.reasonText = (record.result > 0 ? $filter('MessagingGwEDRResultReasonFilter')(record.reasonContext, record.reason) : '');

                record.origAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.origAgentType);
                record.destAgentTypeText = $filter('MessagingGwAgentTypeFilter')(record.destAgentType);

                record.drRequested = (String(record.drRequested) === 'true');
            });

            return list;
        };

        // Show details.
        $scope.showDetails = function (edrRecord) {
            $scope.showDetailsCommon(edrRecord, 'partner-info/messaginghistory/troubleshooting.mms.edr.details.html');
        };

        // Show message delivery report.
        $scope.showMessageDeliveryReport = function (edrRecord) {
            $scope.showMessageDeliveryReportCommon(edrRecord, 'partner-info/messaginghistory/troubleshooting.mms.edr.messagedeliveryreport.html', GeneralESService.findMessagingGwMMSDeliveryReports);
        };
    });

})();
