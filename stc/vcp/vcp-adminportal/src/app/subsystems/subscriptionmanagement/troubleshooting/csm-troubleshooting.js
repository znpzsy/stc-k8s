(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.troubleshooting.contentsubscription', []);

    var SubscriptionManagementTroubleshootingContentSubscriptionModule = angular.module('adminportal.subsystems.subscriptionmanagement.troubleshooting.contentsubscription');

    SubscriptionManagementTroubleshootingContentSubscriptionModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.troubleshooting.contentsubscription', {
            url: "/content-subscription",
            templateUrl: "subsystems/subscriptionmanagement/troubleshooting/csm-troubleshooting.html",
            controller: 'SubscriptionManagementTroubleshootingContentSubscriptionCtrl'
        });

    });

    SubscriptionManagementTroubleshootingContentSubscriptionModule.controller('SubscriptionManagementTroubleshootingContentSubscriptionCtrl', function ($scope, $log, $controller, $timeout, $filter, Restangular, UtilService, DateTimeConstants, ContentManagementService, DEFAULT_REST_QUERY_LIMIT,
                                                                                                                                                        CMS_RBT_CONTENT_TYPES, SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT) {
        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_RBT_CONTENT_TYPES = CMS_RBT_CONTENT_TYPES;
        $scope.SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES = SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT;

        $scope.contentOfferList = [];
        $scope.searchContents = _.throttle(function (contentType) {
            $scope.contentOfferList = [];

            var method = null;
            if (contentType === 'CATEGORY') {
                method = ContentManagementService.searchContentCategoriesRBT;
            } else if (contentType === 'MOOD') {
                method = ContentManagementService.searchMoods;
            } else if (contentType === 'ARTIST') {
                method = ContentManagementService.searchArtists;
            } else if (contentType === 'ALBUM') {
                method = ContentManagementService.searchAlbums;
            } else if (contentType === 'PLAYLIST') {
                method = ContentManagementService.searchPlaylists;
            } else if (contentType === 'TONE') {
                method = ContentManagementService.searchTones;
            }

            if (method) {
                method.call(ContentManagementService, 0, DEFAULT_REST_QUERY_LIMIT).then(function (response) {
                    $scope.contentOfferList = (response ? response.items : []);
                    $scope.contentOfferList = $filter('orderBy')($scope.contentOfferList, ['name']);
                });
            }
        }, 500);

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
                contentType: dateFilter.contentType,
                contentId: dateFilter.contentId,
                channelType: dateFilter.channelType
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
        $controller('SubscriptionManagementTroubleshootingContentSubscriptionTableCtrl', {$scope: $scope});
        $controller('SubscriptionManagementTroubleshootingContentSubscriptionHistoryCtrl', {$scope: $scope});
    });

    SubscriptionManagementTroubleshootingContentSubscriptionModule.controller('SubscriptionManagementTroubleshootingContentSubscriptionTableCtrl', function ($scope, $log, $filter, $uibModal, UtilService, NgTableParams, notification, $translate,
                                                                                                                                                             GeneralESService, DateTimeConstants) {
        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'timestamp',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.Time',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'msisdn',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.Msisdn'
                },
                {
                    fieldName: 'transactionId',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.TransactionId'
                },
                {
                    fieldName: 'offerName',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.OfferName'
                },
                {
                    fieldName: 'event',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.EventType',
                    filter: {name: 'SubscriptionManagementEventTypeFilter'}
                },
                {
                    fieldName: 'channelType',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.ChannelType',
                    filter: {name: 'SubscriptionManagementChannelTypeFilter'}
                },
                {
                    fieldName: 'state',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.State'
                },
                {
                    fieldName: 'inactivationReason',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.InactivationReason'
                },
                {
                    fieldName: 'subscriberNotificationType',
                    headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.SubscriberNotificationType'
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
                    GeneralESService.findCSMHistory(filter, additionalFilterFields).then(function (response) {
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
                templateUrl: 'subsystems/subscriptionmanagement/troubleshooting/troubleshooting.edr.details.html',
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

    SubscriptionManagementTroubleshootingContentSubscriptionModule.controller('SubscriptionManagementTroubleshootingContentSubscriptionHistoryCtrl', function ($scope, $log, $filter, notification, $translate, $uibModal, NgTableParams,
                                                                                                                                                               GeneralESService, DateTimeConstants) {
        $log.debug('SubscriptionManagementTroubleshootingContentSubscriptionHistoryCtrl');

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
                templateUrl: 'subsystems/subscriptionmanagement/troubleshooting/troubleshooting.edr.history.html',
                controller: function ($scope, $filter, $uibModalInstance, ssmEdrs, edrRecord, activityHistoryDetailedHistoryList) {
                    edrRecord.rowSelected = true;

                    $scope.historyExportOptions = {
                        columns: [
                            {
                                fieldName: 'timestamp',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.Time',
                                filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                            },
                            {
                                fieldName: 'msisdn',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.Msisdn'
                            },
                            {
                                fieldName: 'transactionId',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.TransactionId'
                            },
                            {
                                fieldName: 'offerName',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.OfferName'
                            },
                            {
                                fieldName: 'event',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.EventType',
                                filter: {name: 'SubscriptionManagementEventTypeFilter'}
                            },
                            {
                                fieldName: 'errorCode',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.ErrorCode',
                                filter: {name: 'SubscriptionManagementErrorCodeFilter'}
                            },
                            {
                                fieldName: 'error',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.ErrorDescription'
                            },
                            {
                                fieldName: 'channelType',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.ChannelType',
                                filter: {name: 'SubscriptionManagementChannelTypeFilter'}
                            },
                            {
                                fieldName: 'state',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.State'
                            },
                            {
                                fieldName: 'inactivationReason',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.InactivationReason'
                            },
                            {
                                fieldName: 'subscriberNotificationType',
                                headerKey: 'Subsystems.SubscriptionManagement.Troubleshooting.TableColumns.SubscriberNotificationType'
                            }
                        ]
                    };

                    $scope.edrRecord = edrRecord;

                    $scope.activityHistoryDetailedHistoryList = activityHistoryDetailedHistoryList;
                    $scope.activityHistoryDetailedHistoryList.list = $filter('orderBy')(ssmEdrs.hits.hits, '_source.timestamp');

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
                    ssmEdrs: function (GeneralESService) {
                        return GeneralESService.findCSMDetailedHistory(edrRecord.subscriptionId, edrRecord.event);
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


