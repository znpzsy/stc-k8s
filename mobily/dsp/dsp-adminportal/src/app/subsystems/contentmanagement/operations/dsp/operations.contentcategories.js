(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentcategories', []);

    var ContentManagementOperationsContentCategoriesModule = angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contentcategories');

    ContentManagementOperationsContentCategoriesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.dsp.contentcategories', {
            abstract: true,
            url: "/content-categories",
            template: '<div ui-view></div>',
            data: {
                type: 'dsp',
                exportFileName: 'ContentCategoriesDSP',
                permissions: [
                    'CMS__OPERATIONS_CONTENTCATEGORY_READ'
                ]
            },
            resolve: {
                contentCategories: function (ContentManagementService) {
                    return ContentManagementService.getContentCategories();
                }
            }
        }).state('subsystems.contentmanagement.operations.dsp.contentcategories.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentcategories.html",
            controller: 'ContentManagementOperationsContentCategoriesCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contentcategories.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentcategories.details.html",
            controller: 'ContentManagementOperationsContentCategoriesNewCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contentcategories.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contentcategories.details.html",
            controller: 'ContentManagementOperationsContentCategoriesUpdateCtrl'
        });

    });

    ContentManagementOperationsContentCategoriesModule.controller('ContentManagementOperationsContentCategoriesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, ContentManagementService,
                                                                                                                                      contentCategories) {
        $log.debug('ContentManagementOperationsContentCategoriesCommonCtrl');

        $scope.contentCategoryList = contentCategories.detail;
        $scope.contentCategoryList = $filter('orderBy')($scope.contentCategoryList, 'title');

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.dsp.contentcategories.list');
        };
    });

    ContentManagementOperationsContentCategoriesModule.controller('ContentManagementOperationsContentCategoriesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                contentCategories, DateTimeConstants, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentCategoriesCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentCategories.Id'
                },
                {
                    fieldName: 'title',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentCategories.ContentCategory'
                },
                {
                    fieldName: 'order',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentCategories.Order'
                }
            ]
        };

        _.each(contentCategories.detail, function (contentCategory) {
            if (contentCategory.parent) {
                var foundContentCategory = _.findWhere(contentCategories.detail, {id: contentCategory.parent});
                if (foundContentCategory) {
                    contentCategory.parentCategory = {
                        title: foundContentCategory.title
                    };
                } else {
                    contentCategory.parentCategory = {
                        title: 'N/A'
                    };
                }
            } else {
                contentCategory.parentCategory = {
                    title: '-'
                };
            }
        });

        // Content category list
        $scope.contentCategoryList = {
            list: contentCategories.detail,
            tableParams: {}
        };

        $scope.contentCategoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.contentCategoryList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentCategoryList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentCategoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Content category list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentCategoryList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentCategoryList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentCategoryList.tableParams.page(1);
            $scope.contentCategoryList.tableParams.reload();
        }, 750);

        $scope.remove = function (contentCategory) {
            contentCategory.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentCategory.rowSelected = false;

                $log.debug('Removing content category: ', contentCategory);

                ContentManagementService.deleteContentCategory(contentCategory).then(function (response) {
                    $log.debug('Removed content category: ', contentCategory, ', response: ', response);

                    if (response.code !== 2003) {
                        ContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.contentCategoryList.list, {id: contentCategory.id});
                        $scope.contentCategoryList.list = _.without($scope.contentCategoryList.list, deletedListItem);

                        $scope.contentCategoryList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove content category: ', contentCategory, ', response: ', response);

                    ContentManagementService.showApiError(response);
                });
            }, function () {
                contentCategory.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentCategoriesModule.controller('ContentManagementOperationsContentCategoriesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, UtilService, ContentManagementService,
                                                                                                                                   contentCategories) {
        $log.debug('ContentManagementOperationsContentCategoriesNewCtrl');

        $controller('ContentManagementOperationsContentCategoriesCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories
        });

        $scope.contentCategory = {
            title: null,
            order: null
        };

        var showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.go('subsystems.contentmanagement.operations.dsp.contentcategories.list');
        };

        $scope.save = function (contentCategory) {
            var contentCategoryItem = {
                "title": contentCategory.title,
                "description": contentCategory.description,
                "parent": contentCategory.parent,
                "order": contentCategory.order
            };

            $log.debug('Creating content category: ', contentCategoryItem);

            ContentManagementService.createContentCategory(contentCategoryItem).then(function (response) {
                $log.debug('Created content category: ', contentCategoryItem, ', response: ', response);

                if (response.code !== 2001) {
                    ContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot create content category: ', contentCategoryItem, ', response: ', response);

                ContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsContentCategoriesModule.controller('ContentManagementOperationsContentCategoriesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                                      ContentManagementService, contentCategories) {
        $log.debug('ContentManagementOperationsContentCategoriesUpdateCtrl');

        $controller('ContentManagementOperationsContentCategoriesCommonCtrl', {
            $scope: $scope,
            contentCategories: contentCategories
        });

        var id = $stateParams.id;

        // Remove the category itself from the parent list.
        var deletedCategoryItem = _.findWhere($scope.contentCategoryList, {id: id});
        $scope.contentCategoryList = _.without($scope.contentCategoryList, deletedCategoryItem);

        $scope.contentCategory = {};
        if (contentCategories && contentCategories.detail) {
            $scope.contentCategory = _.findWhere(contentCategories.detail, {id: id});
        }

        $scope.originalContentCategory = angular.copy($scope.contentCategory);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentCategory, $scope.contentCategory);
        };

        $scope.save = function (contentCategory) {
            var contentCategoryItem = {
                "id": $scope.originalContentCategory.id,
                // Changed values
                "title": contentCategory.title,
                "description": contentCategory.description,
                "parent": contentCategory.parent,
                "order": contentCategory.order
            };

            $log.debug('Updating content category: ', contentCategoryItem);

            ContentManagementService.updateContentCategory(contentCategoryItem).then(function (response) {
                $log.debug('Updated content category: ', contentCategoryItem, ', response: ', response);

                if (response.code === 2002) {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                } else {
                    ContentManagementService.showApiError(response);
                }
            }, function (response) {
                $log.debug('Cannot update content category: ', contentCategoryItem, ', response: ', response);

                ContentManagementService.showApiError(response);
            });
        };
    });

})();
