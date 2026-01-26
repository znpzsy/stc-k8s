(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.troubleshooting', []);

    var BulkMessagingTroubleshootingModule = angular.module('adminportal.products.bulkmessaging.troubleshooting');

    BulkMessagingTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('products.bulkmessaging.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "products/bulkmessaging/troubleshooting/troubleshooting.html",
            controller: "BulkMessagingTroubleshootingCtrl",
            data: {
                permissions: [
                    'READ_ALL_TROUBLESHOOTING'
                ]
            },
            resolve: {
                organizations: function ($rootScope, $stateParams, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    if ($rootScope.isBMSAdminUser) {
                        return CMPFService.getAllOperatorsAndPartners(false, true, [CMPFService.OPERATOR_PROFILE, CMPFService.BULK_ORGANIZATION_PROFILE]);
                    } else {
                        return {organizations: []};
                    }
                }
            }
        });

    });

    BulkMessagingTroubleshootingModule.controller('BulkMessagingTroubleshootingCtrl', function ($rootScope, $scope, $log, $controller, $timeout, $filter, Restangular, DateTimeConstants,
                                                                                                CMPFService, organizations, DEFAULT_REST_QUERY_LIMIT, BMS_JOB_TYPES) {
        $log.debug('BulkMessagingTroubleshootingCtrl');

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.filterFormLayer = {
            isFilterFormOpen: true
        };

        $scope.BMS_JOB_TYPES = BMS_JOB_TYPES;

        // Organization list
        var organizationList = _.filter(organizations.organizations, function (organization) {
            return CMPFService.getBulkOrganizationProfile(organization) !== undefined;
        });
        $scope.organizationList = $filter('orderBy')(organizationList, ['orgType', 'name']);

        $scope.userAccountList = [];
        var getUserAccounts = function (organizationId) {
            // Find out the users of the selected organization.
            CMPFService.getUserAccountsByOrganizationId(0, DEFAULT_REST_QUERY_LIMIT, false, true, organizationId).then(function (userAccounts) {
                if (userAccounts && userAccounts.userAccounts) {
                    // Filter out the bulk messaging users and whether these are bulk sms users.
                    $scope.userAccountList = _.filter(userAccounts.userAccounts, function (userAccount) {
                        var bulkUserProfile = CMPFService.extractBulkUserProfile(userAccount);
                        if (!_.isEmpty(bulkUserProfile)) {
                            return bulkUserProfile.isBulkSmsUser;
                        }

                        return false;
                    });
                    $scope.userAccountList = $filter('orderBy')(userAccountList, ['name']);
                }
            });
        }

        // Organization selection.
        $scope.changeOrganization = function (organizationId) {
            $log.debug("Selected organization: ", organizationId);

            if (organizationId) {
                getUserAccounts(organizationId);
            } else {
                $scope.userAccountList = [];
            }
        };

        // Set default values of the filter fields.
        if (!$rootScope.isBMSAdminUser) {
            $scope.dateFilter.organizationId = $rootScope.systemUserOrganizationId;
            $scope.dateFilter.userId = $rootScope.systemUserId;
        }

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
                organizationId: dateFilter.organizationId,
                userId: dateFilter.userId
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
            $scope.reloadTable($scope.bulkSMSActivityHistory.tableParams, true);
            $scope.reloadTable($scope.bulkMMSActivityHistory.tableParams, true);
            $scope.reloadTable($scope.bulkIVRActivityHistory.tableParams, true);
        }, 500);

        $scope.filterBulkSMSTable = _.debounce(function (text, columns) {
            // Get the Bulk SMS data 
            $scope.bulkSMSActivityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.bulkSMSActivityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.bulkSMSActivityHistory.tableParams, true);
        }, 500);

        $scope.filterBulkMMSTable = _.debounce(function (text, columns) {
            // Get the Bulk MMS data
            $scope.bulkMMSActivityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.bulkMMSActivityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.bulkMMSActivityHistory.tableParams, true);
        }, 500);

        $scope.filterBulkIVRTable = _.debounce(function (text, columns) {
            // Get the Bulk IVR data 
            $scope.bulkIVRActivityHistory.tableParams.settings().$scope.quickSearchText = text;
            $scope.bulkIVRActivityHistory.tableParams.settings().$scope.quickSearchColumns = columns;

            $scope.reloadTable($scope.bulkIVRActivityHistory.tableParams, true);
        }, 500);

        // Calling the table controller which initializes ngTable objects, filters and listeners.
        $controller('BulkMessagingTroubleshootingCommonHistoryCtrl', {$scope: $scope});

        $controller('BulkMessagingTroubleshootingBulkSMSTableCtrl', {$scope: $scope});
        $controller('BulkMessagingTroubleshootingBulkMMSTableCtrl', {$scope: $scope});
        $controller('BulkMessagingTroubleshootingBulkIVRTableCtrl', {$scope: $scope});

        $controller('BulkMessagingTroubleshootingHistoryCtrl', {$scope: $scope});
    });

    BulkMessagingTroubleshootingModule.controller('BulkMessagingTroubleshootingCommonHistoryCtrl', function ($scope, $log, $filter, DateTimeConstants, $uibModal, BMS_JOB_TYPES) {
        $log.debug('BulkMessagingTroubleshootingCommonHistoryCtrl');

        $scope.exportFileName = 'BulkSMSHistory';
        $scope.$watch('edrType', function (newVal, oldVal) {
            if (newVal === BMS_JOB_TYPES.BULK_SMS) {
                $scope.exportFileName = 'BulkSMSHistory';
            } else if (newVal === BMS_JOB_TYPES.BULK_MMS) {
                $scope.exportFileName = 'BulkMMSHistory';
            } else if (newVal === BMS_JOB_TYPES.BULK_IVR) {
                $scope.exportFileName = 'BulkIVRHistory';
            }
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'transactionTimestamp',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.Date',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'organizationName',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.Organization'
                },
                {
                    fieldName: 'userName',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.User'
                },
                {
                    fieldName: 'jobId',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.CampaignId'
                },
                {
                    fieldName: 'jobDescription',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.Campaign'
                },
                {
                    fieldName: 'channel',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.Channel',
                    filter: {name: 'BMSChannelFilter'}
                },
                {
                    fieldName: 'jobFrom',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.From'
                },
                {
                    fieldName: 'jobListName',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.To'
                },
                {
                    fieldName: 'jobStatus',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.CampaignStatus',
                    filter: {name: 'BMSJobStatusFilter'}
                },
                {
                    fieldName: 'jobSenderMsisdn',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.JobSenderMsisdn'
                },
                {
                    fieldName: 'jobMaxRetryCount',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.JobMaxRetryCount'
                },
                {
                    fieldName: 'jobExpiryEnabled',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.JobExpiryEnabled',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'jobExpiryDate',
                    headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.JobExpiryDate',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                }
            ]
        };

        $scope.showBulkMessagingDetails = function (edrRecord, pageHeaderKey) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/bulkmessaging/troubleshooting/troubleshooting.edr.details.html',
                controller: function ($scope, $uibModalInstance, edrRecord, distributionList, screeningLists) {
                    edrRecord.rowSelected = true;

                    $scope.pageHeaderKey = pageHeaderKey;

                    $scope.edrRecord = edrRecord;

                    $scope.edrRecord.distributionListName = 'N/A';
                    $scope.edrRecord.distributionListSize = 'N/A';
                    if (distributionList && distributionList.id) {
                        $scope.edrRecord.distributionListName = distributionList.name + ' [' + distributionList.id + ']';
                        $scope.edrRecord.distributionListSize = distributionList.listSize;
                    }

                    $scope.edrRecord.screeningLists = 'N/A';
                    if (screeningLists && screeningLists.length > 0) {
                        $scope.edrRecord.screeningLists = screeningLists;
                    }

                    $scope.isJobExpiryEnabled = function (edrRecord) {
                        return Number(edrRecord.jobExpiryEnabled) > 0;
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
                    distributionList: function ($q, BulkMessagingOperationsService) {
                        var deferred = $q.defer();

                        if (edrRecord.jobListName && edrRecord.jobListName !== '0') {
                            BulkMessagingOperationsService.getDistributionList(edrRecord.jobListName).then(function (response) {
                                deferred.resolve(response);
                            }, function (response) {
                                deferred.resolve({});
                            });
                        } else {
                            deferred.resolve({});
                        }

                        return deferred.promise;
                    },
                    screeningLists: function ($q, BulkMessagingOperationsService) {
                        var deferred = $q.defer();

                        if (edrRecord.jobBlackLists && edrRecord.jobBlackLists !== 'null') {
                            var jobBlackListNames = edrRecord.jobBlackLists.split(',');
                            var promises = [];

                            _.each(jobBlackListNames, function (jobBlackListName) {
                                promises.push(BulkMessagingOperationsService.getDistributionList(jobBlackListName));
                            });

                            $q.all(promises).then(function (results) {
                                deferred.resolve(results);
                            }, function (response) {
                                deferred.resolve([]);
                            });
                        } else {
                            deferred.resolve([]);
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
    });

    BulkMessagingTroubleshootingModule.controller('BulkMessagingTroubleshootingBulkSMSTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                            UtilService, GeneralESService) {
        $log.debug('BulkMessagingTroubleshootingBulkSMSTableCtrl');

        // Activity history list of current scope definitions
        $scope.bulkSMSActivityHistory = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.bulkSMSActivityHistory.tableParams = new NgTableParams({
            page: 1,
            count: 100,
            sorting: {
                "transactionTimestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;
                additionalFilterFields.jobType = $scope.BMS_JOB_TYPES.BULK_SMS;

                var deferredRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findBMSHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.bulkSMSActivityHistory.showTable = true;

                        deferredRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.bulkSMSActivityHistory.list = response.hits.hits;

                    _.each($scope.bulkSMSActivityHistory.list, function (record) {
                        record._source.organizationName = 'N/A';
                        var organization = _.findWhere($scope.organizationList, {id: Number(record._source.organizationId)});
                        if (organization) {
                            record._source.organizationName = organization.name;
                        }
                    });

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.bulkSMSActivityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

        // Details modal window.
        $scope.showBulkSMSDetails = function (edrRecord) {
            var pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.Details.BulkSMSPageHeader';
            $scope.showBulkMessagingDetails(edrRecord, pageHeaderKey);
        };

        // Content modal window.
        $scope.viewBulkSMSContent = function (edrRecord) {
            $uibModal.open({
                animation: false,
                templateUrl: 'products/bulkmessaging/troubleshooting/troubleshooting.edr.content.html',
                controller: function ($scope, $uibModalInstance, edrRecord) {
                    $scope.edrRecord = edrRecord;

                    $scope.pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.Contents.BulkSMSPageHeader';

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
        };

    });

    BulkMessagingTroubleshootingModule.controller('BulkMessagingTroubleshootingBulkMMSTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                            UtilService, GeneralESService) {
        $log.debug('BulkMessagingTroubleshootingBulkMMSTableCtrl');

        // Activity history list of current scope definitions
        $scope.bulkMMSActivityHistory = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.bulkMMSActivityHistory.tableParams = new NgTableParams({
            page: 1,
            count: 100,
            sorting: {
                "transactionTimestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;
                additionalFilterFields.jobType = $scope.BMS_JOB_TYPES.BULK_MMS;

                var deferredRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findBMSHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.bulkMMSActivityHistory.showTable = true;

                        deferredRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.bulkMMSActivityHistory.list = response.hits.hits;

                    _.each($scope.bulkMMSActivityHistory.list, function (record) {
                        record._source.organizationName = 'N/A';
                        var organization = _.findWhere($scope.organizationList, {id: Number(record._source.organizationId)});
                        if (organization) {
                            record._source.organizationName = organization.name;
                        }
                    });

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.bulkMMSActivityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

        // Details modal window.
        $scope.showBulkMMSDetails = function (edrRecord) {
            var pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.Details.BulkMMSPageHeader';
            $scope.showBulkMessagingDetails(edrRecord, pageHeaderKey);
        };
    });

    BulkMessagingTroubleshootingModule.controller('BulkMessagingTroubleshootingBulkIVRTableCtrl', function ($scope, $log, $q, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                            UtilService, GeneralESService) {
        $log.debug('BulkMessagingTroubleshootingBulkIVRTableCtrl');

        // Activity history list of current scope definitions
        $scope.bulkIVRActivityHistory = {
            list: [],
            showTable: false,
            tableParams: {}
        };

        $scope.bulkIVRActivityHistory.tableParams = new NgTableParams({
            page: 1,
            count: 100,
            sorting: {
                "transactionTimestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;
                additionalFilterFields.jobType = $scope.BMS_JOB_TYPES.BULK_IVR;

                var deferredRecordsQuery = $q.defer();
                if (params.settings().$scope.askService) {
                    GeneralESService.findBMSHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.bulkIVRActivityHistory.showTable = true;

                        deferredRecordsQuery.resolve(response);
                    }, function (error) {
                        deferredRecordsQuery.reject(error);
                    });
                }

                // Listen the response of the above query.
                deferredRecordsQuery.promise.then(function (response) {
                    $scope.bulkIVRActivityHistory.list = response.hits.hits;

                    _.each($scope.bulkIVRActivityHistory.list, function (record) {
                        record._source.organizationName = 'N/A';
                        var organization = _.findWhere($scope.organizationList, {id: Number(record._source.organizationId)});
                        if (organization) {
                            record._source.organizationName = organization.name;
                        }
                    });

                    params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                    $defer.resolve($scope.bulkIVRActivityHistory.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
            }
        });
        // END - Activity history list definitions

        // Details modal window.
        $scope.showBulkIVRDetails = function (edrRecord) {
            var pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.Details.BulkIVRPageHeader';
            $scope.showBulkMessagingDetails(edrRecord, pageHeaderKey);
        };

        // Content modal window.
        $scope.viewBulkIVRContent = function (edrRecord) {
            $uibModal.open({
                animation: false,
                templateUrl: 'products/bulkmessaging/troubleshooting/troubleshooting.edr.content.html',
                controller: function ($scope, $uibModalInstance, edrRecord) {
                    $scope.edrRecord = edrRecord;

                    $scope.pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.Contents.BulkIVRPageHeader';

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
        };

    });

    BulkMessagingTroubleshootingModule.controller('BulkMessagingTroubleshootingHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                       GeneralESService, DateTimeConstants) {
        $log.debug('BulkMessagingTroubleshootingHistoryCtrl');

        // Bulk Messaging detail history list
        var bulkSMSActivityHistoryDetailedHistoryList = {
            list: [],
            tableParams: {}
        };
        bulkSMSActivityHistoryDetailedHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.transactionTimestamp": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(bulkSMSActivityHistoryDetailedHistoryList.list, params.orderBy()) : bulkSMSActivityHistoryDetailedHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Bulk Messaging detail history list

        // History modal window.
        $scope.showBMSHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'products/bulkmessaging/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $filter, $uibModalInstance, bmsEdrs, edrRecord, edrType, BMS_JOB_TYPES,
                                      bulkSMSActivityHistoryDetailedHistoryList) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'transactionTimestamp',
                                headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.HistoryEventDate',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'jobStatus',
                                headerKey: 'Products.BulkMessaging.Troubleshooting.TableColumns.CampaignStatus',
                                filter: {name: 'BMSJobStatusFilter'}
                            }
                        ]
                    };

                    $scope.pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.History.BulkSMSPageHeader';
                    $scope.exportFileName = 'BulkSMSHistoryDetails';
                    if (edrType === BMS_JOB_TYPES.BULK_MMS) {
                        $scope.pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.History.BulkMMSPageHeader';
                        $scope.exportFileName = 'BulkMMSHistoryDetails';
                    } else if (edrType === BMS_JOB_TYPES.BULK_IVR) {
                        $scope.pageHeaderKey = 'Products.BulkMessaging.Troubleshooting.History.BulkIVRPageHeader';
                        $scope.exportFileName = 'BulkIVRHistoryDetails';
                    }

                    $scope.edrRecord = edrRecord;

                    $scope.bulkSMSActivityHistoryDetailedHistoryList = bulkSMSActivityHistoryDetailedHistoryList;

                    $scope.bulkSMSActivityHistoryDetailedHistoryList.list = $filter('orderBy')(bmsEdrs.hits.hits, '_source.transactionTimestamp');

                    var currentList = $scope.bulkSMSActivityHistoryDetailedHistoryList.list;
                    if (currentList.length > 0) {
                        $scope.submitDate = currentList[0]._source.transactionTimestamp;
                        $scope.completionDate = currentList[currentList.length - 1]._source.transactionTimestamp;
                    }

                    $scope.bulkSMSActivityHistoryDetailedHistoryList.tableParams.page(1);
                    $scope.bulkSMSActivityHistoryDetailedHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    bmsEdrs: function (GeneralESService) {
                        return GeneralESService.findBMSDetailedHistory(edrRecord.jobId);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    edrType: function () {
                        return $scope.edrType;
                    },
                    bulkSMSActivityHistoryDetailedHistoryList: function () {
                        return bulkSMSActivityHistoryDetailedHistoryList;
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
