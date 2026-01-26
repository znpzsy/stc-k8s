(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.troubleshooting', []);

    var ContentManagementTroubleshootingModule = angular.module('adminportal.subsystems.contentmanagement.troubleshooting');

    ContentManagementTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.troubleshooting', {
            url: "/troubleshooting",
            templateUrl: "subsystems/contentmanagement/troubleshooting/troubleshooting.html",
            controller: 'ContentManagementTroubleshootingCtrl',
            data: {
                permissions: [
                    'READ_ALL_TROUBLESHOOTING'
                ]
            },
            resolve: {
                allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getOrganizations(0,  DEFAULT_REST_QUERY_LIMIT, false, true, [CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE]);
                },
            }
        });

    });

    ContentManagementTroubleshootingModule.controller('ContentManagementTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, Restangular, DateTimeConstants, UtilService, CMPFService, allOrganizations) {

        $log.debug('ContentManagementTroubleshootingCtrl');
        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_RELATED_RESOURCES = ['VCP Admin Portal', 'VCP Customer Care Portal', 'VCP Partner Portal'];
        // $scope.CMS_RBT_TROUBLESHOOTING_ENTITY_TYPES = ['TONE', 'PLAYLIST', 'CATEGORY', 'SUBCATEGORY', 'ARTIST', 'SERVICE', 'SIGNATURE', 'DIY'];
        $scope.CMS_RBT_TROUBLESHOOTING_ENTITY_TYPES = ['TONE', 'PLAYLIST'];
        $scope.CMS_RBT_TROUBLESHOOTING_OPERATIONS = ['CREATE', 'UPDATE', 'ACTIVATE', 'REJECT', 'HIDE', 'SUSPEND', 'INACTIVATE', 'MOVE', 'STATE_CHANGE'];
        $scope.CMS_RBT_TROUBLESHOOTING_OPERATION_TYPES = ['CREATED', 'UPDATED', 'BULK', 'PENDING', 'REJECTED', 'ACTIVE', 'INACTIVE', 'HIDDEN', 'SUSPENDED'];

        var organizations = Restangular.stripRestangular(allOrganizations);
        $scope.allOrganizations = _.each(organizations.organizations, function (organization) {
            var serviceProviderLegacyIDProfiles = CMPFService.getProfileAttributes(organization.profiles, CMPFService.SERVICE_PROVIDER_LEGACY_ID_PROFILE);
            if (serviceProviderLegacyIDProfiles.length > 0) {
                organization.serviceProviderLegacyIDProfile = angular.copy(serviceProviderLegacyIDProfiles[0]);
            }
            organization.displayName = organization.name + (organization.serviceProviderLegacyIDProfile? ' (' + organization.serviceProviderLegacyIDProfile.LegacyID + ')' : '');
        });

        $scope.getOrganizationDetail = function (organizationId) {
            var organization = _.find($scope.allOrganizations, function (organization) {
                return organization.id == organizationId;
            });
            return organization.displayName;
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
                //msisdn: dateFilter.msisdn,
                operation: dateFilter.operation,
                operationType: dateFilter.operationType,
                entityAlias: dateFilter.entityAlias,
                entityType: dateFilter.entityType,
                userName: dateFilter.userName,
                resourceName: dateFilter.resourceName
                //startDate: dateFilter.startDate ? $filter('date')(dateFilter.startDate, 'yyyy-MM-dd') + 'T00:00:00' : undefined,
                //endDate: dateFilter.endDate ? $filter('date')(dateFilter.endDate, 'yyyy-MM-dd') + 'T23:59:59' : undefined
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
        $controller('ContentManagementTroubleshootingTableCtrl', {$scope: $scope});
        $controller('ContentManagementTroubleshootingHistoryCtrl', {$scope: $scope});
    });

    ContentManagementTroubleshootingModule.controller('ContentManagementTroubleshootingTableCtrl', function ($scope, $log, $filter, $uibModal, UtilService, NgTableParams, notification, $translate,
                                                                                                             GeneralESService, DateTimeConstants) {

        $log.debug('ContentManagementTroubleshootingTableCtrl');
        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.Timestamp',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'entityType',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.EntityType'
                },
                {
                    fieldName: 'entityId',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.EntityId'
                },
                {
                    fieldName: 'entityAlias',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.EntityAlias'
                },
                {
                    fieldName: 'entityName',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.EntityName'
                },
                {
                    fieldName: 'operation',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.Operation'
                },
                {
                    fieldName: 'operationType',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.OperationType'
                },
                {
                    fieldName: 'userName',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.UserName'
                },
                {
                    fieldName: 'resourceName',
                    headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.ResourceName'
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
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "timestamp": 'desc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter($scope.dateFilter, params);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                if (params.settings().$scope.askService) {
                    GeneralESService.findCMSHistory(filter, additionalFilterFields).then(function (response) {
                        $log.debug("Found records: ", response);

                        // Hide the filter form.
                        $scope.filterFormLayer.isFilterFormOpen = false;

                        $scope.activityHistory.showTable = true;

                        $scope.activityHistory.list = response.hits.hits;

                        params.total(response.hits.total.value ? response.hits.total.value : response.hits.total);
                        $defer.resolve($scope.activityHistory.list);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                }
            }
        });
        // END - Activity history list definitions

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subsystems/contentmanagement/troubleshooting/troubleshooting.edr.details.html',
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

    });

    ContentManagementTroubleshootingModule.controller('ContentManagementTroubleshootingHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                               GeneralESService, DateTimeConstants) {
        $log.debug('ContentManagementTroubleshootingHistoryCtrl');

        // Subscription Management detail history list
        var activityHistoryDetailedHistoryList = {
            list: [],
            tableParams: {}
        };
        activityHistoryDetailedHistoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "_source.timestamp": 'asc'
            }
        }, {
            $scope: $scope,
            getData: function ($defer, params) {
                var orderedData = params.sorting() ? $filter('orderBy')(activityHistoryDetailedHistoryList.list, params.orderBy()) : activityHistoryDetailedHistoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Subscription Management detail history list

        // History modal window.
        $scope.showHistory = function (edrRecord) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'subsystems/contentmanagement/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $filter, $uibModalInstance, cmsEdrs, edrRecord, activityHistoryDetailedHistoryList) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'timestamp',
                                headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.Time',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'msisdn',
                                headerKey: 'Subsystems.ContentManagement.Troubleshooting.TableColumns.Msisdn'
                            }
                        ]
                    };

                    $scope.msisdn = edrRecord.msisdn;

                    $scope.activityHistoryDetailedHistoryList = activityHistoryDetailedHistoryList;
                    $scope.activityHistoryDetailedHistoryList.list = $filter('orderBy')(cmsEdrs.hits.hits, '_source.timestamp');

                    var currentList = $scope.activityHistoryDetailedHistoryList.list;
                    if (currentList.length > 0) {
                        $scope.submitDate = currentList[0]._source.timestamp;
                        $scope.completionDate = currentList[currentList.length - 1]._source.timestamp;
                    }

                    $scope.activityHistoryDetailedHistoryList.tableParams.page(1);
                    $scope.activityHistoryDetailedHistoryList.tableParams.reload();

                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    cmsEdrs: function (GeneralESService) {
                        return GeneralESService.findCMSDetailedHistory(edrRecord.subscriptionId, edrRecord.event);
                    },
                    edrRecord: function () {
                        return edrRecord;
                    },
                    activityHistoryDetailedHistoryList: function () {
                        return activityHistoryDetailedHistoryList;
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


