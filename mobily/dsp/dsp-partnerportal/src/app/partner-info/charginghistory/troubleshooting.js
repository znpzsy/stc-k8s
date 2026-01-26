(function () {

    'use strict';

    angular.module('partnerportal.partner-info.charginggw.troubleshooting', []);

    var ChargingGwTroubleshootingModule = angular.module('partnerportal.partner-info.charginggw.troubleshooting');

    ChargingGwTroubleshootingModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.charginggw', {
            abstract: true,
            url: "/charging",
            template: "<div ui-view></div>"
        }).state('partner-info.charginggw.troubleshooting', {
            url: "/history",
            templateUrl: "partner-info/charginghistory/troubleshooting.html",
            controller: 'ChargingGwTroubleshootingCtrl',
            resolve: {
                services: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getServicesByOrganizationId(organizationId, true);
                },
                offers: function ($rootScope, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    var organizationId = $rootScope.getOrganizationId();

                    return CMPFService.getOffersByOrganizationId(organizationId, true);
                }
            }
        });

    });

    ChargingGwTroubleshootingModule.controller('ChargingGwTroubleshootingCtrl', function ($scope, $log, $controller, $timeout, $filter, $uibModal, Restangular, UtilService, DateTimeConstants,
                                                                                          GeneralESService, ReportingExportService, services, offers) {
        $log.debug('ChargingGwTroubleshootingCtrl');

        // TODO - Temporarily hidden
        return;

        // Calling the date time controller which initializes date/time pickers and necessary functions.
        $controller('GenericDateTimeCtrl', {$scope: $scope});

        var organizationId = $scope.getOrganizationId();

        $scope.filterFormLayer = {
            isFilterFormOpen: true
        };

        var serviceList = Restangular.stripRestangular(services).services;
        $scope.serviceList = $filter('orderBy')(serviceList, ['name']);

        var offerList = Restangular.stripRestangular(offers).offers;
        $scope.offerList = $filter('orderBy')(offerList, ['name']);

        // Filter initializations
        $scope.dateFilter.startDate = $scope.getOneWeekAgo();
        $scope.dateFilter.startTime = $scope.getOneWeekAgo();

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

        $scope.exportRecords = function (mimeType) {
            var preparedFilter = $scope.prepareFilter($scope.dateFilter, $scope.activityHistory.tableParams);

            var filter = preparedFilter.filter;
            var additionalFilterFields = preparedFilter.additionalFilterFields;

            var bodyPayload = GeneralESService.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);
            var bodyPayloadStr = JSON.stringify(bodyPayload);

            var srcUrl = '/chggw-rest/rest/v1/elastic-search-adapter/_export';
            srcUrl += '?response-content-type=' + mimeType;
            srcUrl += '&query=' + encodeURIComponent(bodyPayloadStr);

            $log.debug('Downloading Charging Gw Records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

        $scope.prepareFilter = function (dateFilter, tableParams) {
            var result = {};

            var startDateIso = $filter('date')(dateFilter.startDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);
            var endDateIso = $filter('date')(dateFilter.endDate, 'yyyy-MM-dd\'T\'HH:mm:ss.sss' + DateTimeConstants.OFFSET);

            result.filter = {
                providerId: organizationId,
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
                                                                                               UtilService, GeneralESService, DateTimeConstants, TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION) {
        $log.debug('ChargingGwTroubleshootingTableCtrl');

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

                var offer = _.findWhere($scope.offerList, {id: Number(record.offerId)});
                record.offerName = offer ? offer.name + ' [' + record.offerId + ']' : record.offerId;

                record.errorCodeText = $filter('ChargingGwErrorCodeFilter')(record.errorCode) + ' [' + record.errorCode + ']';
                record.eventText = $filter('ChargingGwEventFilter')(record.event) + ' [' + record.event + ']';
            });

            return list;
        };

        // Details modal window.
        $scope.showDetails = function (edrRecord) {
            edrRecord.rowSelected = true;

            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'partner-info/charginghistory/troubleshooting.edr.details.html',
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
    });

})();
