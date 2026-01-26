(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.contenttypefilters', []);

    var MMSCOperationsContentTypeFiltersModule = angular.module('adminportal.products.mmsc.operations.contenttypefilters');

    MMSCOperationsContentTypeFiltersModule.config(function ($stateProvider) {

        $stateProvider.state('products.mmsc.operations.contenttypefilters', {
            abstract: true,
            url: "/contenttypefilters",
            templateUrl: "products/mmsc/operations/operations.abstract.html"
        }).state('products.mmsc.operations.contenttypefilters.list', {
            url: "/list",
            templateUrl: "products/mmsc/operations/operations.contenttypefilters.html",
            controller: 'MMSCOperationsContentTypeFiltersCtrl',
            resolve: {
                restrictedMediaTypes: function (MmscContentFilteringService) {
                    return MmscContentFilteringService.getRestrictedMediaTypes();
                }
            }
        }).state('products.mmsc.operations.contenttypefilters.new', {
            url: "/contenttypefilters/new",
            templateUrl: "products/mmsc/operations/operations.contenttypefilters.details.html",
            controller: 'MMSCContentTypeFiltersNewCtrl'
        });

    });

    MMSCOperationsContentTypeFiltersModule.controller('MMSCOperationsContentTypeFiltersCtrl', function ($scope, $state, $log, $filter, $uibModal, UtilService, ReportingExportService,
                                                                                                        $translate, notification, NgTableParams, NgTableService,
                                                                                                        restrictedMediaTypes, MmscContentFilteringService) {
        $log.debug('MMSCOperationsContentTypeFiltersCtrl');

        // Media type list
        $scope.mediaList = {
            list: restrictedMediaTypes.mediaList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.mediaList.tableParams.settings().$scope.filterText = filterText;
            $scope.mediaList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.mediaList.tableParams.page(1);
            $scope.mediaList.tableParams.reload();
        }, 500);

        $scope.mediaList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "mainType": 'asc'
            }
        }, {
            total: $scope.mediaList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.mediaList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.mediaList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Media list definitions

        // Delete methods and modal window definitions
        $scope.remove = function (mediaType) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                resolve: {},
                controller: function ($scope, $uibModalInstance, $translate, $sce) {
                    var message = $translate.instant('Products.MMSC.Operations.ContentFilters.ContentType.Messages.DeleteConfirmationMessage', {
                        main_type: mediaType.mainType,
                        sub_type: mediaType.subType
                    });
                    $scope.confirmationMessage = $sce.trustAsHtml(message);
                    $scope.ok = function () {
                        $uibModalInstance.close(mediaType);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            });

            modalInstance.result.then(function (mediaType) {
                MmscContentFilteringService.deleteRestrictedMediaType(mediaType.mainType, mediaType.subType).then(function (response) {
                    if (response && (response.errorCode || response.code)) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.errorCode || response.code,
                                errorText: response.errorMsg || response.message
                            })
                        });
                    } else {
                        // Remove from the actual list.
                        if (!_.isEmpty($scope.mediaList.list) && response) {
                            var deletedListItem = _.findWhere($scope.mediaList.list, {
                                mainType: mediaType.mainType,
                                subType: mediaType.subType
                            });
                            $scope.mediaList.list = _.without($scope.mediaList.list, deletedListItem);
                            $scope.mediaList.tableParams.reload();

                            $log.debug('Item with this main type ', deletedListItem.mainType, ' and sub type ', deletedListItem.subType, ' has been deleted successfully.');

                            notification({
                                type: 'success',
                                text: $translate.instant('Products.MMSC.Operations.ContentFilters.ContentType.Messages.DeletedSuccessfully', {
                                    main_type: deletedListItem.mainType,
                                    sub_type: deletedListItem.subType
                                })
                            });
                        }
                    }
                }, function (response) {
                    $log.debug('Error: ', response);
                });
            }, function () {
                // Dismissed
            });
        };

        $scope.exportRecords = function (mimeType) {
            var srcUrl = '/mmsc-operation-gr-rest/v1/restrictedmediatypes/export?response-content-type=' + mimeType;

            $log.debug('Downloading MMSC content type filter records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    MMSCOperationsContentTypeFiltersModule.controller('MMSCContentTypeFiltersNewCtrl', function ($scope, $state, $log, $translate, notification, MMSC_MAIN_CONTENT_TYPE_LIST,
                                                                                                 MmscContentFilteringService) {
        $log.debug('MMSCContentTypeFiltersNewCtrl');

        $scope.MMSC_MAIN_CONTENT_TYPE_LIST = MMSC_MAIN_CONTENT_TYPE_LIST;

        $scope.contentTypeFilters = {
            subContentType: ''
        };

        $scope.save = function (contentTypeFilters) {
            var mediaType = {
                mainType: contentTypeFilters.mainContentType.name,
                subType: contentTypeFilters.subContentType
            };

            MmscContentFilteringService.addRestrictedMediaType(mediaType).then(function (response) {
                if (response && (response.errorCode || response.code)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.code,
                            errorText: response.errorMsg || response.message
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('Products.MMSC.Operations.ContentFilters.ContentType.Messages.AddedSuccessfully', {
                            main_type: mediaType.mainType,
                            sub_type: mediaType.subType
                        })
                    });

                    $scope.go('products.mmsc.operations.contenttypefilters.list');
                }
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.mmsc.operations.contenttypefilters.list');
        };
    });

})();
