(function () {

    'use strict';

    angular.module('adminportal.workflows.troubleshooting', []);

    var WorkflowsTroubleshootingModule = angular.module('adminportal.workflows.troubleshooting');

    WorkflowsTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('workflows.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "workflows/troubleshooting/troubleshooting.html",
            controller: 'WorkflowsTroubleshootingCtrl',
            data: {
                permissions: [
                    'READ_ALL_TROUBLESHOOTING'
                ]
            },
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices(true);
                },
                userAccounts: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getUserAccounts(0, DEFAULT_REST_QUERY_LIMIT, true);
                }
            }
        });

    });

    WorkflowsTroubleshootingModule.controller('WorkflowsTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, $uibModal, Restangular, UtilService, DateTimeConstants,
                                                                                        GeneralESService, ReportingExportService, services, userAccounts, WORKFLOWS_RESOURCE_TYPES,
                                                                                        WORKFLOWS_OPERATION_TYPES, WORKFLOWS_PROCESS_STATUSES) {
        $log.debug('WorkflowsTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.WORKFLOWS_RESOURCE_TYPES = WORKFLOWS_RESOURCE_TYPES;
        $scope.WORKFLOWS_OPERATION_TYPES = WORKFLOWS_OPERATION_TYPES;
        $scope.WORKFLOWS_PROCESS_STATUSES = WORKFLOWS_PROCESS_STATUSES;

        // User account list
        $scope.userAccountList = userAccounts.userAccounts;

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['organization.name']);

        $scope.filterFormLayer = {
            isFilterFormOpen: true
        };

        $scope.resourceTypeFilter = 'ALL';
        $scope.resourceTypeFilterChange = function (resourceType) {
            if (resourceType === 'ALL') {
                $scope.dateFilter.resourceType = null;
            } else {
                $scope.dateFilter.resourceType = resourceType;
            }

            $scope.throttledReloadTable();
        };

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
                username: dateFilter.username,
                clientIp: dateFilter.clientIp,
                resourceType: dateFilter.resourceType,
                resourceId: dateFilter.resourceId,
                operationType: dateFilter.operationType,
                processStatus: dateFilter.processStatus
            };

            if (dateFilter.resourceType) {
                $scope.resourceTypeFilter = dateFilter.resourceType;
            }

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

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'workflows/troubleshooting/troubleshooting.edr.details.modal.html',
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

        // Payload modal window.
        $scope.showPayload = function (edrRecord) {
            $uibModal.open({
                animation: false,
                templateUrl: 'workflows/troubleshooting/troubleshooting.edr.payload.modal.html',
                controller: function ($scope, $uibModalInstance, edrRecord, payload) {
                    $scope.edrRecord = edrRecord;

                    $scope.payload = {
                        header: s(edrRecord.resourceType + ' ' + edrRecord.operationType).humanize().titleize().value()
                    };

                    if (edrRecord.resourceType === 'PARTNER') {
                        $scope.payload.header += ' [Partner = ' + (edrRecord.partnerName || '') + ']';
                    } else if (edrRecord.resourceType === 'SERVICE') {
                        $scope.payload.header += ' [Service = ' + (edrRecord.serviceName || '') + ']';
                    } else if (edrRecord.resourceType === 'OFFER') {
                        $scope.payload.header += ' [Offer = ' + (edrRecord.offerName || '') + ']';
                    } else if (edrRecord.resourceType === 'CONTENT_METADATA') {
                        $scope.payload.header += ' [Content = ' + (edrRecord.contentMetadataName || '') + ']';
                    } else if (edrRecord.resourceType === 'CONTENT_FILE') {
                        $scope.payload.header += ' [Content File = ' + (edrRecord.contentFileName || '') + ']';
                    } else if (edrRecord.resourceType === 'SHORT_CODE') {
                        $scope.payload.header += ' [Short Code = ' + (edrRecord.shortCodeName || '') + ']';
                    } else if (edrRecord.resourceType === 'CAMPAIGN_SMS') {
                        $scope.payload.header += ' [Campaign SMS = ' + (edrRecord.campaignName || '') + ']';
                    } else if (edrRecord.resourceType === 'CAMPAIGN_MMS') {
                        $scope.payload.header += ' [Campaign MMS = ' + (edrRecord.campaignName || '') + ']';
                    } else if (edrRecord.resourceType === 'CAMPAIGN_IVR') {
                        $scope.payload.header += ' [Campaign IVR = ' + (edrRecord.campaignName || '') + ']';
                    } else if (edrRecord.resourceType === 'INTERACTIVE_CAMPAIGN_SMS') {
                        $scope.payload.header += ' [Interactive Campaign SMS = ' + (edrRecord.campaignName || '') + ']';
                    } else if (edrRecord.resourceType === 'INTERACTIVE_CAMPAIGN_IVR' || edrRecord.resourceType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                        $scope.payload.header += ' [Interactive Campaign IVR = ' + (edrRecord.campaignName || '') + ']';
                    } else if (edrRecord.resourceType === 'RBT_CATEGORY') {
                        $scope.payload.header += ' [RBT Category = ' + (edrRecord.name || '') + ']';
                    } else if (edrRecord.resourceType === 'RBT_MOOD') {
                        $scope.payload.header += ' [RBT Mood = ' + (edrRecord.name || '') + ']';
                    } else if (edrRecord.resourceType === 'RBT_TONE') {
                        $scope.payload.header += ' [RBT Tone = ' + (edrRecord.name || '') + ']';
                    } else if (edrRecord.resourceType === 'RBT_ARTIST') {
                        $scope.payload.header += ' [RBT Artist = ' + (edrRecord.name || '') + ']';
                    } else if (edrRecord.resourceType === 'RBT_ALBUM') {
                        $scope.payload.header += ' [RBT Album = ' + (edrRecord.name || '') + ']';
                    }

                    if (payload && payload.hits.hits.length > 0) {
                        $scope.payload.body = JSON.stringify(payload.hits.hits[0]._source.payload, null, Number(4));
                    }

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    edrRecord: function () {
                        return edrRecord._source;
                    },
                    payload: function (GeneralESService) {
                        return GeneralESService.findWorkflowsPayload(edrRecord._source.flowId);
                    }
                }
            });
        };

        $scope.filterFields = function (list) {
            _.each(list, function (item) {
                var record = item._source;

                if (record.resourceType === 'PARTNER') {
                    record.resourceId = record.partnerId;
                } else if (record.resourceType === 'SERVICE') {
                    record.resourceId = record.serviceId;
                } else if (record.resourceType === 'OFFER') {
                    record.resourceId = record.offerId;
                } else if (record.resourceType === 'CONTENT_METADATA') {
                    record.resourceId = record.contentMetadataId;
                } else if (record.resourceType === 'CONTENT_FILE') {
                    record.resourceId = record.contentFileId;
                } else if (record.resourceType === 'SHORT_CODE') {
                    record.resourceId = record.shortCodeId;
                } else if (record.resourceType === 'CAMPAIGN_SMS') {
                    record.resourceId = record.campaignId;
                } else if (record.resourceType === 'CAMPAIGN_MMS') {
                    record.resourceId = record.campaignId;
                } else if (record.resourceType === 'CAMPAIGN_IVR') {
                    record.resourceId = record.campaignId;
                } else if (record.resourceType === 'INTERACTIVE_CAMPAIGN_SMS') {
                    record.resourceId = record.campaignId;
                } else if (record.resourceType === 'INTERACTIVE_CAMPAIGN_IVR') {
                    record.resourceId = record.campaignId;
                } else if (record.resourceType === 'INTERACTIVE_CAMPAIGN_FAST_KEY') {
                    record.resourceId = record.campaignId;
                } else if (record.resourceType === 'RBT_CATEGORY') {
                    record.resourceId = record.rbtContentId;
                } else if (record.resourceType === 'RBT_MOOD') {
                    record.resourceId = record.rbtContentId;
                } else if (record.resourceType === 'RBT_TONE') {
                    record.resourceId = record.rbtContentId;
                } else if (record.resourceType === 'RBT_ARTIST') {
                    record.resourceId = record.rbtContentId;
                } else if (record.resourceType === 'RBT_ALBUM') {
                    record.resourceId = record.rbtContentId;
                }
            });

            return list;
        };

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('WorkflowsTroubleshootingTableCtrl', {$scope: $scope});
        $controller('WorkflowsTroubleshootingHistoryCtrl', {$scope: $scope});
    });

    WorkflowsTroubleshootingModule.controller('WorkflowsTroubleshootingTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams, UtilService,
                                                                                             GeneralESService, DateTimeConstants, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('WorkflowsTroubleshootingTableCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'time',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'username',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.Username'
                },
                {
                    fieldName: 'clientIp',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.ClientIp'
                },
                {
                    fieldName: 'resourceType',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.ResourceType'
                },
                {
                    fieldName: 'resourceId',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.ResourceId'
                },
                {
                    fieldName: 'operationType',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.OperationType'
                },
                {
                    fieldName: 'processStatus',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.ProcessStatus'
                },
                {
                    fieldName: 'mobilePhone',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.MobilePhone'
                },
                {
                    fieldName: 'applicantName',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.ApplicantName'
                },
                {
                    fieldName: 'position',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.Position'
                },
                {
                    fieldName: 'flowId',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.FlowId'
                },
                {
                    fieldName: 'email',
                    headerKey: 'Workflows.Troubleshooting.TableColumns.Email'
                }
            ]
        };

        var exportAllData = function (fileNamePrefix, exporter) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.activityHistory.tableParams);

            var filter = preparedFilter.filter;
            // Set the offset and limit to reasonable numbers.
            filter.offset = 0;
            filter.limit = TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION;

            var additionalFilterFields = preparedFilter.additionalFilterFields;

            GeneralESService.findWorkflowsRecords(filter, additionalFilterFields).then(function (response) {
                var exportingDataList = $scope.filterFields(response.hits.hits);
                exportingDataList = $filter('orderBy')(exportingDataList, '_source.time');

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
                "time": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                var deferredRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findWorkflowsRecords(filter, additionalFilterFields).then(function (response) {
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

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.activityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions
    });

    WorkflowsTroubleshootingModule.controller('WorkflowsTroubleshootingHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams) {
        $log.debug('WorkflowsTroubleshootingHistoryCtrl');

        // Workflows detailed history list
        var workflowsDetailedHistoryList = {
            list: [],
            tableParams: {}
        };
        workflowsDetailedHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.time": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(workflowsDetailedHistoryList.list, params.orderBy()) : workflowsDetailedHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Workflows detailed history list

        // History modal window.
        $scope.showHistory = function (edrRecord) {
            if (edrRecord.flowId) {
                edrRecord.rowSelected = true;

                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'workflows/troubleshooting/troubleshooting.edr.history.modal.html',
                    controller: function ($scope, $filter, $uibModalInstance, DateTimeConstants, workflowsEdrs, edrRecord, edrType,
                                          workflowsDetailedHistoryList, showDetails, filterFields) {
                        $scope.filterFields = filterFields;

                        $scope.historyExportOptions = {
                            columns: [
                                {
                                    fieldName: 'time',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.Date',
                                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                                },
                                {
                                    fieldName: 'username',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.Username'
                                },
                                {
                                    fieldName: 'clientIp',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.ClientIp'
                                },
                                {
                                    fieldName: 'resourceType',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.ResourceType'
                                },
                                {
                                    fieldName: 'operationType',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.OperationType'
                                },
                                {
                                    fieldName: 'processStatus',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.ProcessStatus'
                                },
                                {
                                    fieldName: 'mobilePhone',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.MobilePhone'
                                },
                                {
                                    fieldName: 'applicantName',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.ApplicantName'
                                },
                                {
                                    fieldName: 'position',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.Position'
                                },
                                {
                                    fieldName: 'flowId',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.FlowId'
                                },
                                {
                                    fieldName: 'email',
                                    headerKey: 'Workflows.Troubleshooting.TableColumns.Email'
                                }
                            ]
                        };

                        $scope.edrRecord = edrRecord;

                        $scope.workflowsDetailedHistoryList = workflowsDetailedHistoryList;

                        $scope.workflowsDetailedHistoryList.list = $scope.filterFields(workflowsEdrs.hits.hits);
                        $scope.workflowsDetailedHistoryList.list = $filter('orderBy')($scope.workflowsDetailedHistoryList.list, '_source.time');

                        $scope.workflowsDetailedHistoryList.tableParams.page(1);
                        $scope.workflowsDetailedHistoryList.tableParams.reload();

                        $scope.showDetails = showDetails;

                        $scope.close = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    },
                    size: 'lg',
                    resolve: {
                        workflowsEdrs: function (GeneralESService) {
                            return GeneralESService.findWorkflowsHistory(edrRecord.flowId);
                        },
                        edrRecord: function () {
                            return edrRecord;
                        },
                        edrType: function () {
                            return $scope.edrType;
                        },
                        workflowsDetailedHistoryList: function () {
                            return workflowsDetailedHistoryList;
                        },
                        showDetails: function () {
                            return $scope.showDetails;
                        },
                        filterFields: function () {
                            return $scope.filterFields;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    edrRecord.rowSelected = false;
                }, function () {
                    edrRecord.rowSelected = false;
                });
            }
        };
    });

})();
