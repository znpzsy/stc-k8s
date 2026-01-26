(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contenttypes', []);

    var ContentManagementOperationsContentTypesModule = angular.module('adminportal.subsystems.contentmanagement.operations.dsp.contenttypes');

    ContentManagementOperationsContentTypesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.dsp.contenttypes', {
            abstract: true,
            url: "/content-types",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ContentTypes',
                permissions: [
                    'CMS__OPERATIONS_CONTENTTYPE_READ'
                ]
            },
            resolve: {
                contentTypes: function (ContentManagementService) {
                    return ContentManagementService.getContentTypes();
                }
            }
        }).state('subsystems.contentmanagement.operations.dsp.contenttypes.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contenttypes.html",
            controller: 'ContentManagementOperationsContentTypesCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contenttypes.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contenttypes.details.html",
            controller: 'ContentManagementOperationsContentTypesNewCtrl'
        }).state('subsystems.contentmanagement.operations.dsp.contenttypes.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/dsp/operations.contenttypes.details.html",
            controller: 'ContentManagementOperationsContentTypesUpdateCtrl'
        });

    });

    ContentManagementOperationsContentTypesModule.controller('ContentManagementOperationsContentTypesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, ContentManagementService) {
        $log.debug('ContentManagementOperationsContentTypesCommonCtrl');

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.dsp.contenttypes.list');
        };
    });

    ContentManagementOperationsContentTypesModule.controller('ContentManagementOperationsContentTypesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                      contentTypes, DateTimeConstants, ContentManagementService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ContentManagementOperationsContentTypesCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentTypes.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.ContentTypes.ContentType'
                },
                {
                    fieldName: 'userCreated',
                    headerKey: 'CommonLabels.CreatedBy'
                },
                {
                    fieldName: 'dateCreated',
                    headerKey: 'CommonLabels.CreatedOn',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'userUpdated',
                    headerKey: 'CommonLabels.LastUpdatedBy'
                },
                {
                    fieldName: 'dateUpdated',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                }
            ]
        };

        // content type list
        $scope.contentTypeList = {
            list: contentTypes.detail,
            tableParams: {}
        };

        $scope.contentTypeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.contentTypeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentTypeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentTypeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - content type list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentTypeList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentTypeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentTypeList.tableParams.page(1);
            $scope.contentTypeList.tableParams.reload();
        }, 750);

        $scope.remove = function (contentType) {
            contentType.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                contentType.rowSelected = false;

                $log.debug('Removing content type: ', contentType);

                ContentManagementService.deleteContentType(contentType).then(function (response) {
                    $log.debug('Removed content type: ', contentType, ', response: ', response);

                    if (response.code !== 2003) {
                        ContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.contentTypeList.list, {id: contentType.id});
                        $scope.contentTypeList.list = _.without($scope.contentTypeList.list, deletedListItem);

                        $scope.contentTypeList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove content type: ', contentType, ', response: ', response);

                    ContentManagementService.showApiError(response);
                });
            }, function () {
                contentType.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsContentTypesModule.controller('ContentManagementOperationsContentTypesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, DateTimeConstants, UtilService, SessionService,
                                                                                                                         ContentManagementService) {
        $log.debug('ContentManagementOperationsContentTypesNewCtrl');

        $controller('ContentManagementOperationsContentTypesCommonCtrl', {
            $scope: $scope
        });

        $scope.contentType = {
            name: null
        };

        var showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.go('subsystems.contentmanagement.operations.dsp.contenttypes.list');
        };

        $scope.save = function (contentType) {
            var currentDateTime = new Date();
            var username = SessionService.getUsername();

            var contentTypeItem = {
                "name": contentType.name,
                "userCreated": username
            };

            $log.debug('Creating content type: ', contentTypeItem);

            ContentManagementService.createContentType(contentTypeItem).then(function (response) {
                $log.debug('Created content type: ', contentTypeItem, ', response: ', response);

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
                $log.debug('Cannot create content type: ', contentTypeItem, ', response: ', response);

                ContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsContentTypesModule.controller('ContentManagementOperationsContentTypesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, DateTimeConstants, UtilService,
                                                                                                                            SessionService, ContentManagementService, contentTypes) {
        $log.debug('ContentManagementOperationsContentTypesUpdateCtrl');

        $controller('ContentManagementOperationsContentTypesCommonCtrl', {
            $scope: $scope
        });

        var id = $stateParams.id;

        $scope.contentType = {};
        if (contentTypes && contentTypes.detail) {
            $scope.contentType = _.findWhere(contentTypes.detail, {id: id});
        }

        $scope.originalContentType = angular.copy($scope.contentType);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentType, $scope.contentType);
        };

        $scope.save = function (contentType) {
            var currentDateTime = new Date();
            var username = SessionService.getUsername();

            var contentTypeItem = {
                "id": $scope.originalContentType.id,
                "userCreated": $scope.originalContentType.userCreated,
                "dateCreated": $scope.originalContentType.dateCreated,
                // Changed values
                "name": contentType.name,
                "userUpdated": username
            };

            $log.debug('Creating content type: ', contentTypeItem);

            ContentManagementService.updateContentType(contentTypeItem).then(function (response) {
                $log.debug('Created content type: ', contentTypeItem, ', response: ', response);

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
                $log.debug('Cannot create content type: ', contentTypeItem, ', response: ', response);

                ContentManagementService.showApiError(response);
            });
        };
    });

})();
