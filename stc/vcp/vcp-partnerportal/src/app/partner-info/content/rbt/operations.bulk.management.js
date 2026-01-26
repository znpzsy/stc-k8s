(function () {

    'use strict';

    angular.module('partnerportal.partner-info.operations.rbt.bulk.management', []);

    var PartnerInfoContentManagementBulkRBTManagementModule = angular.module('partnerportal.partner-info.operations.rbt.bulk.management');

    PartnerInfoContentManagementBulkRBTManagementModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.operations.rbt.bulk.management', {
            abstract: true,
            url: "/management",
            template: '<div ui-view></div>'
        })
        // list state
        .state('partner-info.operations.rbt.bulk.management.list', {
            url: "/list",
            templateUrl: "partner-info/content/rbt/operations.bulk.management.html",
            controller: 'PartnerInfoContentManagementBulkRBTManagementCtrl'
        })

    });

    PartnerInfoContentManagementBulkRBTManagementModule.controller('PartnerInfoContentManagementBulkRBTManagementCommonCtrl', function ($scope, $log, $q, $translate, $uibModal, $timeout, $window, $state, $controller, $filter, notification, NgTableParams, NgTableService,
                                                                                                                         Restangular, UtilService, SessionService, ContentManagementService, CMPFService, FileDownloadService, CMS_RBT_STATUS_TYPES) {
        $log.debug('ContentManagementBulkOperationsManagementCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_RBT_STATUS_TYPES = CMS_RBT_STATUS_TYPES;

        $scope.username = SessionService.getUsername();
        $scope.sessionOrganization = SessionService.getSessionOrganization();
        $scope.selectAll = false;
        $scope.selectedTones = [];
        $scope.preSelectedTones = [];
        $scope.loading_tone = [];

        $scope.dateFilter = {
            status: 'REJECTED',
            startDate: undefined,
            endDate: undefined,
            blacklisted: undefined,
            promoted: undefined,
            subscriptionEnabled: undefined,
            alias: '',
            categoryId: null,
            artistId: null,
            playlistId: null
        };


        // --- Filter Form / Search Filters:

        // $scope.$watch('dateFilter', function(newStatus, oldStatus) {
        //     if (newStatus !== oldStatus) {
        //         $scope.throttledReloadTable();
        //     }
        // });

        // END --- Filter Form / Search Filters

    });



    PartnerInfoContentManagementBulkRBTManagementModule.controller('PartnerInfoContentManagementBulkRBTManagementCtrl', function ($scope, $log, $q, $translate, $timeout, $window, $state, $controller, $filter, notification, NgTableParams, NgTableService, Restangular, UtilService, SessionService, ContentManagementService, CMPFService, FileDownloadService) {
        $log.debug('PartnerInfoContentManagementBulkRBTManagementCtrl');
        $controller('PartnerInfoContentManagementRBTCommonCtrl', {$scope: $scope});
        $controller('PartnerInfoContentManagementBulkRBTManagementCommonCtrl', {$scope: $scope});
        $controller('ListViewsAudioController', {$scope: $scope});

        // --- Results Table:
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

        $scope.throttledReloadTable = _.throttle(function () {
            $scope.reloadTable($scope.contentMetadataList.tableParams, true);
        }, 500);

        $scope.prepareFilter = function (tableParams, dateFilter) {
            var result = {};

            result.filter = {
            };

            result.additionalFilterFields = {
                statuses: dateFilter.status ? [dateFilter.status] : [],
                organizationId: $scope.sessionOrganization.id,
                promoted: dateFilter.promoted,
                blacklisted: dateFilter.blacklisted,
                subscriptionEnabled: dateFilter.subscriptionEnabled,
                alias: dateFilter.alias,
                categoryId: dateFilter.categoryId,
                subcategory: dateFilter.subcategory,
                artistId: dateFilter.artistId
            };

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? 'ASC' : 'DESC';
                result.filter.limit = tableParams.count();
                result.filter.page = tableParams.page() - 1;

                result.filter.filterText = tableParams.settings().$scope.filterText;
                result.filter.filterColumns = tableParams.settings().$scope.filterColumns;
            }

            return result;
        };

        // Tone list
        $scope.contentMetadataList = {
            list: [],
            showTable: true,
            tableParams: {}
        };
        $scope.originalContentMetadatas = angular.copy($scope.contentMetadataList.list);

        $scope.contentMetadataList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter(params, $scope.dateFilter);

                var filter = preparedFilter.filter;
                var additionalFilterFields = preparedFilter.additionalFilterFields;

                ContentManagementService.searchTonesByRichFilter(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, filter.filterText, additionalFilterFields).then(function (response) {
                    $log.debug("Found records: ", response);

                    $scope.contentMetadataList.list = (response ? response.items : []);

                    params.total(response ? response.totalCount : 0);
                    $defer.resolve($scope.contentMetadataList.list);
                }, function (error) {
                    $log.debug('Error: ', error);
                    params.total(0);
                    $defer.resolve([]);
                });
                $scope.stopAudio();
            }
        });
        // END - Tone list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentMetadataList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentMetadataList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentMetadataList.tableParams.page(1);
            $scope.contentMetadataList.tableParams.reload();
        }, 750);
        // END --- Results Table

    });





})();
